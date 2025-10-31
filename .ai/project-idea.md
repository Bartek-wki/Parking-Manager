### Główny problem
Właściciej parkingów udostępnia miejsca parkingowe w dwóch scenariuszach: stały wynajem lub wynajem w określonym terminie. Prowadzi uproszczony dziennik w narzędziu excel gdzie notuje rezerwacje. W przypadku wynajmu stałego sprawdzenie czy użytkownik parkingu opłacił swoje miejsce jest czasochłonne, ponadto brakuje mu systemu do przypominania o opłatach dla klientów oraz powiadomień na adres e-mail gdy dla danego klienta minął termin opłaty.
W przypadku wynajmu okresowego bardzo czasochłonnne jest sprawdzanie czy w danym terminie jest wolne miejsce. Dodatkowo czasochłonne jest sprawdzanie czy dany klient opuścił swoje miejsce parkingowe w uzgodnionym terminie. Ponadto właściciel chciałby wprowadzić niestandardowe cenniki na różne okoliczności. Np. podwyższyć ceny w danym okresie, lub zrobić promocje na wybrany okres.

### Najmniejszy zestaw funkcjonalności
## Moduł autoryzacji
Cel: dostęp tylko dla właściciela parkingu.
* Logowanie
* Panel administracyjny dostępny tylko po zalogowaniu

## Moduł miejsc parkingowych
Cel: rejestracja wszystkich miejsc dostępnych na parkingu.
* Lista miejsc (np. P1, P2, P3...).
* Możliwość dodania, edycji i oznaczenia miejsca jako aktywne/nieaktywne.
* Powiązanie miejsca z rezerwacjami.

## Moduł klientów
Cel: przechowywanie informacji o osobach wynajmujących.
* Dodanie / edycja klienta (imię, nazwisko, e-mail, telefon).
* Status: aktywny / nieaktywny.
* Powiązanie z rezerwacjami i historią płatności.

## Moduł rezerwacji (stałe i okresowe)
Cel: rejestrowanie i zarządzanie rezerwacjami miejsc parkingowych.
* Dodanie rezerwacji:
    - wybór klienta, miejsca, daty początkowej i końcowej,
    - oznaczenie rodzaju rezerwacji (stała / okresowa).
* Walidacja: brak nakładania się terminów na to samo miejsce.
* Status: aktywny / zakończony / zaległy.
* Oznaczenie płatności: opłacone / nieopłacone.

## Wizualizacja w kalendarzu
Cel: szybki podgląd zajętych miejsc i terminów.
* Widok kalendarza z użyciem gotowej biblioteki
* kolorowe oznaczenia (wolne miejsce, zarezerwowane, kończące się w najbliższym tygodniu)
* Kliknięcie w rezerwację → otwarcie szczegółów (klient, termin, status płatności).

## Dynamiczne cenniki
Cel: właściciel może ustawić inne ceny w wybranym okresie.
* Domyślna cena za dzień / miesiąc (w ustawieniach ogólnych).
* Możliwość dodania wyjątku cenowego:
    - zakres dat od - do,
    - wartość procentowa zmiany ceny (+/- %),
    - opcjonalny opis np. „promocja wakacyjna”.
* Podczas dodawania rezerwacji system automatycznie przelicza koszt według reguły.

## Przypomnienia o płatnościach
Cel: automatyczne powiadomienia o zbliżającym się lub przekroczonym terminie płatności.
* Sprawdza rezerwacje z datą płatności w przeszłości lub nadchodzącą (np. +3 dni).
* Wysyła e-mail do właściciela oraz klienta jeśli klient:
    - nie opłacił w terminie,
    - ma płatność za 3 dni.

### Co NIE wchodzi w zakres MVP
* Brak rejestracji — tylko właściciel ma konto
* Reset hasła przez e-mail
* Panel klienta (logowanie, wgląd w swoje rezerwacje).
* Historia płatności klienta w podziale na miesiące / raporty.
* Automatyczne rozliczenia miesięczne i integracja z płatnościami online.
* Faktury lub generowanie PDF.
* Powiadomienia SMS.
* Tylko miesięczny widok kalendarza
* Brak możliwości dodania rezerwacji bezpośrednio klikajac w kalendarz
* Złożone reguły cenowe (np. różne ceny dla dni tygodnia).
* Wielowarstwowe promocje / rabaty dla konkretnych klientów.

### Kryteria sukcesu
* Właściciel nie musi już sprawdzać terminów w Excelu — może jednym kliknięciem zobaczyć dostępność w kalendarzu.
* Właściciel otrzymuje powiadomienia o zaległościach bez konieczności ręcznego sprawdzania.
* Właściciel może sam ustawić wyjątek cenowy dla dowolnego okresu.