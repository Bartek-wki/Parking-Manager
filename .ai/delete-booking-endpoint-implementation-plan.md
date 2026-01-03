# API Endpoint Implementation Plan: Delete Booking

## 1. Przegląd punktu końcowego

Punkt końcowy DELETE /bookings/:id umożliwia usunięcie istniejącej rezerwacji parkingu wraz z całą powiązaną historią płatności. Po usunięciu rezerwacji, miejsce parkingowe staje się natychmiast dostępne dla nowych rezerwacji. Operacja jest nieodwracalna i powinna być używana ostrożnie.

## 2. Szczegóły żądania

- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/bookings/:id`
  - `:id` - UUID identyfikujący rezerwację do usunięcia
- **Parametry:**
  - **Wymagane:**
    - `id` (ścieżka) - UUID rezerwacji, format: `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`
- **Request Body:** Brak (DELETE request nie zawiera ciała)
- **Nagłówki:**
  - `Content-Type: application/json` (choć nieobowiązkowy dla DELETE)
  - Standardowe nagłówki autoryzacji (obsługiwane przez Supabase RLS)

## 3. Wykorzystywane typy

- **BookingDTO** - do weryfikacji istnienia rezerwacji przed usunięciem
- **PaymentHistoryDTO** - struktura historii płatności (usuwana kaskadowo)
- Brak specjalnych command modeli - operacja używa tylko identyfikatora z URL

## 4. Szczegóły odpowiedzi

- **Sukces (204 No Content):**
  - Status: `204`
  - Body: Pusty
  - Headers: Brak specjalnych nagłówków

- **Błędy:**
  - `400 Bad Request` - nieprawidłowy format UUID
  - `401 Unauthorized` - brak autoryzacji
  - `403 Forbidden` - próba usunięcia cudzej rezerwacji
  - `404 Not Found` - rezerwacja nie istnieje
  - `500 Internal Server Error` - błąd serwera/bazy danych

## 5. Przepływ danych

1. **Walidacja parametru:** Sprawdzenie formatu UUID parametru `:id`
2. **Autoryzacja:** Weryfikacja przez Supabase RLS (user_id kontekstu)
3. **Wyszukiwanie:** Pobranie rezerwacji z bazy danych w celu weryfikacji istnienia
4. **Usuwanie cascade:** Usunięcie payment_history (automatyczne przez FK constraint)
5. **Usuwanie główne:** Usunięcie rekordu z tabeli bookings
6. **Potwierdzenie:** Zwrócenie statusu 204 bez ciała odpowiedzi

## 6. Względy bezpieczeństwa

- **Autoryzacja:** Chroniona przez Supabase Row Level Security - użytkownik może usuwać tylko własne rezerwacje
- **Walidacja wejścia:** UUID validation zapobiega injection attacks
- **RLS Protection:** Polityki bezpieczeństwa Supabase uniemożliwiają dostęp do cudzych danych
- **Audit Trail:** Historia płatności jest automatycznie usuwana wraz z rezerwacją
- **CORS:** Standardowa konfiguracja Astro dla cross-origin requests

## 7. Obsługa błędów

- **400 Bad Request:** `{"message": "Invalid booking ID format"}`
- **404 Not Found:** `{"message": "Booking not found"}`
- **500 Internal Server Error:** `{"message": "Internal server error"}`
- Wszystkie błędy są logowane do konsoli serwera z pełnym stack trace
- Błędy biznesowe (np. próba usunięcia nieistniejącej rezerwacji) zwracają odpowiednie kody HTTP

## 8. Rozważania dotyczące wydajności

- **Operacja lekka:** DELETE to prosta operacja bazodanowa
- **Indeksy:** Wykorzystuje istniejące indeksy na kolumnie `id` tabeli bookings
- **Cascade delete:** Automatyczne usuwanie payment_history przez FK constraint
- **Brak złożonych zapytań:** Operacja nie wymaga JOIN ani złożonej logiki biznesowej
- **Odpowiedź natychmiastowa:** 204 No Content nie zawiera danych, minimalny narzut

## 9. Etapy wdrożenia

1. **Dodać funkcję `deleteBooking` do `src/lib/services/bookings.ts`**
   - Implementować logikę usuwania z obsługą błędów
   - Dodać sprawdzenie istnienia rezerwacji przed usunięciem

2. **Dodać walidację UUID do `src/lib/validation/bookings.ts`**
   - Utworzyć schema dla parametru ścieżki `:id`

3. **Rozszerzyć endpoint `src/pages/api/bookings/[id].ts`**
   - Dodać eksport funkcji `DELETE`
   - Implementować standardowy wzorzec obsługi błędów Astro
   - Użyć istniejących wzorców z GET i PATCH

4. **Przetestować implementację**
   - Ręczne testy API zgodnie z dokumentacją w `docs/api_manual_tests/`
   - Sprawdzenie cascade delete payment_history
   - Weryfikacja RLS i autoryzacji

5. **Zaktualizować dokumentację API**
   - Dodać endpoint do `docs/api_manual_tests/bookings_manual_tests.md`
