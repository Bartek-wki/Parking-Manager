# API Endpoint Implementation Plan: Clients

## 1. Przegląd punktu końcowego

Plan ten obejmuje implementację punktów końcowych do zarządzania klientami (`/clients`). Umożliwi on pobieranie listy klientów z opcjonalnym wyszukiwaniem, tworzenie nowych profili klientów oraz aktualizację istniejących danych klientów. Logika biznesowa zostanie wydzielona do serwisu, a walidacja danych wejściowych zapewni spójność z bazą danych.

## 2. Szczegóły żądania

### GET /clients

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/clients`
- **Parametry zapytania (Query Params)**:
  - `search` (Opcjonalny): Ciąg znaków do filtrowania klientów po początku imienia lub nazwiska (np. `?search=Joh`).
- **Wymagane nagłówki**: `Cookie` (dla sesji autoryzacyjnej Supabase).

### POST /clients

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/clients`
- **Request Body** (`application/json`):
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com", // Opcjonalne
    "phone": "123456789" // Opcjonalne
  }
  ```

### PUT /clients/[id]

- **Metoda HTTP**: `PUT`
- **Struktura URL**: `/api/clients/[id]`
- **Request Body** (`application/json`):
  ```json
  {
    "first_name": "Johnny", // Opcjonalne (aktualizacja częściowa)
    "email": "new.email@example.com"
  }
  ```
- **Wymagania**: ID w URL musi być poprawnym UUID.

## 3. Wykorzystywane typy

Będziemy korzystać z definicji znajdujących się w `src/types.ts` oraz nowych definicji:

- **DTO (Data Transfer Object)**:
  - `ClientDTO`: Używany do zwracania danych klienta (`id`, `first_name`, `last_name`, `email`, `phone`).
- **Command Model**:
  - `CreateClientCmd`: Używany do tworzenia klienta.
  - `UpdateClientCmd`: Używany do aktualizacji klienta (należy dodać do `src/types.ts`)
- **Zod Schema**:
  - `createClientSchema`: Nowy schemat walidacji w `src/lib/validation/clients.ts`.
  - `updateClientSchema`: Schemat walidacji aktualizacji (częściowy) w `src/lib/validation/clients.ts`.

## 4. Szczegóły odpowiedzi

### Pomyślne odpowiedzi

- **GET /clients**: `200 OK`
  ```json
  [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+48123456789"
    }
  ]
  ```
- **POST /clients**: `201 Created`
  - Zwraca utworzony obiekt `ClientDTO`.
- **PUT /clients/[id]**: `200 OK`
  - Zwraca zaktualizowany obiekt `ClientDTO`.

### Błędy

- `400 Bad Request`: Błąd walidacji danych wejściowych (Zod) lub brak ID.
- `401 Unauthorized`: Brak sesji użytkownika.
- `404 Not Found`: Klient o podanym ID nie istnieje (lub należy do innego użytkownika).
- `500 Internal Server Error`: Błąd bazy danych lub serwera.

## 5. Przepływ danych

1. **Żądanie**: Astro API route (`src/pages/api/clients/index.ts` lub `[id].ts`) odbiera żądanie.
2. **Autoryzacja**: Middleware weryfikuje sesję i udostępnia `locals.supabase`.
3. **Walidacja**:
   - Dla POST/PUT: Body jest parsowane i walidowane przez schemat Zod.
   - Dla PUT: ID z URL jest walidowane (UUID).
4. **Serwis**: API route wywołuje funkcje z `src/lib/services/clients.ts`:
   - `listClients`
   - `createClient`
   - `updateClient`
5. **Baza danych**: Serwis komunikuje się z tabelą `clients` w Supabase.
   - **GET**: `SELECT` z filtrowaniem po `user_id`, `deleted_at IS NULL`.
   - **POST**: `INSERT` z `user_id`.
   - **PUT**: `UPDATE` z filtrowaniem po `id` i `user_id`.
6. **Odpowiedź**: Dane są mapowane do DTO i zwracane jako JSON.

## 6. Względy bezpieczeństwa

- **Row Level Security (RLS)**: Chociaż logika aplikacji filtruje po `user_id`, RLS w bazie danych jest ostateczną warstwą ochrony.
- **Walidacja danych**: Użycie Zod zapobiega wstrzykiwaniu nieprawidłowych danych.
- **IDOR**: Przy aktualizacji (`PUT`) konieczne jest sprawdzenie, czy klient należy do zalogowanego użytkownika (poprzez `user_id` w zapytaniu UPDATE).
- **Sanityzacja**: Parametry wyszukiwania są bezpiecznie przekazywane do zapytań parametryzowanych Supabase.

## 7. Obsługa błędów

- Wszystkie operacje asynchroniczne będą owinięte w bloki `try-catch`.
- `404 Not Found` musi zostać zwrócone, jeśli próba aktualizacji nie zmodyfikuje żadnego rekordu (co oznacza, że rekord nie istnieje lub nie należy do użytkownika).
- Błędy walidacji Zod będą zwracane jako `400`.

## 8. Etapy wdrożenia

### Krok 1: Schematy walidacji
Utwórz plik `src/lib/validation/clients.ts`:
- `createClientSchema`: `first_name` (min 1), `last_name` (min 1), `email` (email/null), `phone` (string/null).
- `updateClientSchema`: To samo co create, ale wszystkie pola opcjonalne (`.partial()`).

### Krok 2: Serwis domenowy
Utwórz plik `src/lib/services/clients.ts`:
- `listClients(supabase, userId, searchTerms)`
- `createClient(supabase, userId, data)`
- `updateClient(supabase, id, data)`:
  - Wykonaj update na tabeli `clients`.
  - Warunek: `id` oraz (implicit via RLS lub explicit) `user_id` (chociaż context Supabase Clienta z locals zwykle ma już kontekst usera, tutaj przekazujemy klienta z `locals`, który ma token, więc RLS zadziała, ale explicite `eq('user_id', userId)` nie zaszkodzi dla pewności lub w przypadku service role).

### Krok 3: API Endpoint (Index)
Utwórz plik `src/pages/api/clients/index.ts`.
- Zaimplementuj handler `GET`:
  - Pobierz `user` z `locals`.
  - Pobierz param `search`.
  - Wywołaj serwis i zwróć JSON.
- Zaimplementuj handler `POST`:
  - Pobierz `user` z `locals`.
  - Parsuj body.
  - Waliduj Zod.
  - Wywołaj serwis i zwróć JSON (201).
- Dodaj obsługę błędów (try/catch).

### Krok 4: API Endpoint (ID)
Utwórz plik `src/pages/api/clients/[id].ts`.
- `PUT`: Aktualizacja klienta.
  - Walidacja ID.
  - Walidacja body (`updateClientSchema`).
  - Wywołanie `updateClient`.
  - Obsługa 404.

### Krok 5: Weryfikacja
- Sprawdź tworzenie, listowanie i edycję klientów.
- Sprawdź, czy nie można edytować klienta innej osoby (jeśli możliwe do przetestowania).
