```markdown
<conversation_summary>

<decisions>
1. System będzie obsługiwać wiele lokalizacji — każda lokalizacja stanowi osobny byt z własnymi miejscami, rezerwacjami i klientami. Dodany zostanie filtr „lokalizacja” w każdej liście oraz przełącznik kontekstu lokalizacji w panelu głównym.  
2. Wprowadzony zostanie mechanizm CRON uruchamiany codziennie w celu automatycznej aktualizacji statusów płatności według miesięcznego cyklu rozliczeniowego.  
3. System e-mail będzie wyposażony w retry logic (3 próby co 1h) i rejestrowanie wyników w bazie z możliwością podglądu w panelu admina.  
4. Akcja „Zakończ/zwolnij miejsce” automatycznie zaktualizuje status rezerwacji i widok kalendarza w czasie rzeczywistym, z potwierdzeniem przed wykonaniem.  
5. Wyjątki cenowe będą przypisywane do konkretnych lokalizacji, z priorytetem ostatniego wpisu i obsługą procentowych zmian (+/−%).  
6. Każda lokalizacja może mieć własną cenę domyślną, konfigurowaną w panelu administratora.  
7. Widok kalendarza ograniczony do miesięcznego, pokazujący rezerwacje zakończone, trwające i przyszłe.  
8. Płatności oznaczane ręcznie przez właściciela; historia zmian statusu będzie zapisywana w bazie danych.  
9. Edycja rezerwacji dozwolona z ponowną walidacją dostępności; przy kolizji zapis blokowany z komunikatem.  
10. System kopii zapasowych (backupów) nie będzie realizowany w MVP.  
11. Rezerwacje dzienne (bez godzin), brak nakładania terminów między rezerwacjami.  
12. Brak funkcji importu danych z Excela.  
13. Brak panelu klienta — tylko właściciel posiada dostęp do systemu.  
14. Trzy typy automatycznych e-maili (przypomnienie −3 dni, zaległość, potwierdzenie rezerwacji), po dwa szablony na każdą akcję — osobno dla właściciela i klienta, treści zakodowane na sztywno.
15. Autoryzacja z użyciem JWT.
16. W MVP będzie tylko jeden użytkownik - właściciel. Brak możliwości dodawania współpracowników.
17. W MVP nie robimy raportowania
18. Logi powinny być przechowywane 30 dni. 
</decisions>

<matched_recommendations>
1. Dodanie filtra „lokalizacja” i przełącznika kontekstu w panelu głównym, aby wspierać zarządzanie wieloma parkingami.  
2. Wdrożenie codziennego mechanizmu CRON do aktualizacji statusów płatności.  
3. Zaimplementowanie systemu powiadomień e-mail z mechanizmem retry logic i logowaniem w bazie.  
4. Automatyczna aktualizacja statusu rezerwacji i widoku kalendarza po ręcznym zakończeniu miejsca.  
5. Wprowadzenie możliwości przypisywania wyjątków cenowych do lokalizacji oraz podglądu przeliczenia kosztu.  
6. Konfiguracja domyślnych cen na poziomie lokalizacji.  
7. Ograniczenie kalendarza do widoku miesięcznego w MVP.  
8. Ręczne oznaczanie płatności jako opłacone z historią zmian.  
9. Walidacja kolizji przy edycji rezerwacji, blokowanie zapisu w przypadku konfliktu.  
10. Świadoma rezygnacja z funkcji kopii zapasowych w MVP (do rozważenia w późniejszym etapie).  
</matched_recommendations>

<prd_planning_summary>
### a. Główne wymagania funkcjonalne
- **Moduł autoryzacji** — logowanie tylko dla właściciela.  
- **Moduł lokalizacji** — możliwość obsługi wielu lokalizacji, każda z własną listą miejsc i rezerwacji.  
- **Moduł miejsc parkingowych** — dodawanie, edycja, aktywacja/dezaktywacja, powiązanie z rezerwacjami.  
- **Moduł klientów** — zarządzanie danymi klientów (imię, nazwisko, e-mail, telefon, status).  
- **Moduł rezerwacji** — dodawanie, edycja, walidacja kolizji, oznaczenie płatności, statusy rezerwacji, ręczne zakończenie.  
- **Moduł kalendarza** — miesięczny widok pokazujący wszystkie rezerwacje, z możliwością otwarcia szczegółów.  
- **Dynamiczne cenniki** — możliwość definiowania wyjątków cenowych per lokalizacja z procentową zmianą ceny.  
- **System przypomnień e-mail** — wysyłka trzech typów e-maili z retry logic i logami wysyłek.  
- **Automatyzacja płatności** — CRON aktualizujący statusy płatności zgodnie z cyklem miesięcznym.  
- **Brak backupów, importu danych, panelu klienta i integracji płatności online w MVP.**

### b. Kluczowe historie użytkownika i ścieżki korzystania
1. **Właściciel loguje się** do panelu → wybiera lokalizację → widzi miesięczny kalendarz rezerwacji.  
2. **Dodaje nową rezerwację** → wybiera klienta lub tworzy nowego, wybiera miejsce, daty, typ rezerwacji → system sprawdza dostępność i oblicza cenę wg wyjątków.  
3. **Oznacza płatność** jako opłaconą / nieopłaconą → historia zmian zapisywana automatycznie.  
4. **Zakończenie rezerwacji** → kliknięcie przycisku „Zakończ/zwolnij miejsce” → aktualizacja kalendarza.  
5. **System automatycznie wysyła e-maile** przypominające o płatnościach, zaległościach i potwierdzenia rezerwacji.  
6. **Codzienny CRON** aktualizuje statusy płatności i generuje powiadomienia.

### c. Kryteria sukcesu i sposoby ich mierzenia
- Właściciel nie korzysta już z Excela do monitorowania rezerwacji.  
- Sprawdzanie dostępności i statusów płatności zajmuje maks. kilka minut dziennie.  
- System automatycznie generuje i wysyła wszystkie powiadomienia e-mail.  
- Rezerwacje są walidowane bez konfliktów (brak nakładających się terminów).  
- Ceny są poprawnie wyliczane na podstawie wyjątków cenowych per lokalizacja.

### d. Wymagania techniczne i ograniczenia
- MVP ograniczony do jednej roli użytkownika (właściciel).  
- Widok kalendarza miesięczny, bez edycji bezpośrednio z poziomu kalendarza.  
- Brak funkcji importu, backupu i zaawansowanych raportów.  
- System oparty o cykl rozliczeniowy miesięczny, z ręczną obsługą płatności.  
- Mechanizmy CRON i retry logic dla stabilności i automatyzacji procesów.

</prd_planning_summary>

</conversation_summary>
```
