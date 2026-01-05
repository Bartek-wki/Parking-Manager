# Plan Testów - Projekt Parking Manager

## 1. Wprowadzenie i cele testowania
Celem niniejszego planu jest zapewnienie wysokiej jakości aplikacji **Parking Manager**, służącej do zarządzania miejscami parkingowymi i rezerwacjami. Głównym priorytetem jest weryfikacja poprawności logiki biznesowej (unikanie konfliktów rezerwacji, wyliczanie cen) oraz bezpieczeństwa danych (izolacja danych właścicieli). Testy mają na celu wyeliminowanie błędów krytycznych przed wdrożeniem produkcyjnym oraz zapewnienie stabilności procesów biznesowych.

## 2. Zakres testów
Plan obejmuje testowanie następujących obszarów systemu:
*   **Moduł Uwierzytelniania**: Rejestracja, logowanie, reset hasła.
*   **Zarządzanie Zasobami**: Lokalizacje, Miejsca Parkingowe, Klienci.
*   **Core Biznesowy**:
    *   Tworzenie i edycja rezerwacji (stałych i okresowych).
    *   Algorytmy walidacji dostępności (wykrywanie kolizji).
    *   System dynamicznych cenników i wyjątków cenowych.
*   **Interfejs Użytkownika**: Kalendarz rezerwacji, formularze (TanStack Form).
*   **API**: Endpointy w `src/pages/api`.
*   **Baza Danych**: Reguły bezpieczeństwa Supabase (RLS).

**Wyłączenia z zakresu**:
*   Testy obciążeniowe (na obecnym etapie MVP).
*   Testy integracji z bramkami płatności (funkcjonalność poza MVP).

## 3. Typy testów do przeprowadzenia

### 3.1 Testy Jednostkowe (Unit Tests)
*   **Cel**: Weryfikacja izolowanej logiki biznesowej.
*   **Lokalizacja**: `src/lib/services/`.
*   **Kluczowe obszary**:
    *   `pricing-exceptions.ts`: Testowanie algorytmu priorytetów cenowych i kalkulacji kosztów.
    *   `bookings.ts`: Testowanie funkcji wykrywających nakładanie się dat (overlap logic).
    *   Utility functions i walidatory formularzy.

### 3.2 Testy Integracyjne (Integration Tests)
*   **Cel**: Weryfikacja komunikacji między API a bazą danych oraz komponentów React z hookami zapytań.
*   **Kluczowe obszary**:
    *   Endpointy API (`src/pages/api/bookings`, `src/pages/api/auth`).
    *   Sprawdzenie czy reguły RLS w Supabase poprawnie blokują dostęp do danych innych użytkowników.
    *   Obsługa błędów sieciowych i walidacji serwerowej w formularzach.

### 3.3 Testy End-to-End (E2E)
*   **Cel**: Symulacja ścieżek użytkownika w przeglądarce.
*   **Kluczowe ścieżki**:
    *   Pełny proces: Rejestracja -> Utworzenie Lokalizacji -> Dodanie Miejsca -> Utworzenie Rezerwacji.
    *   Scenariusz negatywny: Próba rezerwacji zajętego terminu.
    *   Przełączanie kontekstu lokalizacji i weryfikacja filtrowania danych.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

| ID | Funkcjonalność | Scenariusz Testowy | Oczekiwany Rezultat | Priorytet |
|:---|:---|:---|:---|:---|
| **ST-01** | **Rezerwacja (Konflikty)** | Próba utworzenia rezerwacji w terminie, w którym istnieje już inna rezerwacja na to samo miejsce. | System blokuje zapis i wyświetla komunikat o kolizji terminów. | **Krytyczny** |
| **ST-02** | **Cennik Dynamiczny** | Utworzenie rezerwacji w okresie objętym wyjątkiem cenowym (np. +20% ceny). | System automatycznie wylicza cenę uwzględniając podwyżkę. | **Krytyczny** |
| **ST-03** | **Rezerwacja Stała** | Utworzenie rezerwacji typu "stała" bez daty końcowej. | Rezerwacja jest aktywna bezterminowo, naliczana jest stała stawka miesięczna (ignorowanie wyjątków dziennych). | Wysoki |
| **ST-04** | **Kontekst Lokalizacji** | Zmiana lokalizacji w nagłówku aplikacji. | Listy miejsc, rezerwacji i kalendarz odświeżają się, pokazując dane tylko z wybranej lokalizacji. | Wysoki |
| **ST-05** | **Integracja Danych** | Próba usunięcia klienta posiadającego aktywne rezerwacje. | Akcja zablokowana z komunikatem wskazującym blokujące rezerwacje. | Średni |
| **ST-06** | **Auth RLS** | Próba dostępu do rezerwacji innego użytkownika poprzez bezpośrednie wywołanie API. | API zwraca błąd 401/403 lub pustą listę (zależnie od implementacji). | Wysoki |

## 5. Środowisko testowe

*   **Lokalne (Local)**:
    *   Uruchamiane na maszynie deweloperskiej.
    *   Baza danych: Lokalna instancja Supabase (Docker).
    *   Przeznaczenie: Unit tests, tworzenie testów E2E.
*   **Staging (Preview)**:
    *   Automatyczne wdrażanie z gałęzi `develop`/`main`.
    *   Baza danych: Osobny projekt Supabase (środowisko testowe).
    *   Przeznaczenie: Weryfikacja E2E w środowisku zbliżonym do produkcyjnego.

## 6. Narzędzia do testowania

*   **Vitest**: Do testów jednostkowych i integracyjnych (szybki, kompatybilny z Vite/Astro).
*   **React Testing Library**: Do testowania komponentów React (np. formularzy, kalendarza) w izolacji.
*   **Playwright**: Do testów E2E (obsługa wielu przeglądarek, nagrywanie wideo z błędów).
*   **Supabase CLI**: Do lokalnego uruchamiania bazy i testowania reguł bezpieczeństwa.

## 7. Harmonogram testów

Testy powinny być integralną częścią procesu CI/CD (GitHub Actions):
1.  **Pull Request**: Automatyczne uruchomienie `npm run test:unit` oraz linterów. Blokada merge'a w przypadku błędów.
2.  **Merge do main**: Uruchomienie testów E2E na środowisku stagingowym.
3.  **Cykl Sprintu**:
    *   Dzień 1-3: Tworzenie testów jednostkowych równolegle z kodem (TDD zalecane dla logiki cenowej).
    *   Ostatni dzień: Manualna weryfikacja scenariuszy UI i testy eksploracyjne.

## 8. Kryteria akceptacji testów

Aby uznać wersję za stabilną:
*   **100%** przechodzących testów jednostkowych i integracyjnych w potoku CI.
*   **100%** przechodzących testów E2E dla ścieżek krytycznych (Critical Paths).
*   Brak otwartych błędów o priorytecie "Blocker" lub "Critical".
*   Pokrycie kodu (Code Coverage) dla `src/lib/services` na poziomie minimum **90%**.

## 9. Role i odpowiedzialności

*   **Developer**:
    *   Pisanie testów jednostkowych dla tworzonego kodu.
    *   Rozwiązywanie błędów wykrytych przez CI.
*   **QA Engineer (Ty)**:
    *   Tworzenie i utrzymanie scenariuszy E2E (Playwright).
    *   Weryfikacja manualna skomplikowanych przypadków brzegowych.
    *   Audyt bezpieczeństwa (RLS).
    *   Zatwierdzanie wydań (Release Sign-off).

## 10. Procedury raportowania błędów

Błędy należy zgłaszać w systemie śledzenia zadań (np. GitHub Issues) według szablonu:
1.  **Tytuł**: Zwięzły opis problemu [Lokalizacja].
2.  **Środowisko**: URL, przeglądarka, wersja systemu.
3.  **Kroki do reprodukcji**: Dokładna lista kroków.
4.  **Oczekiwany rezultat**: Co powinno się stać.
5.  **Rzeczywisty rezultat**: Co się stało (w tym screenshoty/logi).
6.  **Priorytet**: Krytyczny / Wysoki / Średni / Niski.

