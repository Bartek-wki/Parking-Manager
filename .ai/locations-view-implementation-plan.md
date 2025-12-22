# Plan implementacji widoku Zarządzania Lokalizacjami (Location Manager)

## 1. Przegląd
Widok i zestaw komponentów odpowiedzialnych za zarządzanie kontekstem lokalizacji w aplikacji. Obejmuje globalny przełącznik lokalizacji (`LocationSwitcher`) dostępny w nagłówku, modal tworzenia nowej lokalizacji (`CreateLocationDialog`) oraz panel edycji ustawień lokalizacji (`LocationSettings`).

**Kluczowe założenie architektoniczne:** Źródłem prawdy dla wybranej lokalizacji jest **URL** (`/locations/[locationId]/...`). Komponenty UI reagują na zmianę URL. Zarządzanie stanem serwera (dane) odbywa się przez **TanStack Query**, a formularze obsługiwane są przez **TanStack Form**.

## 2. Routing widoku
- **Globalny (Komponent):** `LocationSwitcher` - w nagłówku, odczytuje aktywne ID z URL.
- **Ustawienia Lokalizacji:** `/locations/[locationId]/settings` - widok edycji konkretnej lokalizacji.
- **API (Backend):** 
    - `GET /api/locations`
    - `POST /api/locations`
    - `PUT /api/locations/[id]`

## 3. Struktura komponentów

```text
src/layouts/Layout.astro (Server)
└── Header (Astro/React)
    └── LocationSwitcher.tsx (client:load)
        ├── Select / Combobox (Shadcn UI)
        │   ├── LocationItem (List Item - Link)
        │   └── CreateNewButton (+ Dodaj parking)
        └── CreateLocationDialog.tsx
            └── DialogContent (Shadcn UI)
                └── LocationForm.tsx
                    ├── Field (Name)
                    ├── Field (Daily Rate)
                    ├── Field (Monthly Rate)
                    └── Subscribe / SubmitButton

src/pages/locations/[id]/settings.astro (Server)
└── LocationSettings.tsx (client:load)
    └── Card (Shadcn UI)
        └── LocationForm.tsx (Reused)
```

## 4. Szczegóły komponentów

### `LocationSwitcher`
- **Opis:** Dropdown w nagłówku. Wyświetla nazwę lokalizacji na podstawie ID pobranego z URL (porównując z listą pobraną przez TanStack Query).
- **Główne elementy:** `Popover` / `Select`, `CommandList`.
- **Obsługiwane interakcje:**
    - Wybór lokalizacji: Powoduje nawigację (przekierowanie) do `/locations/[selectedId]/calendar` (lub zachowuje obecny widok jeśli to możliwe).
    - Kliknięcie "+ Dodaj parking": otwiera `CreateLocationDialog`.
- **Typy:** Lista `LocationDTO[]`.
- **Dane:** Używa `useQuery({ queryKey: ['locations'] })` do pobrania listy.
- **Props:** 
    - `currentLocationId?`: string | null (przekazany z Astro lub pobrany z URL).

### `CreateLocationDialog`
- **Opis:** Modal (Dialog) zawierający formularz tworzenia nowej lokalizacji.
- **Główne elementy:** `Dialog`, `DialogTrigger` (opcjonalnie, sterowany stanem `open`), `DialogContent`, `DialogHeader`, `DialogTitle`.
- **Obsługiwane interakcje:**
    - Zamknięcie modala.
    - Przesłanie formularza: Wywołuje mutację `createLocation` -> Inwaliduje query `['locations']` -> Przekierowuje na nową stronę.
- **Props:** 
    - `open`: boolean
    - `onOpenChange`: (open: boolean) => void

### `LocationForm`
- **Opis:** Generyczny formularz (tworzenie/edycja) oparty na **TanStack Form**.
- **Główne elementy:** `form.Field`, `Input` (Shadcn), `Button`.
- **Obsługiwane walidacje:** Używa walidatora Zod (`zodValidator`) z `createLocationSchema`.
- **Props:**
    - `defaultValues?`: Partial<LocationDTO>
    - `onSubmit`: (values: CreateLocationCmd) => Promise<void>
    - `isSubmitting`: boolean

### `LocationSettings`
- **Opis:** Widok ustawień dla konkretnej lokalizacji.
- **Działanie:**
    - Używa `useQuery({ queryKey: ['locations'] })` (korzysta z cache) aby znaleźć dane edytowanej lokalizacji lub pobiera je dedykowanym endpointem, jeśli lista nie jest załadowana.
    - Używa `useMutation` do aktualizacji.
- **Props:**
    - `locationId`: string.

## 5. Typy

Wykorzystujemy typy zdefiniowane w `src/types.ts` oraz schematy z `src/lib/validation/locations.ts`.

### Modele (z `src/types.ts`)
```typescript
// LocationDTO - do wyświetlania i stanu
interface LocationDTO {
  id: string;
  name: string;
  daily_rate: number;
  monthly_rate: number;
}

// CreateLocationCmd - do formularza tworzenia
type CreateLocationCmd = {
  name: string;
  daily_rate: number;
  monthly_rate: number;
}
```

### Schematy Walidacji
Należy zaimportować `createLocationSchema` bezpośrednio z `src/lib/validation/locations.ts` do użycia w `zodValidator` z paczki `@tanstack/zod-form-adapter`.

## 6. Zarządzanie stanem

### Server State (TanStack Query)
Zarządzanie danymi lokalizacji odbywa się w pełni przez TanStack Query.
- **Query Key:** `['locations']` - lista wszystkich lokalizacji.
- **Mutacje:**
    - `useCreateLocationMutation`: tworzy nową, po sukcesie inwaliduje `['locations']`.
    - `useUpdateLocationMutation`: aktualizuje, po sukcesie inwaliduje `['locations']`.

### Client State (Nano Stores)
Nano Stores używane tylko do celów UX (redirectów), nie jako główne źródło danych dla widoków.
- **Atom:** `$lastVisitedLocationId` - zapisywany w `localStorage`. Służy do automatycznego przekierowania użytkownika wchodzącego na `/`.

## 7. Integracja API

Należy utworzyć definicje funkcji fetchujących (Query Functions) w `src/lib/api/locations.ts`, które będą używane przez hooki TanStack Query.

- `fetchLocations()`: Wrapper na `GET /api/locations`.
- `createLocation(data)`: Wrapper na `POST /api/locations`.
- `updateLocation({ id, data })`: Wrapper na `PUT /api/locations/${id}`.

## 8. Interakcje użytkownika

### Scenariusz 1: Przełączenie lokalizacji
1. Użytkownik klika w nagłówku.
2. `LocationSwitcher` renderuje listę z cache TanStack Query (`data` z `useQuery`).
3. Wybór elementu powoduje **nawigację** (zmianę URL).
4. Nowa strona ładuje się, TanStack Query ponownie pobiera (lub bierze z cache) dane, `LocationSwitcher` podświetla nową pozycję na podstawie URL.

### Scenariusz 2: Dodanie lokalizacji
1. Użytkownik klika "+ Dodaj parking".
2. `LocationForm` (TanStack Form) obsługuje input.
3. Submit uruchamia `mutation.mutateAsync()`.
4. `onSuccess` mutacji:
    - `queryClient.invalidateQueries({ queryKey: ['locations'] })`.
    - Przekierowanie (`window.location.href = ...`).
    - Toast sukcesu.

### Scenariusz 3: Edycja ustawień
1. Formularz `LocationSettings` inicjalizuje się danymi z cache'a.
2. Użytkownik zmienia dane i zapisuje.
3. Mutacja wysyła PUT.
4. `onSuccess`: Inwalidacja `['locations']` (dzięki temu nazwa w nagłówku od razu się zaktualizuje po refetchu w tle).

## 9. Warunki i walidacja

- **TanStack Form:** Walidacja `onChange` lub `onBlur` przy użyciu adaptera Zod.
- **API Errors:** Obsługa w `onError` mutacji (np. wyświetlenie Toasta z komunikatem błędu API).
- **Loading State:** Wykorzystanie flag `isLoading` (Query) i `isPending` (Mutation) do blokowania UI.

## 10. Obsługa błędów

- **Global Error Boundary:** Dla błędów krytycznych podczas renderowania.
- **Query Error:** Jeśli pobranie listy lokalizacji się nie uda, `LocationSwitcher` powinien wyświetlić stan błędu (np. "Nie udało się załadować parkingów") z przyciskiem "Spróbuj ponownie".

## 11. Kroki implementacji

1. **API Service:** Utworzenie funkcji fetchujących w `src/lib/api/locations.ts`.
2. **Hooki Query:** (Opcjonalnie) Utworzenie custom hooków `useLocations`, `useCreateLocation`, `useUpdateLocation` w `src/lib/queries/locations.ts` dla lepszej separacji.
3. **Formularz:** Implementacja `LocationForm.tsx` przy użyciu `@tanstack/react-form` i `@tanstack/zod-form-adapter`.
4. **Dialog:** Implementacja `CreateLocationDialog.tsx` z użyciem mutacji.
5. **Switcher:** Implementacja `LocationSwitcher.tsx` z użyciem `useQuery`.
6. **Ustawienia:** Implementacja `LocationSettings.tsx` (pobranie danych, formularz, mutacja).
7. **Integracja:** Dodanie komponentów do `Layout` i strony `/settings`.
