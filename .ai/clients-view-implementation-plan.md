# Plan implementacji widoku Klienci (Clients)

## 1. Przegląd
Widok "Klienci" służy do zarządzania globalną bazą kontaktów właściciela (niezależną od lokalizacji). Umożliwia przeglądanie listy klientów z funkcją wyszukiwania, dodawanie nowych klientów oraz edycję istniejących danych kontaktowych. Interfejs wykorzystuje tabelę danych oraz boczny panel (`Sheet`) do formularzy, co zapewnia płynne UX bez przeładowania strony.

**Decyzje (doprecyzowania scope):**
- Nie przewidujemy paginacji — tylko wyszukiwarkę (live search + debounce).
- Nie wyświetlamy informacji o „Ostatniej aktywności” klienta.

## 2. Routing widoku
- **Ścieżka:** `/clients`
- **Plik Astro:** `src/pages/clients.astro`

## 3. Struktura komponentów
Główny komponent React (`ClientsManager`) będzie osadzony w stronie Astro.

```text
src/pages/clients.astro (Layout: DashboardLayout)
└── ClientsManager (React, client:load)
    ├── ClientsHeader (Tytuł + Przycisk "Dodaj klienta")
    ├── ClientsList
    │   ├── SearchInput (z debounce)
    │   └── ClientsDataTable (Shadcn DataTable)
    │       └── ActionsColumn (Dropdown: Edytuj)
    └── ClientSheet (Komponent Sheet/Drawer)
        └── ClientForm (TanStack Form)
```

## 4. Szczegóły komponentów

### `src/pages/clients.astro`
- **Opis:** Główny plik strony Astro, definiuje routing i layout.
- **Odpowiedzialność:** Renderowanie szkieletu HTML, sprawdzenie sesji (middleware), załadowanie layoutu dashboardu i osadzenie wyspy React `ClientsManager`.

### `src/components/clients/ClientsManager.tsx`
- **Opis:** Komponent orkiestrujący (Smart Component).
- **Zarządzanie stanem:**
  - `isSheetOpen`: boolean - czy panel boczny jest otwarty.
  - `editingClient`: `ClientDTO | null` - dane edytowanego klienta (null oznacza tryb dodawania).
- **Obsługiwane zdarzenia:**
  - `onAddClick`: otwiera Sheet, czyści `editingClient`.
  - `onEditClick(client)`: otwiera Sheet, ustawia `editingClient`.
  - `onCloseSheet`: zamyka Sheet, czyści stan.

### `src/components/clients/ClientsList.tsx`
- **Opis:** Wyświetla listę klientów i pole wyszukiwania.
- **Główne elementy:**
  - `Input` (wyszukiwarka).
  - `DataTable` (tabela z kolumnami: Imię, Nazwisko, Email, Telefon, Akcje).
- **Logika:**
  - Używa hooka `useClients(searchQuery)`.
  - Obsługuje debounce na inpucie wyszukiwania (np. 300ms).
- **Propsy:**
  - `onEdit`: `(client: ClientDTO) => void` - callback do rodzica.

### `src/components/clients/ClientSheet.tsx`
- **Opis:** Wrapper na komponent `Sheet` z biblioteki Shadcn UI.
- **Propsy:**
  - `open`: boolean
  - `onOpenChange`: `(open: boolean) => void`
  - `client`: `ClientDTO | null` (jeśli null -> tytuł "Dodaj klienta", jeśli obiekt -> "Edytuj klienta").

### `src/components/clients/ClientForm.tsx`
- **Opis:** Formularz oparty na **TanStack Form** i walidacji **Zod**.
- **Pola:**
  - `first_name` (Text, required)
  - `last_name` (Text, required)
  - `email` (Email, optional)
  - `phone` (Text, optional)
- **Walidacja:** Zgodna z `createClientSchema` w `src/lib/validation/clients.ts`.
- **Interakcja:** Wywołuje mutację `createClient` lub `updateClient` w zależności od przekazanych propsów.
- **Propsy:**
  - `defaultValues`: `Partial<ClientDTO>` (opcjonalne)
  - `clientId`: `string` (opcjonalne, do trybu edycji)
  - `onSuccess`: `() => void` (do zamknięcia Sheeta)

## 5. Typy

Wykorzystujemy istniejące typy z `src/types.ts`:

- `ClientDTO`: Główny typ wyświetlany w tabeli.
- `CreateClientCmd`: Typ danych wysyłanych przy tworzeniu.
- `UpdateClientCmd`: Typ danych wysyłanych przy edycji.

Nie ma potrzeby tworzenia nowych typów domenowych, jedynie typy propsów dla komponentów React.

## 6. Zarządzanie stanem

Stan aplikacji opiera się na **TanStack Query** (Server State) oraz lokalnym stanie React (UI State).

### Custom Hooks (`src/lib/queries/clients.ts`)

1.  **`useClients(search?: string)`**
    -   `useQuery` z kluczem `['clients', { search }]`.
    -   Fetcher: `listClients` (z `src/lib/api/clients.ts`).
    -   `keepPreviousData: true` dla płynnego wyszukiwania.

2.  **`useCreateClientMutation()`**
    -   `useMutation`.
    -   Fetcher: `createClient` (z `src/lib/api/clients.ts`).
    -   `onSuccess`: inwalidacja klucza `['clients']`, toast sukcesu.

3.  **`useUpdateClientMutation()`**
    -   `useMutation`.
    -   Fetcher: `updateClient` (z `src/lib/api/clients.ts`).
    -   `onSuccess`: inwalidacja klucza `['clients']`, toast sukcesu.

## 7. Integracja API

Należy utworzyć warstwę fetcherów w `src/lib/api/clients.ts`, która będzie wywoływana przez hooki React Query.

1.  **Pobieranie listy:**
    -   `GET /api/clients?search=...`
    -   Response: `ClientDTO[]`
2.  **Tworzenie:**
    -   `POST /api/clients`
    -   Body: `CreateClientCmd`
    -   Response: `ClientDTO`
3.  **Aktualizacja:**
    -   `PUT /api/clients/${id}`
    -   Body: `UpdateClientCmd`
    -   Response: `ClientDTO`

Należy używać pomocnika `handleResponse` dla spójnej obsługi błędów.

## 8. Interakcje użytkownika

1.  **Wejście na stronę:** Pobranie listy klientów (Loading Skeleton -> Tabela).
2.  **Wyszukiwanie:** Wpisanie frazy w input -> Debounce -> Odświeżenie tabeli (bez pełnego przeładowania, zachowanie poprzednich danych do momentu załadowania nowych).
3.  **Dodawanie:** Kliknięcie "Dodaj klienta" -> Wysunięcie panelu bocznego -> Wypełnienie formularza -> Kliknięcie "Zapisz" -> Loader na przycisku -> Zamknięcie panelu + Toast "Klient dodany" + Nowy wiersz w tabeli.
4.  **Edycja:** Kliknięcie "Edytuj" w menu wiersza -> Wysunięcie panelu z danymi -> Zmiana danych -> "Zapisz" -> Loader -> Zamknięcie + Toast + Aktualizacja wiersza.
5.  **Anulowanie:** Kliknięcie poza panel lub "Anuluj" -> Zamknięcie panelu bez zapisu.

## 9. Warunki i walidacja

Walidacja odbywa się dwuetapowo:
1.  **Frontend (Zod + TanStack Form):**
    -   `first_name`: min. 1 znak (Wymagane).
    -   `last_name`: min. 1 znak (Wymagane).
    -   `email`: poprawny format email (jeśli podano).
2.  **Backend (API):**
    -   Ponowna walidacja Zod.
    -   API zwraca błędy walidacji w formie kontraktu:
        -   **Status:** `422 Unprocessable Entity`
        -   **Payload:** `{ "errors": [{ "path": ["field_name"], "message": "...", "code": "..." }] }` (patrz `api-plan.md` → **4.2 Validation errors (422)**)
    -   **Mapowanie 422 na pola formularza (TanStack Form):**
        -   Dla każdego `errors[i]`:
            -   jeśli `path[0]` jest nazwą pola (`first_name`, `last_name`, `email`, `phone`) → ustaw błąd pola w formularzu,
            -   jeśli `path` jest puste lub nie pasuje do pola → pokaż toast z `message` i traktuj jako błąd ogólny formularza.

## 10. Obsługa błędów

-   **Błąd pobierania listy (Query error):** Wyświetlenie komunikatu błędu zamiast tabeli z przyciskiem "Spróbuj ponownie" (wywołuje `refetch`).
-   **Błąd zapisu (np. konflikt, błąd serwera):**
    -   Toast z błędem (`sonner`).
    -   Formularz pozostaje otwarty, aby użytkownik mógł poprawić dane.
-   **Brak wyników wyszukiwania:** Stan "Empty State" w tabeli z komunikatem "Nie znaleziono klientów".
-   **Brak klientów (empty list):** Stan "Empty State" z CTA:
    -   Tekst: "Brak klientów. Dodaj pierwszego."
    -   Przycisk: "Dodaj klienta" → wywołuje `onAddClick` (otwiera `ClientSheet` w trybie dodawania).
-   **Błąd 409 Conflict (jeśli dotyczy domenowo):** Toast z komunikatem użytkowym, formularz pozostaje otwarty.
-   **Błąd 422 Validation:** mapowanie na pola formularza (patrz sekcja 9) + opcjonalny toast ogólny, jeśli są błędy nieprzypisane do pól.
-   **Błędy sieci / timeout:** Toast "Problem z połączeniem" + możliwość retry; UI powinno pozostać stabilne (bez „migotania” tabeli dzięki `keepPreviousData`).

**Standard stanu UI podczas zapisu (create/update):**
-   Przycisk "Zapisz" w stanie `loading/disabled` na czas requestu.
-   Po sukcesie: toast sukcesu + zamknięcie `Sheet` + reset formularza + invalidacja query `['clients']`.
-   Po błędzie:
    -   422: mapowanie na pola + brak zamknięcia `Sheet`.
    -   pozostałe: toast + brak zamknięcia `Sheet` (użytkownik może poprawić dane / spróbować ponownie).

## 11. Kroki implementacji

1.  **Warstwa API:** Utworzenie pliku `src/lib/api/clients.ts` z funkcjami `fetchClients`, `createClientApi`, `updateClientApi`.
2.  **Warstwa Query:** Utworzenie pliku `src/lib/queries/clients.ts` z hookami `useClients`, `useCreateClientMutation`, `useUpdateClientMutation`.
3.  **Komponent Formularza:** Implementacja `ClientForm` z użyciem `useForm` (TanStack Form) i definicją pól.
4.  **Komponent Listy:** Implementacja `ClientsList` z definicją kolumn tabeli i obsługą stanu wyszukiwania.
5.  **Komponent Manager:** Implementacja `ClientsManager` scalającego listę i `ClientSheet`.
6.  **Strona Astro:** Utworzenie `src/pages/clients.astro` i osadzenie `ClientsManager`.
7.  **Testy manualne:** Weryfikacja dodawania, edycji i wyszukiwania.

