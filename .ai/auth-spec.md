# Specyfikacja Techniczna Modułu Autentykacji (Auth Spec)

## 1. Wstęp
Niniejszy dokument opisuje architekturę techniczną modułu rejestracji (US-001) i logowania (US-002), odzyskiwania hasła oraz zarządzania sesją użytkownika w oparciu o stack: Astro 5, React 19, Supabase, TanStack Form.

## 2. Architektura Interfejsu Użytkownika (Frontend)

### 2.1. Struktura Stron (Astro Pages)
W katalogu `src/pages` zostaną utworzone dedykowane strony obsługujące procesy autentykacji. Strony te będą renderowane statycznie lub hybrydowo, ale będą zawierać interaktywne komponenty React (island architecture).

*   `src/pages/login.astro` – Strona logowania.
*   `src/pages/register.astro` – Strona rejestracji.
*   `src/pages/forgot-password.astro` – Strona inicjowania procedury resetu hasła.
*   `src/pages/auth/callback.ts` – Endpoint API (lub strona) do obsługi przekierowań z linków e-mail (np. potwierdzenie rejestracji, reset hasła) w celu ustawienia sesji w ciasteczkach.

### 2.2. Layouty
Należy utworzyć nowy layout dedykowany dla stron autentykacji, aby oddzielić go od głównego layoutu aplikacji (Dashboard).

*   `src/layouts/AuthLayout.astro`:
    *   Minimalistyczny design (brak sidebara, brak głównego menu nawigacyjnego).
    *   Wycentrowany kontener (karta) na formularze.
    *   Możliwość powrotu do strony głównej lub logowania.

### 2.3. Komponenty React (Client-Side)
Interaktywne formularze zostaną zaimplementowane jako komponenty React w katalogu `src/components/auth`. Wykorzystają one **TanStack Form** do zarządzania stanem i walidacją oraz **Shadcn/ui** do warstwy wizualnej.

*   **`LoginForm.tsx`**:
    *   Pola: Email, Password.
    *   Akcje: Logowanie, link do "Zapomniałem hasła", link do rejestracji.
    *   Obsługa błędów: Wyświetlanie komunikatu o błędnych danych ("Invalid login credentials").
*   **`RegisterForm.tsx`**:
    *   Pola: Imię, Nazwisko (opcjonalnie w MVP, ale warto zbierać), Email, Password, Confirm Password.
    *   Walidacja: Zgodność haseł, siła hasła, poprawność formatu email.
    *   Akcje: Rejestracja, link do logowania.
*   **`ForgotPasswordForm.tsx`**:
    *   Pola: Email.
    *   Akcje: Wysłanie linku resetującego.
*   **`AuthGuard.tsx`** (Opcjonalnie):
    *   Komponent React (Provider) do synchronizacji stanu sesji po stronie klienta (dla UI zależnego od bycia zalogowanym, np. przycisk Logout), choć główna ochrona będzie na poziomie Middleware Astro.

### 2.4. Walidacja i Obsługa Błędów
*   Biblioteka walidacji: **Zod** (zintegrowana z TanStack Form).
*   Scenariusze błędów:
    *   Błędne dane logowania -> komunikat inline pod formularzem.
    *   Email już zajęty -> Komunikat inline przy polu Email.
    *   Zbyt słabe hasło -> Walidacja w czasie rzeczywistym.
    *   Błąd serwera/sieci -> Toast error (Shadcn/ui Toast).

## 3. Logika Backendowa i API (Astro + Supabase)

### 3.1. Model Integracji
Wykorzystamy bibliotekę `@supabase/ssr` do bezpiecznej obsługi sesji opartej na ciasteczkach (PKCE flow). Dzięki temu tokeny JWT nie są dostępne dla JavaScriptu (HttpOnly), co zwiększa bezpieczeństwo.

### 3.2. Middleware (`src/middleware/index.ts`)
Middleware w Astro 5 będzie pełnić kluczową rolę w ochronie tras (Guard).

*   **Logika Middleware:**
    1.  Tworzy klienta Supabase Server dla każdego żądania.
    2.  Odświeża sesję (refresh token) jeśli to konieczne.
    3.  Sprawdza ścieżkę żądania:
        *   Jeśli ścieżka jest chroniona (np. `/`, `/dashboard`, `/settings`) i brak sesji -> Przekierowanie na `/login`.
        *   Jeśli ścieżka jest publiczna/auth (np. `/login`, `/register`) i istnieje aktywna sesja -> Przekierowanie do panelu (np. `/`).
    4.  Przekazuje obiekt użytkownika w `Astro.locals` do dalszego wykorzystania w stronach `.astro`.

### 3.3. Endpointy API (`src/pages/api/auth/*`)
Zamiast wywoływać Supabase bezpośrednio z Reacta w 100%, użyjemy endpointów Astro (Server Endpoints) do operacji zmieniających stan sesji (Login/Logout/Callback), aby poprawnie obsłużyć ciasteczka po stronie serwera.

*   `POST /api/auth/register`:
    *   Przyjmuje JSON z danymi formularza.
    *   Wywołuje `supabase.auth.signUp`.
    *   Zwraca sukces lub błąd.
*   `POST /api/auth/signin`:
    *   Przyjmuje JSON z danymi formularza.
    *   Wywołuje `supabase.auth.signInWithPassword`.
    *   Ustawia ciasteczka sesyjne.
    *   Zwraca przekierowanie.
*   `POST /api/auth/signout`:
    *   Wywołuje `supabase.auth.signOut`.
    *   Czyści ciasteczka.
    *   Przekierowuje na `/login`.
*   `GET /api/auth/callback`:
    *   Obsługuje powrót z OAuth (jeśli dodamy) lub linków Email (Confirm Email / Reset Password).
    *   Wymienia `code` na sesję (exchangeCodeForSession).
    *   Przekierowuje użytkownika do aplikacji.

## 4. System Autentykacji (Supabase Implementation Details)

### 4.1. Konfiguracja Klientów
Należy utworzyć dwa oddzielne helpery w `src/lib/supabase`:
1.  `server.ts`: Wykorzystuje `createServerClient` z `@supabase/ssr`. Używany w API routes, Middleware i komponentach Astro (server islands).
2.  `client.ts`: Wykorzystuje `createBrowserClient` z `@supabase/ssr`. Używany w komponentach React (np. do nasłuchiwania zmian stanu `onAuthStateChange`, chociaż główna sesja jest w ciasteczkach).

### 4.2. Przepływy (Flows)

#### A. Logowanie (US-002)
1.  Użytkownik wypełnia `LoginForm`.
2.  React wysyła `POST` na `/api/auth/signin`.
3.  Server API weryfikuje dane w Supabase.
4.  W przypadku sukcesu: API ustawia ciasteczka i zwraca kod 302 (Redirect) na Dashboard.
5.  W przypadku błędu: API zwraca 400/401 z komunikatem, formularz wyświetla błąd.

#### B. Rejestracja (US-001)
1.  Użytkownik wypełnia `RegisterForm`.
2.  React wysyła `POST` na `/api/auth/register`.
3.  Server API tworzy konto (`signUp`).
4.  W zależności od konfiguracji Supabase (Confirm Email on/off):
    *   Jeśli ON: Wyświetlany komunikat "Sprawdź skrzynkę pocztową".
    *   Jeśli OFF: Automatyczne logowanie i przekierowanie.

#### C. Wylogowanie
1.  Przycisk w Sidebarze (dostępny tylko dla zalogowanych) wysyła `POST` na `/api/auth/signout`.
2.  API czyści sesję i przekierowuje na `/login`.

#### D. Odzyskiwanie hasła
1.  `ForgotPasswordForm` wysyła żądanie do Supabase (może być client-side, bo nie wymaga sesji, lub przez API).
2.  Użytkownik klika w link w e-mailu -> trafia na `/api/auth/callback` -> przekierowanie na `/reset-password` (jako zalogowany user z tymczasową sesją).
3.  `ResetPasswordForm` pozwala ustawić nowe hasło (`updateUser`).

## 5. Zgodność z Wymaganiami Niefunkcjonalnymi
*   **Bezpieczeństwo**: Ciasteczka HttpOnly, Secure, SameSite=Lax.
*   **UX**: Feedback dla użytkownika przy każdej akcji (loading states, error messages).
*   **Kod**: TypeScript, silne typowanie DTO dla requestów auth.
*   **Struktura**: Kod auth logicznie odseparowany (`src/lib/auth`, `src/components/auth`).

