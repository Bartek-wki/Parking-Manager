# Status implementacji widoku Ustawień Lokalizacji

## Zrealizowane kroki

### 1. Warstwa API i Integracja
- Utworzono `src/lib/api/spots.ts` - obsługa CRUD dla miejsc parkingowych.
- Utworzono `src/lib/api/pricing.ts` - obsługa CRUD dla wyjątków cenowych.
- Utworzono `src/lib/api/client-utils.ts` - ustandaryzowana obsługa błędów (`ApiError`) i helper `handleResponse`.
- Zaimplementowano hooki TanStack Query w `src/lib/queries/spots.ts` oraz `src/lib/queries/pricing.ts` z inwalidacją cache.

### 2. Refaktoryzacja Głównego Widoku
- Przebudowano komponent `LocationSettings.tsx`.
- Wprowadzono podział na zakładki przy użyciu `shadcn/ui/tabs`:
  - **Ogólne**: Istniejący formularz edycji lokalizacji.
  - **Miejsca**: Nowy menedżer miejsc.
  - **Cennik**: Nowy menedżer wyjątków cenowych.

### 3. Zarządzanie Miejscami (Spots UI)
- Zaimplementowano `SpotsManager.tsx` - główny kontener z logiką filtrowania i obsługi modali.
- Stworzono `SpotsTable.tsx`:
  - Naturalne sortowanie numerów miejsc.
  - Przełącznik statusu (aktywne/nieaktywne) z optymistyczną aktualizacją UI.
- Stworzono `SpotDialog.tsx`:
  - Formularz oparty na `TanStack Form` i `Zod`.
  - Obsługa błędu 422 (duplikat numeru miejsca) z mapowaniem na pole formularza.

### 4. Zarządzanie Cennikiem (Pricing UI)
- Zaimplementowano `PricingExceptionsManager.tsx` - kontener logiki biznesowej.
- Stworzono `PricingExceptionsTable.tsx`:
  - Wyświetlanie zakresów dat.
  - Badge wizualizujące zmianę ceny (kolor zależny od wzrostu/spadku).
  - Badge statusu (Aktywny/Przyszły/Zakończony).
- Stworzono `PricingExceptionDialog.tsx`:
  - Walidacja zakresu dat (`start_date <= end_date`).
  - Obsługa błędu 409 (konflikt dat) z API.
- Dodano `AlertDialog` do potwierdzania usuwania wyjątków.

### 5. Stylowanie i UX
- Wykorzystano komponenty `shadcn/ui` (Card, Button, Input, Table, Badge, Switch, Dialog, Alert).
- Dodano powiadomienia `sonner` (Toast) dla operacji sukcesu i błędów.
- Zadbano o obsługę stanów ładowania (Skeletony) i pustych list.

