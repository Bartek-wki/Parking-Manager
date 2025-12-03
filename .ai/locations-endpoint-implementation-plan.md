# API Endpoint Implementation Plan: Locations

## 1. Przegląd punktu końcowego

Punkt końcowy `Locations` umożliwia zarządzanie fizycznymi lokalizacjami parkingów. Umożliwia właścicielom parkingów (zalogowanym użytkownikom) przeglądanie ich listy, dodawanie nowych lokalizacji oraz edycję istniejących. Jest to podstawowy zasób, do którego będą odnosić się miejsca parkingowe (spots) i rezerwacje.

## 2. Szczegóły żądania

### 2.1 Lista Lokalizacji
- **Metoda HTTP:** `GET`
- **URL:** `/api/locations`
- **Parametry:** Brak
- **Autoryzacja:** Wymagany token Bearer (obsługiwany przez Supabase Auth cookie/header).

### 2.2 Utworzenie Lokalizacji
- **Metoda HTTP:** `POST`
- **URL:** `/api/locations`
- **Request Body** (`application/json`):
  ```json
  {
    "name": "Parking Centrum",
    "daily_rate": 45.00,
    "monthly_rate": 1200.00
  }
  ```
- **Wymagane pola:** `name`, `daily_rate`, `monthly_rate`.

### 2.3 Aktualizacja Lokalizacji
- **Metoda HTTP:** `PUT` (zgodnie z planem API, implementowane jako update)
- **URL:** `/api/locations/[id]`
- **Parametry ścieżki:**
  - `id` (UUID) - identyfikator lokalizacji.
- **Request Body** (`application/json`):
  ```json
  {
    "name": "Parking Centrum - Zmiana",
    "daily_rate": 50.00
  }
  ```
- **Pola:** Pola z `UpdateLocationCmd` (częściowa lub pełna aktualizacja).

## 3. Wykorzystywane typy

Implementacja będzie opierać się na typach zdefiniowanych w `src/types.ts`:

- **DTO (Data Transfer Object):**
  - `LocationDTO`: `{ id, name, daily_rate, monthly_rate }`
- **Commands (Payloads):**
  - `CreateLocationCmd`: `{ name, daily_rate, monthly_rate }`
  - `UpdateLocationCmd`: `{ name?, daily_rate?, monthly_rate? }`

## 4. Szczegóły odpowiedzi

### 4.1 GET /api/locations
- **Status:** `200 OK`
- **Body:** Tablica obiektów `LocationDTO`.
  ```json
  [
    {
      "id": "uuid...",
      "name": "Parking A",
      "daily_rate": 50.00,
      "monthly_rate": 1200.00
    }
  ]
  ```

### 4.2 POST /api/locations
- **Status:** `201 Created`
- **Body:** Utworzony obiekt `LocationDTO` lub komunikat sukcesu zawierający ID.

### 4.3 PUT /api/locations/[id]
- **Status:** `200 OK`
- **Body:** Zaktualizowany obiekt `LocationDTO`.

### 4.4 Błędy
- **400 Bad Request:** Nieprawidłowe dane wejściowe (walidacja Zod).
- **401 Unauthorized:** Brak sesji użytkownika.
- **404 Not Found:** Próba edycji nieistniejącej lokalizacji (lub nienależącej do użytkownika).
- **500 Internal Server Error:** Błąd bazy danych lub serwera.

## 5. Przepływ danych

1.  **Request:** Astro odbiera żądanie w `src/pages/api/locations/...`.
2.  **Middleware:** `src/middleware/index.ts` weryfikuje sesję i udostępnia klienta Supabase w `context.locals.supabase`.
3.  **Handler:**
    -   Pobiera dane wejściowe (body/params).
    -   Waliduje dane przy użyciu schematów **Zod**.
4.  **Service:** Handler wywołuje funkcję z `src/lib/services/locations.ts`, przekazując klienta Supabase.
5.  **Database:** Klient Supabase wykonuje zapytanie do tabeli `locations`.
    -   **RLS** automatycznie filtruje/blokuje dostęp w oparciu o `auth.uid()`.
6.  **Response:** Wynik jest mapowany na odpowiedni kod HTTP i JSON.

## 6. Względy bezpieczeństwa

-   **Row Level Security (RLS):** To kluczowy mechanizm. Baza danych gwarantuje, że użytkownik może widzieć i edytować tylko rekordy, gdzie `user_id` zgadza się z jego UID.
-   **Walidacja:** Wszystkie dane wejściowe (`POST`, `PUT`) muszą przejść walidację schematem Zod (typy, zakresy wartości, formaty).
-   **Endpoint Isolation:** `export const prerender = false` zapewnia, że kod wykonuje się po stronie serwera (SSR), ukrywając logikę przed klientem.

## 7. Obsługa błędów

Błędy będą obsługiwane w bloku `try-catch` wewnątrz handlerów API.

-   **ZodError:** Zwraca `400` z listą pól i komunikatami błędów.
-   **Supabase PostgrestError:**
    -   Kod `PGRST116` (zwracany przy `select().single()` gdy brak wyników) -> mapowany na `404`.
    -   Inne błędy -> logowane na serwerze i zwracane jako `500`.

## 8. Rozważania dotyczące wydajności

-   **Indeksy:** Tabela `locations` posiada indeks na `user_id` (zgodnie z `db-plan.md`), co zapewnia szybkie filtrowanie w RLS.
-   **Select:** Należy pobierać tylko wymagane kolumny (zgodnie z `LocationDTO`), choć przy tej małej tabeli `select('*')` jest akceptowalne.
-   **Połączenia:** Supabase-js korzysta z połączenia HTTP, więc nie ma problemu z pulą połączeń w kontekście serverless (edge functions/endpoints).

## 9. Etapy wdrożenia

### Krok 1: Walidacja (Zod Schemas)
Utwórz plik `src/lib/validation/locations.ts` zawierający schematy walidacji dla tworzenia i aktualizacji lokalizacji.
-   `createLocationSchema`: wymagane `name` (min 1 znak), `daily_rate` (>=0), `monthly_rate` (>=0).
-   `updateLocationSchema`: j/w ale jako `partial` (lub zgodnie z wymaganiami, że można zaktualizować tylko część).

### Krok 2: Serwis Logiki Biznesowej
Utwórz plik `src/lib/services/locations.ts`.
-   Zaimplementuj `getLocationList(supabase)`.
-   Zaimplementuj `createLocation(supabase, data)`.
-   Zaimplementuj `updateLocation(supabase, id, data)`.
-   Upewnij się, że funkcje przyjmują klienta `SupabaseClient` jako argument.

### Krok 3: Endpoint GET i POST
Utwórz plik `src/pages/api/locations/index.ts`.
-   Skonfiguruj `export const prerender = false`.
-   Zaimplementuj `GET`: pobranie listy przez serwis.
-   Zaimplementuj `POST`: walidacja body, wywołanie serwisu, zwrot 201.

### Krok 4: Endpoint PUT
Utwórz plik `src/pages/api/locations/[id].ts`.
-   Skonfiguruj `export const prerender = false`.
-   Zaimplementuj `PUT`: walidacja `id` (UUID), walidacja body, wywołanie serwisu update, zwrot 200 lub 404.

### Krok 5: Weryfikacja
-   Uruchomienie serwera deweloperskiego.
-   Testowe żądania (np. curl lub Postman) w celu sprawdzenia poprawności działania (w tym scenariusze błędów i RLS).

