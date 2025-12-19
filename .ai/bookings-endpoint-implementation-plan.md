# API Endpoint Implementation Plan: Bookings

Plan ten opisuje kroki niezbędne do wdrożenia obsługi rezerwacji (Bookings) zgodnie z architekturą REST API, przy użyciu Astro, Supabase i TypeScript.

## 1. Przegląd punktu końcowego

Moduł `Bookings` odpowiada za zarządzanie rezerwacjami miejsc parkingowych. Obejmuje wyświetlanie rezerwacji w widoku kalendarza, obliczanie kosztów przed rezerwacją, tworzenie nowych rezerwacji oraz ich modyfikację.

Kluczowe pliki do utworzenia/modyfikacji:
- `src/lib/services/bookings.ts` (Logika biznesowa)
- `src/pages/api/bookings/index.ts` (List & Create)
- `src/pages/api/bookings/preview.ts` (Cost & Availability Calculation)
- `src/pages/api/bookings/[id].ts` (Details & Update)

## 2. Wymagane Schematy Walidacji (Zod)

Należy zdefiniować schematy w pliku walidacji `src/lib/validation/bookings.ts`, aby zapewnić poprawność danych przed przekazaniem ich do serwisu.

```typescript
import { z } from "zod";

// Query Params dla GET /bookings
export const listBookingsQuerySchema = z.object({
  location_id: z.string().uuid(),
  start_date: z.string().date(), // YYYY-MM-DD
  end_date: z.string().date(),
});

// Body dla POST /bookings/preview
export const previewBookingSchema = z.object({
  location_id: z.string().uuid(),
  spot_id: z.string().uuid(),
  start_date: z.string().date(),
  end_date: z.string().date().optional(), // Nullable dla 'permanent'
  type: z.enum(['permanent', 'periodic']),
}).refine(data => {
  if (data.type === 'periodic' && !data.end_date) return false;
  if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) return false;
  return true;
}, { message: "Invalid date range or missing end_date for periodic type" });

// Body dla POST /bookings (Create)
// Rozszerza preview o client_id
export const createBookingSchema = previewBookingSchema.and(z.object({
  client_id: z.string().uuid(),
}));

// Body dla PATCH /bookings/:id
export const updateBookingSchema = z.object({
  payment_status: z.enum(['oplacone', 'nieoplacone']).optional(),
  status: z.enum(['aktywna', 'zakonczona', 'zalegla']).optional(),
  end_date: z.string().date().optional(),
});
```

## 3. Warstwa Serwisu (`src/lib/services/bookings.ts`)

Serwis powinien przyjmować instancję `SupabaseClient` (z kontekstu żądania) i realizować logikę.

### Metody serwisu:

1.  **`listBookings(params: { locationId, startDate, endDate })`**
    *   Pobiera rezerwacje, których zakres dat nakłada się na podany przedział.
    *   Zapytanie SQL (Supabase) powinno sprawdzać: `start_date <= params.endDate AND (end_date IS NULL OR end_date >= params.startDate)`.
    *   Zwraca `BookingDTO[]`.

2.  **`calculatePreview(cmd: PreviewBookingCmd)`**
    *   **Krok 1 (Availability):** Sprawdza, czy dla `spot_id` istnieje inna rezerwacja o statusie `aktywna` w podanym terminie.
        *   Jeśli konflikt: rzuca błąd (lub zwraca `available: false`).
    *   **Krok 2 (Cost):**
        *   Pobiera `daily_rate` i `monthly_rate` z tabeli `locations`.
        *   Pobiera rekordy z `price_exceptions` dla danej lokalizacji w zadanym terminie.
        *   Iteruje po dniach rezerwacji:
            *   Baza = stawka dzienna.
            *   Modyfikator = sprawdzenie czy dzień wpada w `price_exception`.
            *   Suma = `total_cost`.
    *   Zwraca `PreviewBookingResponse`.

3.  **`createBooking(cmd: CreateBookingCmd)`**
    *   Wywołuje logikę sprawdzania dostępności.
    *   Oblicza ostateczny `cost` (używając logiki z preview).
    *   Wykonuje `insert` do tabeli `bookings`.
    *   Zwraca ID nowej rezerwacji.

4.  **`getBookingById(id: string)`**
    *   Pobiera rezerwację z joinem do `clients`, `spots`, `locations`.
    *   Zwraca `BookingDetailDTO`.

5.  **`updateBooking(id: string, cmd: UpdateBookingCmd)`**
    *   Wykonuje `update`.
    *   Jeśli zmienia się `payment_status`, trigger bazy danych obsłuży logi, ale API po prostu aktualizuje pole.
    *   Jeśli zmienia się `end_date`, należy zwalidować czy nowa data nie jest wcześniejsza niż `start_date`.

## 4. Szczegóły punktów końcowych

### 4.1. List & Create (`src/pages/api/bookings/index.ts`)

*   **GET**
    *   Walidacja Query params (`listBookingsQuerySchema`).
    *   Wywołanie `BookingsService.listBookings`.
    *   Response: `200 OK` z tablicą JSON.
*   **POST**
    *   Walidacja Body (`createBookingSchema`).
    *   Wywołanie `BookingsService.createBooking`.
    *   Obsługa błędu kolizji: Jeśli serwis zgłosi konflikt -> `409 Conflict`.
    *   Response: `201 Created` z `{ id: string }`.

### 4.2. Preview (`src/pages/api/bookings/preview.ts`)

*   **POST**
    *   Walidacja Body (`previewBookingSchema`).
    *   Wywołanie `BookingsService.calculatePreview`.
    *   Response: `200 OK` z obiektem `PreviewBookingResponse`.
    *   Uwaga: Nawet jeśli termin jest zajęty, endpoint może zwrócić `200` z `available: false` lub `409 Conflict` - zgodnie ze specyfikacją frontendu. Zgodnie z planem API: `409 Conflict` if spot occupied.

### 4.3. Details & Update (`src/pages/api/bookings/[id].ts`)

*   **GET**
    *   Pobranie `id` z parametrów.
    *   Wywołanie `BookingsService.getBookingById`.
    *   Jeśli brak -> `404 Not Found`.
    *   Response: `200 OK` z `BookingDetailDTO`.
*   **PATCH**
    *   Walidacja Body (`updateBookingSchema`).
    *   Wywołanie `BookingsService.updateBooking`.
    *   Response: `200 OK`.

## 5. Obsługa błędów

Wszystkie endpointy powinny być owinięte w blok `try-catch`.

| Sytuacja | Kod HTTP | Wiadomość |
| :--- | :--- | :--- |
| Sukces (Odczyt/Aktualizacja) | 200 | Body odpowiedzi |
| Sukces (Utworzenie) | 201 | `{ "id": "..." }` |
| Błąd walidacji Zod | 400 | Szczegóły błędów walidacji |
| Nie znaleziono rezerwacji | 404 | "Booking not found" |
| Konflikt terminów (zajęte miejsce) | 409 | "Spot is already booked for this period" |
| Błąd serwera / Bazy danych | 500 | "Internal Server Error" |

## 6. Względy bezpieczeństwa

1.  **Uwierzytelnianie:** Middleware Astro weryfikuje sesję użytkownika.
2.  **Autoryzacja (RLS):** Supabase RLS zapewnia, że użytkownik widzi i edytuje tylko rezerwacje należące do jego `user_id`. Serwis *musi* używać klienta z `context.locals.supabase`, a nie klienta admina.
3.  **Sanityzacja:** Zod usuwa nadmiarowe pola i sprawdza typy, zapobiegając wstrzyknięciu nieprawidłowych struktur JSON.

## 7. Kroki implementacji

1.  **Krok 1: Serwis (`src/lib/services/bookings.ts`)**
    *   Zaimplementuj klasę/funkcje serwisu.
    *   Dodaj logikę wyliczania kosztów (uwzględniając `price_exceptions`).
    *   Dodaj logikę wykrywania kolizji (overlap).

2.  **Krok 2: Endpoint Preview (`src/pages/api/bookings/preview.ts`)**
    *   Wdróż endpoint kalkulacji.
    *   Jest to kluczowe do przetestowania logiki cenowej bez tworzenia rekordów.

3.  **Krok 3: Endpointy CRUD**
    *   Wdróż `index.ts` (GET, POST).
    *   Wdróż `[id].ts` (GET, PATCH).

4.  **Krok 4: Testy manualne (Postman/Curl)**
    *   Sprawdź tworzenie rezerwacji w przeszłości/przyszłości.
    *   Sprawdź nakładanie się dat (czy zwraca 409).
    *   Sprawdź czy wyjątki cenowe są uwzględniane w `preview`.

