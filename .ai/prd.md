# Dokument wymagań produktu (PRD) - Parking Manager

## 1. Przegląd produktu
Parking Manager to webowa aplikacja administracyjna dla właściciela parkingów, umożliwiająca zarządzanie wieloma lokalizacjami (parkingami), miejscami parkingowymi, klientami oraz rezerwacjami w dwóch trybach: stałym i okresowym (dziennym). System zapewnia walidację dostępności miejsc, miesięczny widok kalendarza rezerwacji, dynamiczne cenniki (wyjątki cenowe per lokalizacja), ręczne oznaczanie płatności, historię zmian statusów płatności oraz automatyczne powiadomienia e-mail.

Zakres MVP obejmuje jeden typ roli (właściciel), rezerwacje dzienne (bez godzin), brak panelu klienta i brak integracji z płatnościami online. System loguje nieudane próby wysyłek e-mail. Kalendarz ograniczony jest do widoku miesięcznego.

## 2. Problem użytkownika
Właściciel parkingów dotychczas prowadzi ręczne zapisy w arkuszu, co powoduje:
- Czasochłonne sprawdzanie płatności przy wynajmie stałym i brak automatycznych przypomnień dla klientów oraz powiadomień e-mail dla właściciela po upływie terminów.
- Trudne i wolne sprawdzanie dostępności miejsc dla wynajmów okresowych w wybranych terminach.
- Brak prostego mechanizmu potwierdzania, że klient opuścił miejsce w uzgodnionym terminie.
- Brak elastycznego cennika na promocje/podwyżki w określonych okresach.

Celem jest redukcja pracy ręcznej, minimalizacja błędów w dostępności, przyspieszenie obsługi i zapewnienie pełnej widoczności rezerwacji oraz płatności w jednym narzędziu.

## 3. Wymagania funkcjonalne
3.1 Podstawowy system uwierzytelniania i kont użytkowników:
- Rejestracja i logowanie.
- Możliwość usunięcia konta i powiązanych danych na życzenie.

3.2 Lokalizacje
- Obsługa wielu lokalizacji: każda lokalizacja posiada własne miejsca, klientów przypisanych przez rezerwacje, rezerwacje i konfiguracje cen.
- Przełącznik kontekstu lokalizacji w panelu głównym oraz filtr „lokalizacja” we wszystkich listach.
- Konfiguracja domyślnej ceny per lokalizacja: cena dzienna i miesięczna.

3.3 Miejsca parkingowe
- Lista miejsc (np. P1, P2, P3) w danej lokalizacji.
- Dodawanie, edycja, dezaktywacja/aktywacja miejsc.
- Powiązanie miejsca z rezerwacjami; zablokowanie rezerwacji na miejsca nieaktywne.

3.4 Klienci
- Dodawanie i edycja klienta: imię, nazwisko, e-mail, telefon
- Powiązanie klientów z rezerwacjami i historią płatności rezerwacji.

3.5 Rezerwacje (stałe i okresowe)
- Tworzenie rezerwacji: wybór lokalizacji (kontekst), klienta (lub szybkie dodanie), miejsca, daty początkowej i końcowej (dla stałych koniec opcjonalny), typ rezerwacji (stała/okresowa).
- Walidacja braku nakładania się terminów na to samo miejsce w lokalizacji.
- Statusy rezerwacji: aktywna, zakończona, zaległa.
- Oznaczanie płatności: opłacone/nieopłacone; historia zmian statusu płatności w bazie.
- Edycja rezerwacji z ponowną walidacją; zapisy blokowane przy kolizjach.
- Akcja „Zakończ/zwolnij miejsce” z potwierdzeniem; natychmiastowa aktualizacja kalendarza.

3.6 Kalendarz (widok miesięczny)
- Miesięczny widok rezerwacji w kontekście wybranej lokalizacji.
- Kolory: wolne, zarezerwowane, rezerwacje kończące się w najbliższym tygodniu.
- Kliknięcie w rezerwację otwiera szczegóły: klient, miejsce, zakres dat, statusy płatności i rezerwacji.
- Nawigacja pomiędzy miesiącami.

3.7 Dynamiczne cenniki
- Domyślna cena dzienna dla rezerwacji okresowych konfigurowana per lokalizacja.
- Wyjątki cenowe: zakres dat od–do, procentowa zmiana ceny (+/−%), opcjonalny opis.
- Priorytet ostatniego wpisu w przypadku nakładających się wyjątków w danej lokalizacji.
- Automatyczne wyliczanie kosztu w formularzu rezerwacji zgodnie z regułami cenowymi i wyjątkami; podgląd sposobu wyliczenia.
- Wyjątki cenowe tylko dla rezerwacji okresowych. Dla rezerwacji stałych obowiązuje stała, miesięczna stawka zdefiniowana w panelu administratora dla wybranej lokalizacji.

3.8 Przypomnienia i automatyzacja płatności
- codzienne aktualizacje statusów płatności zgodnie z miesięcznym cyklem rozliczeniowym.
- Automatyczne e-maile: przypomnienie (−3 dni), zaległość (po terminie), potwierdzenie rezerwacji — oddzielne szablony dla właściciela i klienta, treści stałe w MVP.
- Wysyłka do właściciela zawsze; do klienta, jeśli posiada e-mail.

3.9 Logi i retencja
- Rejestrowanie wysyłek e-mail: status, czas, typ powiadomienia, odbiorcy, komunikat błędu (jeśli wystąpił).

3.10 Ograniczenia i założenia danych
- Rezerwacje dzienne (bez godzin); daty traktowane jako całe dni w strefie czasowej systemu.
- Brak importu danych z Excela.
- Brak faktur/PDF i integracji płatności online w MVP.

## 4. Granice produktu
- Brak ról i współdzielenia danych między użytkownikami. Każdy uzytkownik jest jedynym właścicielem swoich parkingów, rezerwacji itp.
- Brak panelu klienta (logowanie, wgląd w swoje rezerwacje).
- Brak raportowania i zaawansowanych raportów finansowych.
- Brak kopii zapasowych (backupów) w MVP.
- Brak integracji płatności online i automatycznych rozliczeń miesięcznych.
- Brak powiadomień SMS.
- Kalendarz ograniczony do widoku miesięcznego; brak dodawania rezerwacji z kalendarza.
- Rezerwacje tylko dzienne; brak godzin i złożonych reguł cenowych (np. inne ceny w dni tygodnia, rabaty per klient).

## 5. Historyjki użytkowników
ID: US-001
Tytuł: Rejestracja konta
Opis: Jako nowy użytkownik chcę się zarejestrować, aby mieć dostęp do włanych lokalizacji (parkingów) i móc korzystać z dodawania rezerwacji.
Kryteria akceptacji:
- Formularz rejestracyjny zawiera pola na adres e-mail i hasło.
- Po poprawnym wypełnieniu formularza i weryfikacji danych konto jest aktywowane.
- Użytkownik otrzymuje potwierdzenie pomyślnej rejestracji i zostaje zalogowany.

ID: US-002
Tytuł: Logowanie do aplikacji
Opis: Jako zarejestrowany użytkownik chcę móc się zalogować, aby mieć dostęp do moich rezerwacji.
Kryteria akceptacji:
- Po podaniu prawidłowych danych logowania użytkownik zostaje przekierowany do kalendarza.
- Błędne dane logowania wyświetlają komunikat o nieprawidłowych danych.
- Dane dotyczące logowania przechowywane są w bezpieczny sposób.

US-003
Tytuł: Przełączanie kontekstu lokalizacji
Opis: Jako właściciel chcę przełączać aktywną lokalizację, aby zarządzać jej danymi.
Kryteria akceptacji:
- Przełącznik lokalizacji dostępny w nagłówku panelu.
- Listy miejsc, klientów, rezerwacji i kalendarz filtrują dane wg wybranej lokalizacji.
- Zmiana lokalizacji odświeża widok kalendarza i listy.

US-004
Tytuł: Konfiguracja domyślnych cen lokalizacji
Opis: Jako właściciel chcę ustawić domyślną cenę dzienną i miesięczną dla lokalizacji.
Kryteria akceptacji:
- Formularz zapisuje cenę dzienną i miesięczną.
- Rezerwacje domyślnie używają ceny lokalizacji, jeśli brak wyjątków cenowych.
- Próba utworzenia rezerwacji bez zdefiniowanych cen zwraca czytelny komunikat i blokuje zapis.

US-010
Tytuł: Lista i zarządzanie miejscami
Opis: Jako właściciel chcę dodawać, edytować i (de)aktywować miejsca w lokalizacji.
Kryteria akceptacji:
- Widok listy miejsc z filtrami i statusem aktywne/nieaktywne.
- Dodanie/edycja zapisuje numer/etykietę miejsca.
- Miejsca nieaktywne nie są dostępne do nowych rezerwacji.

US-011
Tytuł: Blokada rezerwacji na nieaktywne miejsce
Opis: Jako właściciel nie chcę, aby można było rezerwować nieaktywne miejsce.
Kryteria akceptacji:
- Nieaktywne miejsca są ukryte lub oznaczone jako niedostępne w formularzu rezerwacji.
- Próba zapisu na nieaktywne miejsce jest zablokowana z komunikatem.

US-020
Tytuł: Zarządzanie klientami
Opis: Jako właściciel chcę dodawać/edytować klientów z danymi kontaktowymi i statusem.
Kryteria akceptacji:
- Pola: imię, nazwisko, e-mail (opcjonalnie), telefon (opcjonalnie), status.
- Brak duplikacji e-maili w obrębie lokalizacji nie jest wymagany w MVP.

US-021
Tytuł: Wysyłka e-mail przy braku e-maila klienta
Opis: Jako właściciel chcę otrzymać powiadomienia nawet gdy klient nie ma e-maila.
Kryteria akceptacji:
- Jeśli klient nie ma e-maila, wiadomości trafiają tylko do właściciela.
- Brak błędu przy generowaniu powiadomienia.

US-030
Tytuł: Utworzenie rezerwacji okresowej
Opis: Jako właściciel chcę utworzyć rezerwację okresową z zakresem dat.
Kryteria akceptacji:
- Formularz wymaga: klient, miejsce, data od, data do, typ okresowa.
- Walidacja: data do nie może być wcześniejsza niż data od.
- Walidacja braku konfliktów na miejsce w zakresie dat.
- System wylicza i wyświetla koszt według cen i wyjątków.

US-031
Tytuł: Utworzenie rezerwacji stałej
Opis: Jako właściciel chcę utworzyć rezerwację stałą od określonej daty, bez wymagania daty końca.
Kryteria akceptacji:
- Formularz wymaga: klient, miejsce, data od, typ stała; data do opcjonalna.
- Walidacja konfliktów z innymi rezerwacjami na to samo miejsce.
- System prezentuje stały koszt miesięczny. Wyjątki nie są uwzględniane w przypadku rezerwacji stałych.

US-032
Tytuł: Brak nakładania się rezerwacji na to samo miejsce
Opis: Jako właściciel nie chcę kolizji terminów w obrębie jednego miejsca.
Kryteria akceptacji:
- Próba utworzenia lub edycji kolidującej rezerwacji jest blokowana z jasnym komunikatem.
- Kolizje dotyczą zarówno rezerwacji stałych, jak i okresowych.

US-033
Tytuł: Edycja rezerwacji z ponowną walidacją
Opis: Jako właściciel chcę edytować rezerwacje i zachować spójność dostępności.
Kryteria akceptacji:
- Zmiana dat/klienta/miejsca wymusza ponowną walidację.
- Konflikty blokują zapis; brak konfliktu zapisuje zmiany.
- Historia rezerwacji zachowuje aktualne statusy i płatności.

US-034
Tytuł: Zakończenie rezerwacji i zwolnienie miejsca
Opis: Jako właściciel chcę zakończyć rezerwację i natychmiast zwolnić miejsce.
Kryteria akceptacji:
- Akcja wymaga potwierdzenia.
- Status rezerwacji zmienia się na zakończona; kalendarz aktualizuje się w czasie rzeczywistym.

US-035
Tytuł: Szczegóły rezerwacji z kalendarza
Opis: Jako właściciel chcę kliknąć rezerwację w kalendarzu i zobaczyć szczegóły.
Kryteria akceptacji:
- Szczegóły zawierają: klienta, miejsce, daty, status rezerwacji i płatności, koszt.
- Dostępne akcje: edycja, zakończ.

US-040
Tytuł: Widok kalendarza miesięcznego
Opis: Jako właściciel chcę miesięczny podgląd obłożenia w wybranej lokalizacji.
Kryteria akceptacji:
- Kolorystyka: wolne, zarezerwowane, kończące się w 3 dni.
- Nawigacja miesiąc wstecz/przód.
- Kliknięcie w rezerwację otwiera szczegóły.

US-050
Tytuł: Dodanie wyjątku cenowego per lokalizacja
Opis: Jako właściciel chcę dodać okresowy wyjątek cenowy z procentową zmianą.
Kryteria akceptacji:
- Wymagane: zakres dat, procent zmiany (+/−), opcjonalny opis.
- Nałożone wyjątki rozstrzygane priorytetem ostatniego wpisu.
- Wyjątek wpływa na wyliczanie kosztu nowych rezerwacji w podglądzie. Dla rezerwacji trwajacych nie przeliczamy nowych kosztów.

US-051
Tytuł: Podgląd wyliczenia kosztu w formularzu rezerwacji
Opis: Jako właściciel chcę zobaczyć jak został policzony koszt.
Kryteria akceptacji:
- Widoczna jest cena bazowa i zastosowane wyjątki (z opisem i procentem).
- Zmiana dat lub typu rezerwacji odświeża wyliczenie.

US-060
Tytuł: Ręczne oznaczenie płatności
Opis: Jako właściciel chcę oznaczać rezerwację jako opłaconą/nieopłaconą.
Kryteria akceptacji:
- Zmiana statusu płatności zapisuje się z timestampem i autorem.
- Historia zmian płatności dostępna w szczegółach rezerwacji.

US-061
Tytuł: Historia zmian statusu płatności
Opis: Jako właściciel chcę widzieć pełną historię zmian płatności.
Kryteria akceptacji:
- Lista zdarzeń: poprzedni/nowy status, czas, użytkownik.
- Dane tylko dla 1 użytkownika w MVP; nadal rejestrowane technicznie.

US-070
Tytuł: Automatyczne e-maile przypominające
Opis: Jako właściciel chcę, aby system wysyłał e-maile: −3 dni, zaległość i potwierdzenie rezerwacji.
Kryteria akceptacji:
- Generowane są 3 typy e-maili, po dwa szablony (właściciel, klient).
- Szablony są stałe w MVP.
- Przy braku e-maila klienta wysyłka tylko do właściciela.

US-071
Tytuł: logowanie wysyłek e-mail
Opis: Jako właściciel chcę mieć wgląd w logi.
Kryteria akceptacji:
- Log zawiera status, czas, typ, odbiorców, błąd.

US-072
Tytuł: Podgląd logów e-mail w panelu
Opis: Jako właściciel chcę przeglądać logi wysyłek e-mail.
Kryteria akceptacji:
- Widok listy z filtrem po typie, odbiorcy i statusie.
- Dostępny tylko po zalogowaniu.

US-080
Tytuł: Codzienna aktualizacja statusó płatności
Opis: Jako właściciel chcę, aby statusy płatności aktualizowały się automatycznie zgodnie z miesięcznym cyklem.
Kryteria akceptacji:
- Harmonogram uruchamia się raz dziennie.
- Rezerwacje z przekroczonym terminem zmieniają status na zaległe.
- Wyzwalane są odpowiednie e-maile.

US-090
Tytuł: Walidacja dat rezerwacji
Opis: Jako właściciel nie chcę tworzyć rezerwacji z błędnymi zakresami dat.
Kryteria akceptacji:
- Data do nie może być wcześniejsza niż data od.
- Daty są dzienne; brak godzin minimalizuje problemy stref czasowych.

US-091
Tytuł: Blokada usuwania klienta z aktywnymi rezerwacjami
Opis: Jako właściciel nie chcę utraty spójności rezerwacji.
Kryteria akceptacji:
- Próba usunięcia klienta z aktywnymi rezerwacjami jest blokowana.
- Komunikat wskazuje, które rezerwacje blokują usunięcie.

US-092
Tytuł: Blokada usuwania miejsca z aktywnymi rezerwacjami
Opis: Jako właściciel chcę chronić integralność danych.
Kryteria akceptacji:
- Próba usunięcia lub dezaktywacji miejsca, jeśli powoduje konflikt z aktywnymi rezerwacjami, jest blokowana lub wymaga zakończenia rezerwacji.

US-093
Tytuł: Kolizje wyjątków cenowych
Opis: Jako właściciel chcę przewidywalnych zasad, gdy wyjątki się nakładają.
Kryteria akceptacji:
- W przypadku nakładania się wyjątków stosowany jest wyjątek dodany jako ostatni.
- Podgląd kalkulacji wskazuje, który wyjątek zadziałał.

US-094
Tytuł: Nawigacja i filtracja list po lokalizacji
Opis: Jako właściciel chcę filtrować listy według lokalizacji.
Kryteria akceptacji:
- Wszystkie listy (miejsca, klienci, rezerwacje, logi e-mail) respektują filtr lokalizacji.

US-095
Tytuł: Potwierdzenie rezerwacji e-mailem
Opis: Jako właściciel chcę otrzymać potwierdzenie po utworzeniu rezerwacji.
Kryteria akceptacji:
- Po zapisie rezerwacji wysyłane są dwa e-maile (właściciel, klient jeśli ma e-mail).
- Log wysyłki rejestruje wynik i ewentualne próby ponowienia.

US-096
Tytuł: Widok dostępności w formularzu rezerwacji
Opis: Jako właściciel chcę szybko sprawdzić dostępność miejsca dla wybranych dat.
Kryteria akceptacji:
- Wybór miejsca i zakresu dat natychmiast pokazuje ostrzeżenie o potencjalnej kolizji (przed zapisem).

US-097
Tytuł: Wymuszenie wyboru lokalizacji
Opis: Jako właściciel chcę uniknąć tworzenia danych bez kontekstu lokalizacji.
Kryteria akceptacji:
- Tworzenie miejsc, klientów i rezerwacji wymaga aktywnej lokalizacji.

US-099
Tytuł: Kolorystyka rezerwacji kończących się w 3 dni
Opis: Jako właściciel chcę wyróżnienia zbliżających się końców rezerwacji.
Kryteria akceptacji:
- Kalendarz oznacza rezerwacje kończące się w ciągu 3 dni od bieżącej daty.

## 6. Metryki sukcesu
- Dostępność i przejrzystość: właściciel w kilka minut dziennie może ocenić obłożenie i dostępność miejsc w widoku miesięcznym.
- Automatyzacja: wszystkie automatyczne e-maile (−3 dni, zaległość, potwierdzenie) są generowane i wysyłane, z widocznymi logami i retry logic.
- Spójność danych: brak nakładania się rezerwacji na te same miejsca; edycje blokowane przy kolizjach.
- Elastyczność cen: poprawne wyliczanie kosztów z uwzględnieniem domyślnych cen i wyjątków per lokalizacja; podgląd kalkulacji.
- Redukcja pracy ręcznej: właściciel nie korzysta z Excela do monitorowania terminów i płatności.
