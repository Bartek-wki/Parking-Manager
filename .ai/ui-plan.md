# Architektura UI dla Parking Manager

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika opiera się na **Astro 5** jako szkielecie aplikacji (MPA - Multi Page Application) z wysoce interaktywnymi wyspami **React 19** (SPA - Single Page Application feel) tam, gdzie wymagana jest złożona logika stanu. Stylizacja wykorzystuje **Tailwind CSS 4** oraz bibliotekę komponentów **Shadcn/ui**.

**Standardy stanu i formularzy (w całej aplikacji):**
- **Server state / dane z API:** **TanStack Query** (cache, invalidacje, retry, stany `loading/empty/error`).
- **Formularze:** **TanStack Form** + walidacja **Zod** (w tym mapowanie błędów `422` na pola formularza).

Głównym założeniem nawigacyjnym jest **kontekst lokalizacji**. Większość widoków jest zagnieżdżona w ścieżce `/locations/[locationId]/...`, co pozwala na łatwe deep-linkowanie i utrzymanie stanu wybranego parkingu.

**Źródłem prawdy dla `locationId` jest zawsze URL.** UI nie powinno polegać na globalnym store jako „source of truth” dla lokalizacji (aby uniknąć rozjazdów URL ↔ stan). Opcjonalnie można przechowywać „ostatnio wybraną lokalizację” (np. w `localStorage`) wyłącznie do przekierowań po zalogowaniu / po wejściu na stronę bez kontekstu (`/`).

Aplikacja wspiera tryb jasny i ciemny (Dark Mode), jest w pełni responsywna i kładzie nacisk na natychmiastową informację zwrotną (Optimistic UI, Toasts).

## 2. Lista widoków

### 2.1. Widoki Uwierzytelniania (Publiczne)
*   **Ścieżka:** `/login`, `/register`
*   **Cel:** Umożliwienie dostępu do systemu.
*   **Kluczowe informacje:** Formularze logowania/rejestracji.
*   **Komponenty:** `Card`, `Form` (TanStack Form), `Input`, `Button`.
*   **UX/Bezpieczeństwo:** Walidacja danych wejściowych (zod), obsługa błędów autoryzacji, bezpieczne przechowywanie tokena (zarządzane przez klienta Supabase).

### 2.2. Tworzenie Lokalizacji / Onboarding
*   **Ścieżka:** `/welcome` (Onboarding) lub Modal dostępny globalnie.
*   **Cel:** Utworzenie nowej przestrzeni parkingowej (pierwszej lub kolejnej).
*   **Kluczowe informacje:** Formularz: Nazwa parkingu, Domyślna cena dzienna, Domyślna cena miesięczna.
*   **Komponenty:** `CreateLocationDialog`, `Form` (z walidacją), `EmptyState` (tylko w onboardingu).
*   **UX:**
    *   W onboardingu: Blokada nawigacji do momentu utworzenia.
    *   W aplikacji: Dostępny z poziomu `LocationSwitcher` (przycisk "Dodaj parking").
    *   Po utworzeniu: Automatyczne przełączenie kontekstu na nową lokalizację.

### 2.3. Kalendarz (Dashboard)
*   **Ścieżka:** `/locations/[locationId]/calendar` (Widok domyślny po wejściu w lokalizację)
*   **Cel:** Główne centrum dowodzenia. Podgląd obłożenia i szybkie zarządzanie rezerwacjami.
*   **Kluczowe informacje:**
    *   Siatka kalendarza (miesiąc) lub lista agendy (mobile).
    *   Kafelki rezerwacji (Imię, Nazwisko, Miejsce, Status płatności).
    *   Kolorystyczne rozróżnienie dostępności.
    *   **Wyróżnienie rezerwacji kończących się w ciągu 3 dni** (spójna reguła w całej aplikacji).
*   **Kluczowe komponenty:**
    *   `FullCalendar` (React Island).
    *   `BookingModal` (Tworzenie/Edycja/Podgląd).
    *   `SpotFilter` (Select do filtrowania po miejscu).
*   **UX/Dostępność:**
    *   Responsywność: Przełączanie widoku Grid/List na breakpoint `md`.
    *   Szybka akcja: Kliknięcie w dzień -> Nowa rezerwacja. Kliknięcie w event -> Szczegóły.
    *   Legenda: Jasne oznaczenie rezerwacji stałych (linia ciągła) vs okresowych (przerywana/jasna).

### 2.4. Ustawienia Lokalizacji
*   **Ścieżka:** `/locations/[locationId]/settings`
*   **Cel:** Konfiguracja parametrów konkretnego parkingu.
*   **Struktura:** Widok oparty na zakładkach (`Tabs`).
    *   **Tab 1: Ogólne:** Nazwa, Ceny domyślne (Dziennie/Miesięcznie).
    *   **Tab 2: Miejsca:** Lista miejsc (P1, P2...), Status (Aktywne/Nieaktywne), Akcje (Edytuj). Brak usuwania — miejsce można dezaktywować/reaktywować.
    *   **Tab 3: Cennik (Wyjątki):** Tabela wyjątków cenowych (Daty, % zmiany, Opis, Akcje: Edytuj, Usuń).
*   **Kluczowe komponenty:** `Tabs`, `Table` (z sortowaniem), `Switch` (Status miejsca), `Badge` (zmiana %, np. +20%), `StatusBadge` (Status wyjątku: Aktywny/Przyszły), `AlertDialog` (Usuwanie wyjątku).
*   **UX:**
    *   "Natural Sort Order" dla miejsc (P1, P2, P10).
    *   Zapobieganie dezaktywacji miejsca lub usunięciu wyjątku, jeśli istnieją konflikty (backend validation -> toast error).

### 2.5. Klienci (Globalny)
*   **Ścieżka:** `/clients`
*   **Cel:** Baza kontaktów niezależna od lokalizacji.
*   **Kluczowe informacje:** Imię, Nazwisko, E-mail, Telefon, Ostatnia aktywność.
*   **Kluczowe komponenty:** `DataTable` (z wyszukiwaniem i paginacją), `Sheet` (Panel boczny edycji klienta).
*   **UX:**
    *   Wyszukiwarka "live" (debounce).
    *   Edycja w panelu bocznym (`Sheet`) zamiast nowej strony, aby zachować kontekst listy.

### 2.6. Logi Systemowe
*   **Ścieżka:** `/locations/[locationId]/logs`
*   **Cel:** Audyt wysyłek e-mail i automatyzacji.
*   **Kluczowe informacje:** Data, Typ powiadomienia, Odbiorca, Status (Wysłano/Błąd), Treść błędu.
*   **Kluczowe komponenty:** `DataTable` (z filtrowaniem po statusie Success/Error), `StatusBadge`.
*   **UX:** Kolorowanie wierszy z błędami na jasnoczerwony (w trybie jasnym) dla szybkiej identyfikacji problemów.

## 3. Mapa podróży użytkownika

### 3.1. Scenariusz: Nowa Rezerwacja (Happy Path)
1.  **Wejście:** Użytkownik loguje się i trafia na Kalendarz domyślnej lokalizacji.
2.  **Inicjacja:** Klika w pustą komórkę dnia (np. 15-go).
3.  **Formularz:** Otwiera się `BookingModal` z predefiniowaną datą startu.
4.  **Konfiguracja:**
    *   Wybiera Klienta (Select z wyszukiwaniem) lub dodaje nowego ("+ Nowy klient" -> inline form).
    *   Wybiera Miejsce (Select filtrujący tylko aktywne).
    *   Wybiera Typ: Okresowa (wybiera datę końcową) lub Stała (checkbox "Bezterminowa").
5.  **Weryfikacja:** System w tle (`useQuery`) pyta API `/bookings/preview`. Wyświetla koszt i dostępność.
6.  **Zatwierdzenie:** Użytkownik klika "Zapisz". Button zmienia stan na `Loading`.
7.  **Wynik:** Modal zamyka się. Toast wyświetla "Rezerwacja utworzona". Kalendarz odświeża dane (re-fetch) i pokazuje nowy kafelek.

### 3.2. Scenariusz: Zarządzanie Wyjątkami Cenowymi (Dodawanie)
1.  **Nawigacja:** Użytkownik wybiera "Ustawienia" w menu bocznym -> Zakładka "Cennik".
2.  **Akcja:** Klika "Dodaj wyjątek".
3.  **Formularz:** Wpisuje zakres dat (np. Święta) i zmianę ceny (+50%).
4.  **Zapis:** Po zapisaniu, wyjątek pojawia się na liście z badgem "Planowany".
5.  **Weryfikacja:** Użytkownik wraca do Kalendarza, próbuje stworzyć rezerwację w tym terminie -> widzi podwyższoną cenę w podglądzie kalkulacji.

### 3.3. Scenariusz: Dodanie nowej lokalizacji
1.  **Akcja:** Użytkownik rozwija `LocationSwitcher` w nagłówku.
2.  **Wywołanie:** Klika przycisk "+ Dodaj nowy parking" na dole listy.
3.  **Formularz:** W modalu podaje nazwę (np. "Parking Centrum") oraz ceny domyślne.
4.  **Zatwierdzenie:** Klika "Utwórz".
5.  **Wynik:** Modal zamyka się, aplikacja przeładowuje się do widoku kalendarza nowo utworzonej lokalizacji (`/locations/[new-id]/calendar`).

### 3.4. Scenariusz: Edycja ustawień lokalizacji
1.  **Nawigacja:** Użytkownik wybiera "Ustawienia" w menu bocznym i pozostaje na domyślnej zakładce "Ogólne".
2.  **Edycja:** Użytkownik zmienia nazwę parkingu lub domyślne stawki cenowe.
3.  **Zapis:** Klika "Zapisz zmiany".
4.  **Wynik:** Toast wyświetla potwierdzenie "Ustawienia zaktualizowane". Jeśli zmieniono nazwę, aktualizuje się ona natychmiast w nagłówku i przełączniku lokalizacji (re-fetch danych / odświeżenie widoku na podstawie URL).

### 3.5. Scenariusz: Zarządzanie miejscami parkingowymi (Create/Update + aktywacja/dezaktywacja)
1.  **Nawigacja:** Użytkownik przechodzi do zakładki "Miejsca" w Ustawieniach.
2.  **Dodawanie:**
    *   Klika "+ Dodaj miejsce".
    *   Wpisuje numer/oznaczenie (np. "P-15") w modalu lub wierszu edycji.
    *   Zatwierdza Enterem lub przyciskiem. Nowe miejsce pojawia się na liście.
3.  **Edycja:** Kliknięcie ikony ołówka przy miejscu pozwala na szybką zmianę jego nazwy.
4.  **Dezaktywacja:** Przełączenie switcha "Aktywne" przy miejscu wyłącza możliwość jego rezerwacji w przyszłości.
5.  **Reaktywacja:** Ponowne przełączenie switcha przywraca możliwość rezerwacji miejsca.
6.  **Konflikt domenowy:** Jeśli backend odrzuci zmianę (np. aktywne rezerwacje blokują dezaktywację), UI pokazuje Toast error z komunikatem użytkowym.

### 3.6. Scenariusz: Edycja i usuwanie wyjątków cenowych
1.  **Nawigacja:** Użytkownik znajduje się w "Ustawieniach" -> zakładka "Cennik".
2.  **Edycja:**
    *   Klika ikonę ołówka przy istniejącym wyjątku (np. "Weekend majowy").
    *   W modalu zmienia wartość zmiany ceny (np. z +20% na +30%) lub zakres dat.
    *   Zatwierdza zmiany. System waliduje poprawność dat (np. data końcowa > początkowa).
    *   **Zasada:** Zaktualizowany wyjątek wpływa tylko na **nowo tworzone** lub **edytowane** rezerwacje. Istniejące rezerwacje zachowują swoją ustaloną cenę (snapshot ceny).
3.  **Usuwanie:**
    *   Klika ikonę kosza przy wyjątku.
    *   Potwierdza akcję w `AlertDialog`.
    *   Wyjątek znika z listy i przestaje być uwzględniany w kalkulatorze (`/bookings/preview`).

### 3.7. Scenariusz: Edycja rezerwacji
1.  **Inicjacja:** Użytkownik klika w istniejący kafelek rezerwacji na Kalendarzu.
2.  **Szczegóły:** Otwiera się Modal w trybie "Szczegóły / Edycja". Wyświetlane są aktualne dane oraz podsumowanie kosztów.
3.  **Modyfikacja:** Użytkownik zmienia zakres dat (np. przedłuża pobyt o 2 dni) lub zmienia miejsce parkingowe.
4.  **Walidacja na żywo:** Po zmianie dat/miejsca, system automatycznie odpytuje endpoint `/bookings/preview` z mechanizmami stabilizacji:
    *   **debounce** (np. 300–500ms),
    *   **anulowanie poprzedniego requestu** (AbortController) przy kolejnej zmianie,
    *   **cache** per `(locationId, spotId, startDate, endDate, type, excludeBookingId)` aby unikać „mielenia” przy powrotach do tych samych wartości.
    *   W trybie edycji request zawiera `excludeBookingId`, aby nie wykrywać konfliktu z edytowaną rezerwacją.
    *   Jeśli nowe miejsce jest zajęte w nowym terminie: Wyświetla się komunikat o konflikcie, przycisk "Zapisz" jest zablokowany.
    *   Jeśli dostępne: Wyświetlana jest nowa kalkulacja kosztów.
5.  **Zapis:** Użytkownik zatwierdza zmiany.
6.  **Wynik:** Rezerwacja zostaje zaktualizowana w bazie. Kalendarz odświeża się, pokazując zaktualizowany kafelek. Historia płatności pozostaje zachowana.

### 3.8. Scenariusz: Zmiana statusu płatności
1.  **Inicjacja:** Użytkownik otwiera szczegóły rezerwacji z poziomu Kalendarza.
2.  **Widok:** W sekcji "Płatność" widoczny jest obecny status (np. "Nieopłacone") oraz historia zmian.
3.  **Akcja:** Użytkownik przełącza status (np. z "Nieopłacone" na "Opłacone") za pomocą Toggle/Select.
4.  **Zapis:** Zmiana jest zapisywana automatycznie lub po kliknięciu "Zapisz" (zależnie od UX modala - preferowane "Zapisz" dla spójności transakcji).
5.  **Audyt:** System w tle dodaje wpis do tabeli `payment_history` z aktualną datą i identyfikatorem użytkownika.
6.  **Wynik:** Status w modalu aktualizuje się natychmiast. Na kafelku rezerwacji w kalendarzu znika ostrzeżenie/ikona braku płatności.

## 4. Układ i struktura nawigacji

### 4.1. Layout Główny (Shell)
Aplikacja wykorzystuje układ **Sidebar Layout** na desktopie i **Collapsible Drawer** na mobile.

*   **Pasek Boczny (Sidebar) / Drawer:**
    *   **Nagłówek:** Logo aplikacji.
    *   **Sekcja Kontekstowa (Lokalizacja):**
        *   Kalendarz (`/locations/[id]/calendar`)
        *   Logi (`/locations/[id]/logs`)
        *   Ustawienia (`/locations/[id]/settings`)
    *   **Separator**
    *   **Sekcja Globalna:**
        *   Klienci (`/clients`)
    *   **Stopka:** Profil użytkownika, Wyloguj.

### 4.2. Header (Pasek górny)
*   **Desktop & Mobile:**
    *   **Po lewej:** Trigger menu (Mobile only) / Breadcrumbs (Desktop).
    *   **Centrum/Prawa strona:** `LocationSwitcher`. Jest to trwały komponent (Dropdown), który pozwala zmienić aktywną lokalizację. Zmiana powoduje przekierowanie do odpowiedniego widoku w nowym kontekście (np. z `loc1/settings` na `loc2/settings`).

### 4.3. Mechanizm Nawigacji
*   Przejścia między stronami (Astro) są szybkie dzięki `ViewTransitions`.
*   Stan wewnątrz wysp React (np. otwarty Modal, wybrany filtr w tabeli) jest lokalny lub w URL (dla filtrów), co pozwala na udostępnianie linków do konkretnego widoku danych.

## 5. Kluczowe komponenty

### 5.1. LocationSwitcher (Global)
Dropdown w nagłówku. Wyświetla listę dostępnych parkingów oraz przycisk akcji "**+ Dodaj lokalizację**". Obsługuje stan ładowania i "Empty State". Kluczowy dla UX - musi być zawsze widoczny i umożliwiać szybkie skalowanie biznesu (dodawanie parkingów).

### 5.2. BookingModal (Island)
Złożony formularz obsługujący:
*   Tryby: Create / Edit / View Details.
*   Logikę biznesową: przeliczanie kosztów w czasie rzeczywistym.
*   Zagnieżdżone tworzenie danych: Inline creation dla Klienta.
*   Feedback: Sekcja "Podsumowanie kalkulacji" pokazująca cenę bazową i zastosowane wyjątki.
*   **Płatność i audyt:** Sekcja z aktualnym statusem płatności oraz listą historii zmian.
    *   `PaymentHistoryList` pobiera dane z `GET /bookings/:id/history`.
    *   Stany: `loading` (skeleton), `empty` ("Brak historii zmian"), `error` (komunikat + retry).

### 5.3. StatusBadge (Shared)
Komponent wizualny ujednolicający statusy w całej aplikacji:
*   Płatności: Opłacone (Zielony), Nieopłacone (Żółty), Zaległe (Czerwony).
*   Rezerwacje: Aktywna (Niebieski), Zakończona (Szary).
*   Wyjątki: Aktywny (Zielony), Przyszły (Niebieski).

### 5.4. DataTables (Shared)
Wrapper na tabelę Shadcn, obsługujący:
*   Responsywność (poziomy scroll na mobile).
*   Skeleton Loading (migające wiersze podczas ładowania danych).
*   Puste stany (Empty States) z przyciskiem Call-to-Action (np. "Brak klientów. Dodaj pierwszego").

### 5.5. ErrorBoundary & ToastProvider
*   **Toast (Sonner):** Do obsługi błędów API (np. "Konflikt rezerwacji") i sukcesów ("Zapisano").
*   **AlertDialog:** Do potwierdzania akcji nieodwracalnych (usuwanie).
*   **ErrorBoundary:** Zabezpieczenie przed "białym ekranem" w przypadku błędu renderowania komponentu React.

## 6. Standard obsługi stanów danych i błędów

### 6.1. Stany danych (loading / empty / error)
- **Loading:** preferowane skeletony dopasowane do kształtu UI (tabela/kalendarz/modal) zamiast globalnych spinnerów.
- **Empty:** zawsze czytelny komunikat + CTA jeśli istnieje sensowna akcja.
- **Error:** komunikat z przyczyną „użytkową” + akcja retry; szczegóły techniczne trafiają do logów/console.

### 6.2. Minimalny standard mapowania błędów HTTP
- **401/403:** komunikat o braku dostępu / wygaśnięciu sesji + akcja „Zaloguj ponownie”.
- **409:** konflikt domenowy (np. kolizja rezerwacji) — pokazujemy błąd w kontekście formularza i blokujemy zapis.
- **422:** błąd walidacji — wskazujemy pola formularza, nie tylko toast.
- **500:** błąd serwera — komunikat ogólny + retry.
- **timeout / network:** komunikat o problemie z połączeniem + retry; UI pozostaje stabilne (bez „migotania”).

### 6.3. Ustandaryzowane puste stany (CTA)
- **Brak lokalizacji:** CTA „Utwórz lokalizację” (np. `CreateLocationDialog` lub onboarding `/welcome`).
- **Brak miejsc w lokalizacji:** CTA „Dodaj miejsce”.
- **Brak klientów:** CTA „Dodaj klienta”.
