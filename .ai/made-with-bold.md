## prompt:

### Prompt dla generatora PoC (Parking Manager) — tylko podgląd, dodawanie i edytowanie rezerwacji

```text
Zbuduj Proof of Concept (PoC) aplikacji "Parking Manager" w oparciu o poniższy, ściśle ograniczony zakres. Zanim rozpoczniesz implementację, przygotuj i przedstaw do akceptacji plan prac (etapy, architektura, pliki/komponenty, modele, migracje, endpointy, widoki UI, minimalne scenariusze testowe). Przejdź do kodowania dopiero po mojej akceptacji planu.

TECHNOLOGIE (twarde wymagania):
- Frontend: React 19 + Tailwind CSS 4 + shadcn/ui
- Backend: Laravel 12 (REST), MariaDB
- Brak autoryzacji/logowania w PoC

CEL PoC:
- Zweryfikować absolutnie podstawową funkcjonalność: podgląd (lista), dodawanie i edytowanie rezerwacji.
- Zapis do bazy i odczyt z bazy (persistencja).

ZAKRES FUNKCJONALNY (tylko to):
1) Rezerwacje dzienne (okresowe, bez godzin):
   - Pola: id, spotLabel (np. "P1"), customerName (tekst), dateFrom (YYYY-MM-DD), dateTo (YYYY-MM-DD).
   - Walidacja:
     - dateTo >= dateFrom
     - brak nakładania się zakresów dat dla tego samego spotLabel.
2) Widok listy rezerwacji:
   - Prosta tabela z kolumnami: spotLabel, customerName, dateFrom, dateTo.
   - Opcjonalny filtr po zakresie dat (from/to) — jeśli trywialny.
3) Formularz dodawania/edycji rezerwacji:
   - Pola: spotLabel (select lub tekst), customerName (tekst), dateFrom, dateTo.
   - Walidacje po stronie klienta i serwera.
   - Komunikat o kolizji przy zapisie.

API (minimalne):
- GET /api/reservations?from=&to= — lista (opcjonalne proste filtrowanie po dacie)
- POST /api/reservations — utworzenie
- PUT /api/reservations/{id} — edycja
- (Brak DELETE w PoC)

Baza danych:
- Jedna tabela: reservations
  - id (PK), spot_label (string), customer_name (string), date_from (date), date_to (date), created_at, updated_at
- Migracja i seeder z przykładowymi danymi (np. P1 i P2, kilka zakresów).

UI (minimalne komponenty):
- Strona listy: "ReservationsList" (tabela + przycisk "Add").
- Strona/formularz: "ReservationForm" (create/edit) z walidacjami i komunikatami błędów.
- Stylowanie Tailwind 4 + shadcn/ui, bez custom design systemów.

KRYTERIA AKCEPTACJI PoC:
- Mogę dodać rezerwację; widzę ją na liście po odświeżeniu.
- Mogę edytować istniejącą rezerwację; zmiany widać na liście.
- Próba dodania/edycji z dateTo < dateFrom jest zablokowana czytelnym błędem.
- Próba dodania/edycji nakładającej się rezerwacji dla tego samego spotLabel jest zablokowana czytelnym błędem.
- Dane są trwałe w MariaDB.

POZA ZAKRESEM (wykluczone, nie implementuj):
- Logowanie, sesje, JWT i jakiekolwiek role.
- Lokalizacje, przełącznik lokalizacji.
- Moduły Miejsc i Klientów jako osobne encje (w PoC użyj prostych pól tekstowych).
- Cenniki, wyjątki cenowe, kalkulacje kosztów, podglądy kalkulacji.
- Statusy rezerwacji/płatności, historia płatności.
- E-maile, CRON, retry logic, logi e-mail, retencja logów.
- Widok kalendarza (w PoC wystarczy lista).
- Usuwanie (DELETE).
- Jakiekolwiek integracje zewnętrzne, raporty, eksporty, PDF.

DOSTARCZ (po akceptacji planu):
- Plan prac z listą plików/komponentów (frontend/backend), strukturą folderów, migracją, seedem, endpointami oraz krótkimi scenariuszami testowymi.
- Po implementacji: instrukcja uruchomienia (komendy backend/frontend), krótki opis ograniczeń PoC.

Uwaga: rygorystycznie trzymaj się powyższego zakresu i technologii. Jeśli napotkasz niejasność — zaproponuj opcję A/B w planie i zaczekaj na moją decyzję przed implementacją.
```

- **Jak użyć**: wklej powyższy prompt do generatora PoC. Generator powinien najpierw przedstawić plan i uzyskać akceptację, a dopiero potem budować PoC.
- **Zakres celowo zredukowany**: tylko lista + formularz rezerwacji z walidacjami i persistencją; bez kalendarza, autoryzacji, cenników i automatyzacji.

- Przygotowałem kompletny prompt dla generatora PoC, zawężony do listy/dodawania/edycji rezerwacji i podstawowych walidacji, z wyraźnym zakazem funkcji nadmiarowych. Generator ma przedstawić plan do akceptacji przed implementacją.


## url: https://parking-manager-poc-peb6.bolt.host/