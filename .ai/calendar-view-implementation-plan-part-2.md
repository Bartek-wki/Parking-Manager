# Plan implementacji widoku Kalendarza Rezerwacji (Część 2: Interakcje i Edycja)

## 1. Przegląd
Druga faza wdrożenia widoku Kalendarza (`Calendar View`) koncentruje się na interakcji użytkownika z systemem. Obejmuje ona tworzenie nowych rezerwacji (modal), edycję istniejących (zmiana dat, miejsca), zarządzanie statusem płatności oraz walidację biznesową.

Opieramy się na już istniejącej strukturze (zrealizowanej w Części 1), rozszerzając ją o mechanizmy "Write".

## 2. Routing widoku
Bez zmian: `/locations/[locationId]/calendar`

## 3. Struktura komponentów

Modyfikacja istniejącej struktury o komponenty formularzy i interakcji.

```text
src/components/locations/calendar/
├── CalendarView.tsx (Main Container - Aktualizacja: obsługa nowych handlerów)
├── CalendarHeader.tsx (Istniejący)
├── FullCalendarWrapper.tsx (Istniejący - Aktualizacja: eventClick, dateClick, eventDrop)
├── BookingModal.tsx (Istniejący - Refaktoryzacja: obsługa trybów View/Create/Edit)
│   ├── BookingSummary.tsx (Istniejący - dla trybu View)
│   └── BookingForm.tsx (Nowy - dla trybów Create/Edit)
│       ├── ClientSelect.tsx (Wybór klienta + Trigger "Dodaj nowego")
│       │   └── CreateClientDialog.tsx (Zagnieżdżony modal)
│       ├── SpotSelect.tsx (Wybór miejsca - filtrowanie aktywnych)
│       ├── DateRangePicker.tsx (Wybór dat start/end)
│       ├── BookingTypeToggle.tsx (Stała vs Okresowa)
│       ├── CostPreviewCard.tsx (Wyświetlanie kalkulacji i błędów dostępności)
│       └── PaymentStatusSelect.tsx (Zmiana statusu płatności)
└── CalendarSkeleton.tsx (Istniejący)
└── StatusBadge.tsx (Współdzielony komponent dla statusów płatności i rezerwacji)
```

## 4. Szczegóły komponentów

### 1. `BookingModal` (Refaktoryzacja)
- **Zmiana:** Przekształcenie z prostego dialogu wyświetlającego `BookingSummary` w "Smart Component" zarządzający stanem trybu.
- **Propsy:** Rozszerzenie o `initialDate` (dla tworzenia) i callbacki odświeżania.
- **Logika:**
  - `mode`: 'Create' | 'Edit' | 'View' (ujędnolicone nazewnictwo zgodnie z architekturą UI).
  - Jeśli `mode === 'View'`: renderuje `<BookingSummary />` z przyciskiem "Edytuj".
  - Jeśli `mode === 'Create' | 'Edit'`: renderuje `<BookingForm />`.
  - **PaymentHistoryList:** Komponent zostanie dodany w kolejnej części implementacji (część 3).

### 2. `BookingForm` (Nowy)
- **Opis:** Formularz oparty na `TanStack Form` i `Zod` zgodnie z wytycznymi TanStack Form Guidelines.
- **Funkcjonalność:**
  - Obsługuje logikę tworzenia i edycji.
  - **Live Preview:** Przy zmianie dat/miejsca wywołuje `previewBooking` w celu pobrania ceny i dostępności z debouncing (300-500ms) i cache per kombinacji parametrów.
  - Blokuje submit, jeśli preview zwraca błąd (konflikt).
  - **Obsługa błędów API:** Implementuje mapowanie błędów 422 na pola formularza zgodnie z kontraktem API i wytycznymi TanStack Form (użycie `form.setFieldMeta`).
  - **StatusBadge:** Wykorzystuje współdzielony komponent `StatusBadge` dla wyświetlania statusów płatności i rezerwacji.
- **Kluczowe pola:** Klient (Combobox), Miejsce (Select), Typ (Radio/Tabs), Daty (DatePicker), Status Płatności (Select z StatusBadge - tylko edit).

### 3. `FullCalendarWrapper` (Aktualizacja)
- **Nowe interakcje:**
  - `dateClick`: Przekazuje klikniętą datę do rodzica -> Otwiera Modal (Create).
  - `eventClick`: Przekazuje ID rezerwacji -> Otwiera Modal (View).
  - `eventDrop` / `eventResize`: (Opcjonalnie w tej fazie) Aktualizacja dat metodą Drag&Drop.
    - *Strategia:* Upuszczenie rezerwacji otwiera Modal (Edit) z nowymi datami w celu potwierdzenia kosztów (bezpieczniejsze dla US-051) LUB wywołuje optymistyczną aktualizację z walidacją toast.
    - *Rekomendacja:* Na start: Drop otwiera Modal w trybie Edit z zaktualizowanymi datami.

### 4. `CostPreviewCard` (Nowy)
- **Opis:** Wizualizacja odpowiedzi z endpointu `/preview`.
- **Stany:**
  - Loading: Skeleton.
  - Error (Konflikt): Czerwony alert, blokada akcji.
  - Success: Wyświetla `total_cost` i `calculation_details` (lista wyjątków cenowych).

### 5. `StatusBadge` (Współdzielony komponent)
- **Opis:** Komponent do spójnego wyświetlania statusów płatności i rezerwacji w całej aplikacji.
- **Propsy:** `status` (PaymentStatus | ReservationStatus), `variant` (opcjonalny dla różnych stylów).
- **Implementacja:** Wykorzystuje Tailwind CSS do kolorowania (zielony/czerwony/żółty/niebieski) zgodnie z wytycznymi z architektury UI.

## 5. Typy (Rozszerzenie src/types.ts)

- `CreateBookingCmd`, `UpdateBookingCmd`, `PreviewBookingCmd` (już zdefiniowane w PRD/API plan, upewnić się że są w `types.ts`).
- Zaktualizować `CalendarEventVM` o `extendedProps` potrzebne do logiki UI (jeśli brakuje).

## 6. Zarządzanie stanem i Serwisy

Wykorzystujemy istniejące pliki, rozszerzając je.

### `src/lib/services/bookings.ts` (Aktualizacja)
Dodać funkcje realizujące zapytania do API (fetch wrappers):
- `createBooking(data: CreateBookingCmd): Promise<{id: string}>`
- `updateBooking(id: string, data: UpdateBookingCmd): Promise<void>`
- `previewBooking(data: PreviewBookingCmd): Promise<PreviewBookingResponse>`

### `src/lib/queries/bookings.ts` (Aktualizacja)
Dodać hooki mutacji i zapytań:
- `useCreateBookingMutation()`: Invalidate `BOOKING_KEYS.list`.
- `useUpdateBookingMutation()`: Invalidate `BOOKING_KEYS.list` i `BOOKING_KEYS.detail(id)`.
- `useBookingPreview(cmd: PreviewBookingCmd)`: Query z `enabled: false`, zoptymalizowany cache per `(locationId, spotId, startDate, endDate, type, excludeBookingId)` oraz debouncing (300-500ms) przy zmianach w formularzu.

## 7. Integracja API

Szczegóły endpointów zgodne z PRD.
- **POST /bookings/preview**: Kluczowy dla UX. Musi być wywoływany przy każdej zmianie parametrów wpływających na cenę/dostępność z debouncing i cache.
- **Obsługa błędów:**
  - **409 Conflict**: Specjalna obsługa w `BookingForm` - mapowanie błędu API na błąd pola formularza (np. "Miejsce zajęte").
  - **422 Unprocessable Entity**: Mapowanie błędów walidacji na pola formularza zgodnie z kontraktem API i wytycznymi TanStack Form (użycie `form.setFieldMeta`).

## 8. Scenariusze Interakcji

1. **Dodawanie rezerwacji:**
   - Klik w dzień -> Modal (Create) -> Wybór parametrów -> Podgląd Ceny (Auto) -> Zapis -> Zamknięcie Modala -> Odświeżenie Kalendarza.

2. **Edycja (Zmiana terminu):**
   - Klik w rezerwację -> Modal (View) -> Klik "Edytuj" -> Modal (Edit) -> Zmiana daty -> Podgląd nowej ceny -> Zapis -> Toast Success.

3. **Inline Creation Klienta:**
   - W `ClientSelect` brak klienta -> Wybór "Stwórz nowego" -> Dialog `CreateClient` na wierzchu -> Zapis -> Powrót do `BookingForm` z wybranym nowym klientem.

## 9. Warunki i Walidacja

- **End Date >= Start Date**: Walidacja Zod w formularzu.
- **Konflikty**: Weryfikowane przez API (`/preview`).
- **Wymagalność pól**: Klient, Miejsce, Data Start.
- **Blokada edycji**: Nie można zmienić lokalizacji istniejącej rezerwacji (idempotentność w kontekście lokalizacji).

## 10. Kroki Implementacji

1. **Serwisy i Query (Data Layer):**
   - Rozszerz `src/lib/services/bookings.ts` o metody `create`, `update`, `preview`.
   - Rozszerz `src/lib/queries/bookings.ts` o mutacje i hook preview z optymalizacją cache i debouncing.
   - Rozszerz `src/lib/queries/clients.ts` o mutację tworzenia klienta.

2. **Komponenty Pomocnicze UI:**
   - Stwórz `CostPreviewCard.tsx`.
   - Stwórz `ClientSelect.tsx` z integracją `CreateClientDialog`.
   - Stwórz współdzielony komponent `StatusBadge.tsx` dla statusów płatności i rezerwacji.

3. **Logika Formularza:**
   - Zaimplementuj `BookingForm.tsx` (Zod schema + TanStack Form zgodnie z wytycznymi TanStack Form Guidelines + integracja z `useBookingPreview` + obsługa błędów 422 poprzez `form.setFieldMeta`).

4. **Integracja z Modalem:**
   - Zrefaktoryzuj `BookingModal.tsx` dodając obsługę trybów i renderowanie formularza.

5. **Integracja z Kalendarzem:**
   - Zaktualizuj `CalendarView.tsx` i `FullCalendarWrapper.tsx` o obsługę `dateClick` i przekazywanie propsów do modala.

6. **Weryfikacja:**
   - Sprawdź poprawność przeliczania cen przy zmianie dat.
   - Sprawdź blokadę zapisu przy konflikcie (409).
   - Sprawdź mapowanie błędów 422 na pola formularza.
   - Sprawdź optymalizację preview (debouncing, cache).
   - Sprawdź wyświetlanie statusów za pomocą StatusBadge.
