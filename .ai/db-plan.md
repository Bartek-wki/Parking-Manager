# Database Schema for Parking Manager

## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### Custom ENUM types
- `reservation_type`: ENUM ('permanent', 'periodic')
- `reservation_status`: ENUM ('aktywna', 'zakonczona', 'zalegla')
- `payment_status`: ENUM ('oplacone', 'nieoplacone')

### Tabele (Supabase `auth.users` przechowuje konta właścicieli)

#### `locations`
- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `user_id` UUID NOT NULL REFERENCES `auth`.`users` (`id`)
- `name` VARCHAR(255) NOT NULL
- `daily_rate` DECIMAL(10,2) NOT NULL CHECK (`daily_rate` >= 0)
- `monthly_rate` DECIMAL(10,2) NOT NULL CHECK (`monthly_rate` >= 0)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- CONSTRAINT `locations_user_name_chk` CHECK (char_length(trim(name)) > 0)
- UNIQUE (`id`, `user_id`) to support chained FKs

#### `spots`
- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `user_id` UUID NOT NULL REFERENCES `auth`.`users` (`id`)
- `location_id` UUID NOT NULL REFERENCES `locations` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
- `spot_number` VARCHAR(64) NOT NULL
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- UNIQUE (`location_id`, `spot_number`)
- UNIQUE (`id`, `user_id`)
- UNIQUE (`id`, `location_id`)
- FOREIGN KEY (`location_id`, `user_id`) REFERENCES `locations` (`id`, `user_id`) ON UPDATE CASCADE ON DELETE CASCADE

#### `clients`
- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `user_id` UUID NOT NULL REFERENCES `auth`.`users` (`id`)
- `first_name` VARCHAR(120) NOT NULL
- `last_name` VARCHAR(120) NOT NULL
- `email` VARCHAR(255)
- `phone` VARCHAR(255)
- `deleted_at` TIMESTAMPTZ NULL (soft delete)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- CHECK (`email` IS NULL OR `email` ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
- UNIQUE (`id`, `user_id`)

#### `bookings`
- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `user_id` UUID NOT NULL REFERENCES `auth`.`users` (`id`)
- `client_id` UUID NOT NULL REFERENCES `clients` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
- `spot_id` UUID NOT NULL REFERENCES `spots` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
- `location_id` UUID NOT NULL REFERENCES `locations` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
- `start_date` DATE NOT NULL
- `end_date` DATE NULL (stałe mogą być bez końca)
- `type` `reservation_type` NOT NULL
- `status` `reservation_status` NOT NULL DEFAULT 'aktywna'
- `payment_status` `payment_status` NOT NULL DEFAULT 'nieoplacone'
- `cost` DECIMAL(10,2) NULL CHECK (`cost` IS NULL OR `cost` >= 0)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- CHECK (`end_date` IS NULL OR `end_date` >= `start_date`)
- CHECK (`type` <> 'periodic' OR `end_date` IS NOT NULL)
- FOREIGN KEY (`client_id`, `user_id`) REFERENCES `clients` (`id`, `user_id`) ON UPDATE CASCADE ON DELETE RESTRICT
- FOREIGN KEY (`spot_id`, `user_id`) REFERENCES `spots` (`id`, `user_id`) ON UPDATE CASCADE ON DELETE RESTRICT
- FOREIGN KEY (`spot_id`, `location_id`) REFERENCES `spots` (`id`, `location_id`) ON UPDATE CASCADE ON DELETE RESTRICT
- FOREIGN KEY (`location_id`, `user_id`) REFERENCES `locations` (`id`, `user_id`) ON UPDATE CASCADE ON DELETE RESTRICT
- UNIQUE (`id`, `user_id`)

#### `price_exceptions`
- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `user_id` UUID NOT NULL REFERENCES `auth`.`users` (`id`)
- `location_id` UUID NOT NULL REFERENCES `locations` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
- `start_date` DATE NOT NULL
- `end_date` DATE NOT NULL
- `percentage_change` DECIMAL(6,2) NOT NULL CHECK (`percentage_change` BETWEEN -100.00 AND 500.00)
- `description` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- CHECK (`end_date` >= `start_date`)
- UNIQUE (`location_id`, `start_date`, `end_date`)
- FOREIGN KEY (`location_id`, `user_id`) REFERENCES `locations` (`id`, `user_id`) ON UPDATE CASCADE ON DELETE CASCADE

#### `payment_history`
- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `user_id` UUID NOT NULL REFERENCES `auth`.`users` (`id`)
- `booking_id` UUID NOT NULL REFERENCES `bookings` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
- `previous_status` `payment_status` NOT NULL
- `new_status` `payment_status` NOT NULL
- `changed_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- `changed_by` UUID NOT NULL REFERENCES `auth`.`users` (`id`)
- FOREIGN KEY (`booking_id`, `user_id`) REFERENCES `bookings` (`id`, `user_id`) ON UPDATE CASCADE ON DELETE CASCADE

#### `email_logs`
- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `user_id` UUID NOT NULL REFERENCES `auth`.`users` (`id`)
- `booking_id` UUID NULL REFERENCES `bookings` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
- `type` VARCHAR(32) NOT NULL CHECK (`type` IN ('reminder', 'overdue', 'confirmation'))
- `status` VARCHAR(16) NOT NULL CHECK (`status` IN ('sent', 'failed'))
- `recipients` JSONB NOT NULL (np. `{"owner":"owner@email.com","client":null}`)
- `error_message` TEXT
- `metadata` JSONB DEFAULT '{}'::jsonb
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT `now()`
- FOREIGN KEY (`booking_id`, `user_id`) REFERENCES `bookings` (`id`, `user_id`) ON UPDATE CASCADE ON DELETE SET NULL

## 2. Relacje między tabelami
- `auth.users (1) -> locations (N)` oraz `locations (1) -> spots (N)` i `locations (1) -> price_exceptions (N)` z propagacją `ON DELETE CASCADE`.
- `auth.users (1) -> clients/spots/bookings/price_exceptions/payment_history/email_logs (N)` przez kolumny `user_id`, zapewniając pełną izolację danych.
- `clients (1) -> bookings (N)` oraz `spots (1) -> bookings (N)` z `ON DELETE RESTRICT`, aby blokować usuwanie aktywnych rekordów.
- `locations (1) -> bookings (N)` dodaje szybki filtr kontekstowy i pozwala na indeks GiST po lokalizacji; zgodnie z decyzją MVP klienci nadal nie mają bezpośredniego FK do lokalizacji.
- `bookings (1) -> payment_history (N)` oraz `bookings (1) -> email_logs (N)` (druga relacja opcjonalna).
- `locations (1) -> spots (N)` -> `bookings (N)` zapewniają kontekst lokalizacji bez bezpośredniego FK w rezerwacjach, zgodnie z decyzją MVP.

## 3. Indeksy
- Wymagany extension `btree_gist` dla złożonych indeksów GiST.
- `locations`: B-tree na `user_id`.
- `spots`: B-tree na `user_id`, B-tree na `location_id`, UNIQUE (`location_id`, `spot_number`).
- `clients`: B-tree na `user_id`, B-tree na `lower(email)` dla szybkiego wyszukiwania, PARTIAL B-tree na (`id`) WHERE `deleted_at` IS NULL.
- `bookings`:
  - GiST na `(spot_id, daterange(start_date, COALESCE(end_date, start_date + 1), '[]'))` do wykrywania kolizji.
  - GiST na `(location_id, daterange(start_date, COALESCE(end_date, start_date + 1), '[]'))` przy użyciu `btree_gist` dla zapytań kalendarzowych.
  - B-tree na `user_id`, `location_id`, `client_id`, `spot_id`.
  - Partial B-tree na (`spot_id`, `start_date`) WHERE `status = 'aktywna'`.
- `price_exceptions`: B-tree na `user_id`, B-tree na `location_id`, UNIQUE (`location_id`, `start_date`, `end_date`).
- `payment_history`: B-tree na `user_id`, B-tree na (`booking_id`, `changed_at` DESC).
- `email_logs`: B-tree na `user_id`, złożony B-tree na (`created_at` DESC, `type`, `status`), B-tree na `booking_id`.

## 4. Zasady PostgreSQL (RLS)
Włącz RLS na każdej tabeli z `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`, a następnie użyj spójnych polityk:

- `locations`, `spots`, `bookings`, `price_exceptions`, `payment_history`, `email_logs`  
  - `CREATE POLICY <table>_select ON <table> FOR SELECT USING (user_id = auth.uid());`  
  - `CREATE POLICY <table>_insert ON <table> FOR INSERT WITH CHECK (user_id = auth.uid());`  
  - `CREATE POLICY <table>_update ON <table> FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`  
  - `CREATE POLICY <table>_delete ON <table> FOR DELETE USING (user_id = auth.uid());`

- `clients`  
  - `CREATE POLICY clients_select ON clients FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);`  
  - `CREATE POLICY clients_insert ON clients FOR INSERT WITH CHECK (user_id = auth.uid());`  
  - `CREATE POLICY clients_update ON clients FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`  
  - Opcjonalnie `clients_audit_select` WITHOUT `deleted_at` filter dla dedykowanych raportów administracyjnych.

Bezpośrednia kolumna `user_id` w każdej tabeli eliminuje konieczność zagnieżdżonych podzapytań w politykach i przyspiesza egzekucję RLS.

## 5. Dodatkowe uwagi i decyzje projektowe
- **Brak partycjonowania** w MVP; GiST i partial indexes pokrywają zapytania kalendarzowe do ~100k rezerwacji.
- **Soft delete klientów**: trigger `clients_soft_delete_hide` ustawia `deleted_at` zamiast fizycznego usunięcia; RLS domyślnie ukrywa rekordy.
- **Automatyczne logowanie płatności**: trigger `bookings_payment_status_audit` na INSERT/UPDATE `payment_status` tworzy rekord w `payment_history` z `changed_by`.
- **Walidacja kosztów**: wyliczanie w usługach (Edge Functions) z wykorzystaniem `locations.daily_rate/monthly_rate` i `price_exceptions`; baza przechowuje wynik końcowy dla historii.
- **Email logs**: kolumna `recipients` przechowuje strukturę `{owner: string, client: string|null}`; `metadata` gotowa na retry count, template id, itp.
- **Cron jobs**: Supabase Edge Functions aktualizują `bookings.payment_status` i `status`, zapisują efekty w `payment_history` oraz emitują wpisy `email_logs`; operacje powinny być opakowane w transakcje.
- **ON DELETE/UPDATE**: `clients` i `spots` są chronione `RESTRICT`, aby nie utracić aktywnych rezerwacji; `payment_history` kaskadowo usuwa się z rezerwacją; `email_logs` czyści FK ustawiając NULL.
- **Normalizacja**: schema spełnia 3NF; dublowanie `user_id` w tabelach umożliwia tanie RLS oraz indeksy filtrujące.
- **Range indeksy**: używamy `daterange`, bo kolumny są typu DATE; z rozszerzeniem `btree_gist` otrzymujemy zachowanie analogiczne do planowanego `tsrange`.