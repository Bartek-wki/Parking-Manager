# API Endpoint Implementation Plan: Pricing Exceptions

## 1. Przegląd punktu końcowego

Punkt końcowy `/locations/:location_id/pricing` umożliwia zarządzanie tymczasowymi wyjątkami cenowymi (np. zwyżki świąteczne, zniżki sezonowe) dla konkretnej lokalizacji parkingowej. Pozwala na definiowanie okresów, w których cena podstawowa jest modyfikowana o określony procent.

## 2. Szczegóły żądania

### 2.1. List Exceptions (Pobieranie listy)
- **Metoda HTTP:** `GET`
- **URL:** `/api/locations/[location_id]/pricing`
- **Parametry URL:**
  - `location_id` (Wymagane, UUID): Identyfikator lokalizacji.

### 2.2. Create Exception (Tworzenie)
- **Metoda HTTP:** `POST`
- **URL:** `/api/locations/[location_id]/pricing`
- **Request Body:**
  ```json
  {
    "start_date": "2023-12-24",
    "end_date": "2023-12-26",
    "percentage_change": 50.00,
    "description": "Christmas Surcharge"
  }
  ```

### 2.3. Update Exception (Aktualizacja)
- **Metoda HTTP:** `PUT`
- **URL:** `/api/locations/[location_id]/pricing/[id]`
- **Parametry URL:**
  - `location_id` (Wymagane, UUID)
  - `id` (Wymagane, UUID): Identyfikator wyjątku cenowego.
- **Request Body:**
  ```json
  {
    "start_date": "2023-12-24",
    "end_date": "2023-12-25",
    "percentage_change": 40.00,
    "description": "Updated Surcharge"
  }
  ```

### 2.4. Delete Exception (Usuwanie)
- **Metoda HTTP:** `DELETE`
- **URL:** `/api/locations/[location_id]/pricing/[id]`
- **Parametry URL:**
  - `location_id` (Wymagane, UUID)
  - `id` (Wymagane, UUID)

## 3. Wykorzystywane typy

Będziemy korzystać z typów zdefiniowanych w `src/types.ts` oraz nowych schematów walidacji Zod.

- **DTO (Output):** `PricingExceptionDTO` (z `src/types.ts`)
- **Command (Input):** `CreatePricingExceptionCmd` (z `src/types.ts`)
- **Update Command:** Będzie on tożsamy strukturą z `CreatePricingExceptionCmd` (wszystkie pola edytowalne), ale obsłużony przez ten sam schemat walidacji.

**Schemat Walidacji (Zod):**
Będzie wymagany do walidacji danych wejściowych w `POST` i `PUT`.
- `percentage_change`: number, min -100, max 500.
- `start_date`, `end_date`: string (date), `end_date` >= `start_date`.
- `description`: string (optional).

## 4. Szczegóły odpowiedzi

- **GET (List):** `200 OK`
  ```json
  [ { "id": "uuid", "start_date": "...", ... } ]
  ```
- **POST (Create):** `201 Created`
  ```json
  { "message": "Exception created successfully", "id": "uuid" }
  ```
- **PUT (Update):** `200 OK`
  ```json
  { "message": "Exception updated successfully" }
  ```
- **DELETE:** `204 No Content` (puste ciało odpowiedzi).
- **Błędy:** Standardowa struktura błędu `{ "error": "Opis błędu" }`.

## 5. Przepływ danych

1.  **Request:** Klient wysyła żądanie HTTP do Endpointu Astro (`src/pages/api/...`).
2.  **Middleware/Context:** Astro udostępnia `locals.supabase` (klient Supabase z kontekstem użytkownika).
3.  **Endpoint Handler:**
    *   Weryfikuje parametry ścieżki (`location_id`, `id`).
    *   Weryfikuje ciało żądania za pomocą **Zod**.
4.  **Service Layer:** Endpoint wywołuje `PricingExceptionService` (nowy serwis).
    *   Metody serwisu wykonują zapytania do Supabase.
    *   Serwis zapewnia, że operacja dotyczy danych zalogowanego użytkownika (`user_id`).
5.  **Database:** Supabase wykonuje operacje na tabeli `price_exceptions`.
    *   Constraints: `CHECK (percentage_change ...)`, `CHECK (dates...)`, `UNIQUE(...)`.
6.  **Response:** Endpoint zwraca sformatowaną odpowiedź JSON.

## 6. Względy bezpieczeństwa

-   **Uwierzytelnianie:** Wymagane dla wszystkich metod. Endpoint sprawdzi istnienie użytkownika (`auth.users`).
-   **Autoryzacja (RLS):** Baza danych posiada polityki Row Level Security. Zapytania muszą zawierać kontekst sesji.
-   **Izolacja danych:** Każde zapytanie (INSERT/UPDATE) musi dołączać `user_id` pobrane z sesji, aby zapobiec tworzeniu zasobów dla innych użytkowników.
-   **Walidacja wejścia:** Ścisła walidacja Zod zapobiega wprowadzaniu nieprawidłowych typów danych i zakresów logicznych (np. data końcowa przed początkową).

## 7. Obsługa błędów

| Kod | Scenariusz | Obsługa |
| :--- | :--- | :--- |
| `400` | Błąd walidacji Zod | Zwróć listę błędów walidacji. |
| `400` | Logiczny błąd dat (Start > End) | Wykryte przez Zod/Service, zwróć czytelny komunikat. |
| `401` | Brak sesji (niezalogowany) | Zwróć `Unauthorized`. |
| `403` | Brak dostępu do lokalizacji | RLS lub sprawdzenie własności zwróci brak wyników/błąd. |
| `404` | Lokalizacja lub Wyjątek nie istnieje | Obsługa pustego wyniku z bazy przy operacjach na ID. |
| `409` | Konflikt (duplikat zakresu dat) | Obsługa błędu Postgres (code `23505`). |
| `500` | Błąd wewnętrzny serwera | Logowanie błędu, ogólny komunikat dla klienta. |

## 8. Rozważania dotyczące wydajności

-   **Indeksy:** Tabela `price_exceptions` powinna mieć indeksy na `location_id` oraz datach (`start_date`, `end_date`), aby szybko filtrować obowiązujące wyjątki.
-   **Payload:** DTO jest lekkie, nie zawiera zagnieżdżonych relacji.

## 9. Etapy wdrożenia

### Krok 1: Utworzenie Serwisu (Service Layer)
Utwórz plik `src/lib/services/pricing-exception.service.ts`.
-   Zaimplementuj klasę/funkcje `PricingExceptionService`.
-   Metody: `getByLocationId`, `create`, `update`, `delete`.
-   Użyj typów z `src/types.ts`.

### Krok 2: Definicja Schematów Walidacji
Wewnątrz pliku serwisu lub w `src/lib/validation.ts` (jeśli istnieje) zdefiniuj schematy Zod:
-   `createPricingExceptionSchema` (dla POST i PUT).

### Krok 3: Implementacja Endpointu List & Create (GET/POST)
Utwórz plik `src/pages/api/locations/[location_id]/pricing/index.ts`.
-   **GET:** Pobierz `location_id`, wywołaj serwis, zwróć listę.
-   **POST:** Pobierz body, zwaliduj Zod, pobierz `user_id` z sesji, wywołaj serwis create.

### Krok 4: Implementacja Endpointu Update & Delete (PUT/DELETE)
Utwórz plik `src/pages/api/locations/[location_id]/pricing/[id].ts`.
-   **PUT:** Pobierz `id` i body, zwaliduj Zod, wywołaj serwis update.
-   **DELETE:** Pobierz `id`, wywołaj serwis delete.

### Krok 5: Weryfikacja
-   Przetestuj manualnie endpointy (np. używając Postman/Curl lub wbudowanych narzędzi testowych).
-   Sprawdź obsługę błędów (nieprawidłowe daty, brak autoryzacji).

