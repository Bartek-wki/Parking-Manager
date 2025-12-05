-- Fix incorrect email check constraint that prevented creating clients with valid emails.
-- The previous regex had a double backslash '\\.' which required a literal backslash in the email domain.

BEGIN;

ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_check;

ALTER TABLE clients ADD CONSTRAINT clients_email_check 
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

COMMIT;

