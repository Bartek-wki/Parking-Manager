# Plan implementacji widoku Ustawień Lokalizacji (Location Settings)

## 1. Przegląd
Rozbudowa istniejącego widoku ustawień lokalizacji o zarządzanie miejscami parkingowymi oraz wyjątkami cenowymi. Obecny komponent `LocationSettings` zostanie przebudowany, aby obsługiwać nawigację opartą na zakładkach (`Tabs`).

Celem jest realizacja wymagań:
1.  **Miejsca (Spots):** Create/Update + aktywacja/dezaktywacja miejsc, zarządzanie numeracją i aktywnością (US-010, US-011, US-092).
2.  **Cennik (Pricing):** Zarządzanie wyjątkami cenowymi (US-050).
3.  **Ogólne:** Zachowanie istniejącej funkcjonalności edycji nazwy i stawek bazowych.

## 2. Routing widoku
- Ścieżka: `/locations/[locationId]/settings` (istniejąca).
- Zarządzanie stanem zakładek:
  - Domyślnie otwiera zakładkę "Ogólne".
  - Opcjonalnie: Synchronizacja wybranej zakładki z URL query param `?tab=...` dla lepszego UX (linkowanie do konkretnych ustawień).

## 3. Struktura komponentów

Należy zmodyfikować istniejący komponent `LocationSettings.tsx` wprowadzając strukturę zakładek.

```text
src/components/locations/LocationSettings.tsx (Refactor)
├── PageHeader (Tytuł i opis - przeniesione z CardHeader)
└── Tabs (Shadcn UI)
    ├── TabsList
    │   ├── Trigger "Ogólne"
    │   ├── Trigger "Miejsca"
    │   └── Trigger "Cennik"
    │
    ├── TabsContent value="general"
    │   └── Card (Istniejący wrapper)
    │       └── LocationForm (Istniejący formularz)
    │
    ├── TabsContent value="spots"
    │   └── SpotsManager (Nowy Container)
    │       ├── SpotsToolbar (Search lokalny + debounce, Add Button)
    │       ├── SpotsTable (DataTable)
    │       │   ├── SpotStatusSwitch (Cell)
    │       │   └── SpotActions (Edit Button)
    │       └── SpotDialog (Create/Edit Form)
    │
    └── TabsContent value="pricing"
        └── PricingExceptionsManager (Nowy Container)
            ├── PricingToolbar (Add Button)
            ├── PricingExceptionsTable (DataTable)
            │   ├── PricingBadge (Visual: zmiana %, np. +20%)
            │   ├── StatusBadge (Shared: Aktywny/Przyszły)
            │   └── PricingActions (Edit, Delete Buttons)
            ├── PricingExceptionDialog (Create/Edit Form)
            └── DeletePricingAlert (AlertDialog)
```

## 4. Szczegóły komponentów

### `LocationSettings` (Modyfikacja)
- **Zmiana:** Zastąpienie pojedynczego `Card` strukturą `Tabs`.
- **Logika:** Pobieranie `locationId` z propsów. Zarządzanie aktywną zakładką (state lub URL).

### `SpotsManager`
- **Opis:** Główny kontener logiki biznesowej dla miejsc.
- **Odpowiedzialność:**
  - Pobieranie danych: `useSpots(locationId)`.
  - Zarządzanie stanem modala (Create/Edit).
  - Obsługa mutacji (przekazywanie handlerów do tabeli i dialogu).
  - Lokalny filtr po `spot_number` (bez API) + debounce w `SpotsToolbar`.
- **Elementy UI:** Karta lub czysty layout z Toolbar i Tabelą.

### `SpotsTable`
- **Kolumny:**
  - `Numer` (Sortowanie naturalne).
  - `Status` (Switch - natychmiastowa akcja).
  - `Akcje` (Button Edytuj - otwiera dialog).
- **Propsy:** `data`, `isLoading`, `onEdit`, `onToggleStatus`.

### `SpotDialog`
- **Opis:** Modal z formularzem (TanStack Form + Zod).
- **Pola:** `spot_number` (Input).
- **Tryby:** Create (pusty formularz) / Edit (pre-fill).
- **Walidacja:** Wymagany numer miejsca. Obsługa błędu 422 (duplikat) i mapowanie na pole `spot_number`.

### `PricingExceptionsManager`
- **Opis:** Kontener logiki dla wyjątków cenowych.
- **Odpowiedzialność:**
  - Pobieranie danych: `usePricingExceptions(locationId)`.
  - Logika modala (Create/Edit) i alertu usuwania.

### `PricingExceptionsTable`
- **Kolumny:**
  - `Zakres dat` (Start - End).
  - `Zmiana` (Badge np. "+20%", "-10%").
  - `Status` (StatusBadge: "Aktywny" jeśli dziś w zakresie, "Przyszły" jeśli start w przyszłości).
  - `Opis`.
  - `Akcje` (Edytuj, Usuń).
- **Propsy:** `data`, `onEdit`, `onDelete`.

### `PricingExceptionDialog`
- **Pola:** `start_date`, `end_date`, `percentage_change`, `description`.
- **Walidacja:** `end_date` >= `start_date`. Walidacja zakresów po stronie serwera (konflikty).

## 5. Typy (src/types.ts)

Wykorzystanie istniejących definicji DTO i Cmd.
Wymagane zdefiniowanie/importowanie w komponentach:
- `SpotDTO`, `CreateSpotCmd`, `UpdateSpotCmd`
- `PricingExceptionDTO`, `CreatePricingExceptionCmd`

## 6. Zarządzanie stanem

### Warstwa API (`src/lib/api/`)
Funkcje wykonujące bezpośrednie zapytania `fetch` do backendu.
1.  **`src/lib/api/spots.ts`**:
    - `fetchSpots(locationId)`
    - `createSpot(locationId, data)`
    - `updateSpot(spotId, data)`
2.  **`src/lib/api/pricing.ts`**:
    - `fetchPricingExceptions(locationId)`
    - `createPricingException(locationId, data)`
    - `updatePricingException(locationId, exceptionId, data)`
    - `deletePricingException(locationId, exceptionId)`

### Warstwa Queries (`src/lib/queries/`)
Hooki TanStack Query opakowujące funkcje z `src/lib/api`.
1.  **`src/lib/queries/spots.ts`**:
    - `useSpots(locationId)`: Query Key `['spots', locationId]`
    - `useCreateSpotMutation(locationId)`: Inwalidacja `['spots', locationId]`
    - `useUpdateSpotMutation(locationId)`: Inwalidacja `['spots', locationId]`
2.  **`src/lib/queries/pricing.ts`**:
    - `usePricingExceptions(locationId)`: Query Key `['pricing-exceptions', locationId]`
    - `useCreatePricingExceptionMutation(...)`
    - `useUpdatePricingExceptionMutation(...)`
    - `useDeletePricingExceptionMutation(...)`

### Stan UI
- Lokalne `useState` w Managerach dla kontroli widoczności dialogów i przechowywania edytowanego obiektu (`editingSpot`, `editingException`).

### Standard obsługi błędów (wymagany)
Warstwa `src/lib/api/*` **musi** zwracać/throw typowany błąd zawierający:
- `status: number` (np. 422/409/401)
- `payload?: unknown` (np. `{ error: string }` lub `{ errors: ZodIssue[] }`)
- `message: string` (user-facing lub fallback)

Wymagane przypadki użycia w UI:
- **422 Validation Error**: mapowanie `errors` na pola formularza (TanStack Form).
- **409 Conflict**: błąd domenowy (toast lub błąd formularza zależnie od kontekstu), blokada zapisu.
- **401/403**: rozpoznawalne w UI (np. komunikat o braku dostępu / wygaśnięciu sesji). Szczegóły autoryzacji są poza zakresem tego planu.

## 7. Integracja API

Endpointy są już zaimplementowane:
- `GET/POST /api/locations/[id]/spots`
- `PATCH /api/spots/[id]`
- `GET/POST /api/locations/[id]/pricing`
- `PUT/DELETE /api/locations/[id]/pricing/[id]`

**Uwaga:** API zwraca błędy w formacie `{ error: string }` lub `{ errors: ZodIssue[] }`. Funkcje w `src/lib/api/` powinny rzucać ustandaryzowane błędy, które hooki Query przekażą do UI.

## 8. Interakcje użytkownika

1.  **Przełączanie zakładek:** URL nie musi się zmieniać, ale stan `defaultValue` Tabs powinien być zachowany.
2.  **Szybka edycja statusu miejsca:** Switch w tabeli działa z loading state'm na samym switchu.
3.  **Walidacja formularzy:** Błędy walidacji (np. nachodzące na siebie daty wyjątków - błąd 409 z API) powinny być wyświetlane w formularzu lub jako Toast.

4.  **Stany danych i UX (minimum zgodne z UI-plan §6.1–6.3):**
    - **Loading:** skeletony dopasowane do UI (tabela/dialog), bez globalnych spinnerów.
    - **Empty:** komunikat + CTA (np. "Brak miejsc" → "Dodaj miejsce", "Brak wyjątków" → "Dodaj wyjątek").
    - **Error:** komunikat użytkowy + akcja retry (np. przycisk "Spróbuj ponownie").
    - **Network/timeout:** stabilny UI bez migotania; retry dostępne.

## 9. Warunki i walidacja
- **Unikalność numeru miejsca:** API zwraca 422. Formularz `SpotDialog` musi obsłużyć ten błąd i przypisać go do pola `spot_number`.
- **Daty wyjątków:** Walidacja `start <= end` w Zod Schema po stronie klienta (duplikacja logiki z backendu dla lepszego UX).

## 10. Obsługa błędów
- **Toasty (Sonner):** Sukces ("Zapisano zmiany"), Błąd ("Wystąpił błąd...").
- **Alert Dialog:** Przed usunięciem wyjątku cenowego.
- **Brak metody Delete dla Miejsc:** Użytkownik może tylko dezaktywować miejsce (zgodnie z PRD US-278 i API). Przycisk "Usuń" nie powinien istnieć dla miejsc.

## 11. Kroki implementacji

1.  **Warstwa API:** Utworzenie plików `src/lib/api/spots.ts` oraz `src/lib/api/pricing.ts` z funkcjami fetchującymi.
2.  **Warstwa Queries:** Utworzenie plików `src/lib/queries/spots.ts` oraz `src/lib/queries/pricing.ts` z hookami React Query.
3.  **Refactor:** Przebudowa `LocationSettings.tsx` - dodanie Tabs, przeniesienie obecnego formularza do `TabsContent value="general"`.
4.  **Spots UI:**
    - Implementacja `SpotsTable` i `SpotDialog`.
    - Złożenie w `SpotsManager`.
    - Osadzenie w zakładce "Miejsca".
5.  **Pricing UI:**
    - Implementacja `PricingExceptionsTable` i `PricingExceptionDialog`.
    - Złożenie w `PricingExceptionsManager`.
    - Osadzenie w zakładce "Cennik".
6.  **Weryfikacja:** Sprawdzenie działania Create/Update + aktywacji/dezaktywacji oraz obsługi błędów (422/409/401).
