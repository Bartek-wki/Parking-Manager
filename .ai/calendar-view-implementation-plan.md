# Plan implementacji widoku Kalendarza Rezerwacji (Część 1: Wyświetlanie)

## 1. Przegląd
Niniejszy dokument opisuje **pierwszą fazę** wdrożenia widoku Kalendarza (`Calendar View`).
Celem tej fazy jest stworzenie szkieletu widoku, mechanizmów nawigacji oraz wizualizacja istniejących rezerwacji w siatce miesięcznej lub liście agendy przy użyciu biblioteki **FullCalendar**.

**Zakres Części 1:**
- Instalacja i konfiguracja biblioteki FullCalendar.
- Wyświetlanie siatki kalendarza (widok miesięczny dla desktop, lista agendy dla mobile).
- Pobieranie i wyświetlanie rezerwacji (read-only) z użyciem React Query.
- Podgląd szczegółów rezerwacji (tryb "View").
- Filtrowanie po miejscach.
- Wyróżnianie rezerwacji kończących się wkrótce (custom rendering).
- Obsługa stanu ładowania (Skeleton UI dla siatki).

**Zakres Części 2 (przyszła implementacja):**
- Tworzenie nowych rezerwacji (interakcja z pustymi dniami).
- Edycja istniejących rezerwacji (Resize/Drag & Drop).
- Zmiana statusów płatności, historia zmian i anulowanie rezerwacji.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką:
`/locations/[locationId]/calendar`

Przekierowanie z `/locations/[locationId]` powinno prowadzić do tego widoku.

## 3. Struktura komponentów
Struktura uwzględnia architekturę "Islands".

```text
src/pages/locations/[locationId]/calendar.astro (Page Shell)
└── CalendarView (React Island)
    ├── CalendarHeader
    │   ├── MonthNavigator (Sterowanie instancją FullCalendar)
    │   └── SpotFilter (Select)
    ├── FullCalendarWrapper (Wrapper na bibliotekę)
    │   └── renderEventContent (Customowy render kafelka)
    └── BookingModal (Dialog - w tej fazie tylko tryb VIEW)
        └── BookingSummary (Podgląd szczegółów)
```

## 4. Szczegóły komponentów (Zakres Fazy 1)

### 1. `CalendarView` (Container)
- **Opis:** Główny kontener zarządzający stanem widoku.
- **Zadania:**
  - Pobieranie danych z API (`useCalendarBookings`).
  - Przekazywanie danych do `FullCalendarWrapper`.
  - Zarządzanie stanem modala (`selectedBookingId`).
  - Obsługa filtrów (miejsca).
- **Stan:**
  - `date`: Data sterująca kalendarzem.
  - `spotFilter`: ID wybranego miejsca.

### 2. `FullCalendarWrapper`
- **Opis:** Komponent konfiguracyjny biblioteki FullCalendar.
- **Konfiguracja:**
  - Plugins: `dayGridPlugin`, `listPlugin`, `interactionPlugin`.
  - Views:
    - `dayGridMonth`: Widok domyślny dla desktop.
    - `listMonth`: Widok agendy dla mobile (`< md`).
  - Locale: `pl`.
  - HeaderToolbar: Ukryty (korzystamy z własnego `CalendarHeader`).
- **Renderowanie zdarzeń (`eventContent`):**
  - Wyświetlanie nazwy klienta i miejsca.
  - **Ending Soon (US-099):** Dodanie ikony lub stylu dla rezerwacji kończących się <= 3 dni.
  - Kolorystyka zależna od statusu płatności (stylizacja CSS class).
- **Obsługiwane zdarzenia:**
  - `eventClick`: Otwiera `BookingModal`.
  - `datesSet`: Aktualizuje stan daty w rodzicu (dla potrzeb fetchowania danych).

### 3. Skeleton Loading (Siatka Kalendarza)
- **Problem:** FullCalendar inicjalizuje się po stronie klienta, co może powodować Layout Shift.
- **Rozwiązanie:** `CalendarSkeleton` wyświetlający:
  - Header: Puste kółka/bloki dla przycisków nawigacji.
  - Grid: Siatka 7x5 lub 7x6 (zależnie od miesiąca) z delikatnymi obramowaniami i pulsowaniem.
  - Overlay: Przezroczysta warstwa podczas re-fetchu danych (gdy `isFetching` jest true, ale mamy stare dane).

### 3. `BookingModal` (Tryb View)
- **Opis:** Modal wyświetlający szczegóły wybranej rezerwacji.
- **Zawartość:** Komponent `BookingSummary`.
- **Propsy:** `bookingId?: string`, `isOpen: boolean`, `onClose: () => void`.

### 4. `BookingSummary` (Sub-component)
- **Opis:** Widok "Read-only" szczegółów rezerwacji (US-035).
- **Sekcje:** Klient, Rezerwacja (Miejsce, Daty), Status Płatności.
- **Typy:** `BookingDetailDTO`.

### 5. `SpotFilter`
- **Opis:** Filtr miejsc parkingowych.
- **Komponenty:** `Select` (Shadcn).
- **Działanie:** Wybór miejsca filtruje listę zdarzeń przekazywanych do FullCalendar.

## 5. Typy

```typescript
// ViewModel zgodny z FullCalendar Event Input
export interface CalendarEventVM {
  id: string;
  title: string; // Np. "Jan Kowalski (P1)"
  start: string; // ISO String
  end: string;   // ISO String (FullCalendar wymaga end date + 1 dzień dla 'all-day')
  allDay: boolean; // true
  extendedProps: {
    spot_id: string;      // Zachowano snake_case dla spójności z DTO
    client_id: string;    // Zachowano snake_case dla spójności z DTO
    status: ReservationStatus;
    payment_status: PaymentStatus;
    is_ending_soon: boolean;
  };
  classNames: string[]; // Np. "bg-blue-500", "border-l-4 border-red-500"
}
```

## 6. Zarządzanie stanem

1.  **Stan lokalny (React/URL):**
    -   `currentDate`: Data (miesiąc/rok) - synchronizacja z FullCalendar API (`calendarApi.gotoDate()`).
    -   `selectedBookingId`: ID wybranej rezerwacji.
    -   `spotFilter`: ID miejsca.

2.  **Custom Hooks:**
    -   `useCalendarBookings(locationId, startDate, endDate)`: Pobiera dane i mapuje je na `CalendarEventVM`.
    -   **Ważne:** FullCalendar w widoku miesięcznym pobiera zakres np. 29 cze - 6 sie (widoczne dni). Hook powinien obsługiwać dynamiczne zakresy dat przekazywane przez callback `datesSet` lub pobierać cały miesiąc z marginesem.

## 7. Integracja API

### Pobieranie listy (Kalendarz)
-   **Endpoint:** `GET /bookings`
-   **Params:** `location_id`, `start_date`, `end_date`.
-   **Transformacja:** Dane z API (`BookingDTO`) muszą zostać przetransformowane na `CalendarEventVM` przed przekazaniem do komponentu kalendarza.
    - **Data końca:** Pamiętaj, że dla zdarzeń całodniowych FullCalendar oczekuje daty *wyłącznej* (exclusive), więc jeśli rezerwacja jest do 2023-10-05 włącznie, do FullCalendar przekazujemy 2023-10-06.

## 8. Interakcje użytkownika (Część 1)

1.  **Nawigacja:** Własne przyciski "Poprzedni", "Następny", "Dzisiaj" wywołują metody instancji FullCalendar (`calendarRef.current.getApi().prev()`).
2.  **Podgląd:** Kliknięcie w pasek rezerwacji (`eventClick`) otwiera modal.
3.  **Responsywność:** FullCalendar automatycznie zwija zdarzenia w "popover" (+2 more), jeśli jest ich za dużo na jeden dzień. Należy to ostylować zgodnie z Shadcn.

## 9. Warunki i walidacja

-   **US-099 (Ending Soon):** Logika mapowania danych ustawia flagę `isEndingSoon` i dodaje odpowiednią klasę CSS lub ikonę w `renderEventContent`.

## 10. Obsługa błędów

-   **Brak danych:** FullCalendar wyświetla puste komórki.
-   **Style:** Należy nadpisać domyślne zmienne CSS FullCalendar, aby pasowały do designu (fonty, kolory ramek, tła).

## 11. Kroki implementacji (Faza 1)

1.  **Instalacja zależności:**
    ```bash
    npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/list @fullcalendar/interaction date-fns
    ```
2.  **Warstwa API i Query:**
    - Utworzenie `src/lib/api/bookings.ts` (użycie `handleResponse`).
    - Utworzenie `src/lib/queries/bookings.ts` (definicja `BOOKING_KEYS` i hooków `useQuery`).
3.  **Logika Mapowania:** Funkcja transformująca `BookingDTO` -> `CalendarEventVM` (obsługa `end_date` + 1 dzień oraz `snake_case` w `extendedProps`).
4.  **Komponent Skeleton:** Implementacja `CalendarSkeleton.tsx`.
5.  **Komponent Wrapper:** Stworzenie `FullCalendarWrapper.tsx` z obsługą widoku mobilnego (`listMonth`) i desktopowego.
6.  **Kontener Widoku:** `CalendarView.tsx` integrujący React Query, filtry i wrapper kalendarza.
7.  **Nagłówek i Nawigacja:** Podpięcie zewnętrznych przycisków do sterowania instancją kalendarza.
8.  **Modal Szczegółów:** Implementacja `BookingModal` (readonly).
9.  **Weryfikacja:** Sprawdzenie responsywności i poprawności wyświetlania dat.
