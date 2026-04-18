-- Aprobación de registros (explorer/researcher) por administrador
-- Ejecutar sobre una BD ya creada con el esquema anterior.

ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_status VARCHAR(20);
UPDATE users SET registration_status = 'approved' WHERE registration_status IS NULL;
ALTER TABLE users ALTER COLUMN registration_status SET NOT NULL;
ALTER TABLE users ALTER COLUMN registration_status SET DEFAULT 'pending';

ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_registration_status_check;
ALTER TABLE users ADD CONSTRAINT users_registration_status_check
  CHECK (registration_status IN ('pending', 'approved', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_users_registration_status ON users(registration_status) WHERE deleted_at IS NULL;
