# API Endpoint Implementation Plan: Spots

## 1. Przegląd punktu końcowego

Punkt końcowy `Spots` umożliwia zarządzanie miejscami parkingowymi przypisanymi do konkretnych lokalizacji. Pozwala na listowanie miejsc, dodawanie nowych miejsc do lokalizacji oraz edycję istniejących miejsc (zmiana nazwy lub statusu aktywności).

## 2. Szczegóły żądania

### 2.1. List Spots (Pobieranie listy miejsc)
- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/locations/[location_id]/spots`
- **Parametry:**
  - **Path (Wymagane):** `location_id` (UUID lokalizacji)
  - **Query (Opcjonalne):** `active_only` (boolean - jeśli `true`, zwraca tylko aktywne miejsca)

### 2.2. Create Spot (Tworzenie miejsca)
- **Metoda HTTP:** `POST`
- **Struktura URL:** `/api/locations/[location_id]/spots`
- **Parametry:**
  - **Path (Wymagane):** `location_id` (UUID lokalizacji)
- **Request Body:**
  ```json
  {
    "spot_number": "string" // np. "P-101"
  }
  ```

### 2.3. Update Spot (Aktualizacja miejsca)
- **Metoda HTTP:** `PATCH`
- **Struktura URL:** `/api/spots/[id]`
- **Parametry:**
  - **Path (Wymagane):** `id` (UUID miejsca)
- **Request Body:**
  ```json
  {
    "spot_number": "string", // Opcjonalne
    "is_active": boolean     // Opcjonalne
  }
  ```

## 3. Wykorzystywane typy

Implementacja będzie korzystać z definicji znajdujących się w `src/types.ts`:

- **DTO (Response):** `SpotDTO` (`Pick<Tables<"spots">, "id" | "spot_number" | "is_active">`)
- **Command (Create):** `CreateSpotCmd` (`Pick<Inserts<"spots">, "spot_number">`)
- **Command (Update):** `UpdateSpotCmd` (`Pick<Updates<"spots">, "is_active" | "spot_number">`)

## 4. Szczegóły odpowiedzi

### 4.1. Sukces
- **GET (List):** `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "spot_number": "P-101",
      "is_active": true
    }
  ]
  ```
- **POST (Create):** `201 Created`
  ```json
  {
    "id": "uuid",
    "spot_number": "P-102",
    "is_active": true
  }
  ```
- **PATCH (Update):** `200 OK`
  ```json
  {
    "id": "uuid",
    "spot_number": "P-102",
    "is_active": false
  }
  ```

### 4.2. Kody błędów
- `400 Bad Request`: Błędy walidacji danych wejściowych (np. niepoprawny UUID, pusty numer miejsca) lub naruszenie unikalności (duplikat numeru miejsca w tej samej lokalizacji).
- `401 Unauthorized`: Brak aktywnej sesji użytkownika.
- `404 Not Found`: Nie znaleziono lokalizacji (przy tworzeniu) lub miejsca (przy edycji).
- `500 Internal Server Error`: Nieoczekiwane błędy bazy danych.

## 5. Przepływ danych

1. **Endpoint (Astro API Route):** Odbiera żądanie, sprawdza sesję użytkownika (`context.locals`).
2. **Walidacja (Zod):** Sprawdza poprawność parametrów URL (UUID) oraz ciała żądania.
3. **Serwis (`SpotsService`):**
   - Wywołuje metody klienta Supabase.
   - **GET:** Wykonuje zapytanie `select` na tabeli `spots` z filtrem `location_id` oraz `user_id` (dla bezpieczeństwa).
   - **POST:** Wykonuje `insert` do tabeli `spots`, dołączając `user_id` z sesji.
   - **PATCH:** Wykonuje `update` na tabeli `spots`, filtrując po `id` oraz `user_id`.
4. **Baza danych (Supabase):** Wykonuje operacje CRUD, egzekwując więzy integralności (Unique Constraint na `location_id` + `spot_number`).
5. **Response:** Zwraca sformatowane dane JSON lub kod błędu.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Każde żądanie musi być zweryfikowane pod kątem istnienia sesji użytkownika.
- **Tenant Isolation:** Każde zapytanie do bazy danych **musi** zawierać `user_id` pobrane z sesji, aby zapobiec dostępowi do danych innych użytkowników (zgodnie z definicją tabeli `spots` wymagającą `user_id`).
- **Walidacja:** Wszystkie dane wejściowe są walidowane biblioteką Zod przed przekazaniem do bazy danych.

## 7. Obsługa błędów

- Błędy PostgreSQL `23505` (unique_violation) przy tworzeniu/edycji powinny być mapowane na `400 Bad Request` z komunikatem "Spot number already exists in this location".
- Błędy PostgreSQL `23503` (foreign_key_violation) przy tworzeniu powinny być mapowane na `404 Not Found` (Location not found).
- Pozostałe błędy bazy danych mapowane na `500`.

## 8. Wydajność

- Indeksy na kolumnach `location_id` oraz `id` (klucz główny) w bazie danych zapewniają szybkie wyszukiwanie.
- Pobieranie listy (`GET`) jest lekkie, ponieważ zwraca tylko podstawowe pola (`id`, `spot_number`, `is_active`).

## 9. Etapy wdrożenia

### Krok 1: Schematy Walidacji
Stworzyć plik `src/lib/validation/spots.ts` zawierający schematy Zod dla:
- `createSpotSchema` (spot_number)
- `updateSpotSchema` (spot_number, is_active)
- `listSpotsQuerySchema` (active_only)

### Krok 2: Serwis Spots
Stworzyć plik `src/lib/services/spots.ts`. Zaimplementować klasę/funkcje `SpotsService`:
- `listSpots(supabase, locationId, activeOnly)`
- `createSpot(supabase, spotData)` - pamiętać o wstrzyknięciu `user_id`.
- `updateSpot(supabase, id, spotData)`

### Krok 3: Endpoint List/Create
Stworzyć plik `src/pages/api/locations/[id]/spots.ts`:
- Obsługa metody `GET`: Listowanie miejsc.
- Obsługa metody `POST`: Tworzenie nowego miejsca.
- Obsługa błędów i zwracanie odpowiednich kodów HTTP.

### Krok 4: Endpoint Update
Stworzyć plik `src/pages/api/spots/[id].ts`:
- Obsługa metody `PATCH`: Aktualizacja miejsca.
- Implementacja walidacji ID i Body.

