-- Roles múltiples por usuario (tabla user_roles; columna users.role eliminada si aún existe)

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('explorer', 'researcher', 'admin')),
  PRIMARY KEY (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    INSERT INTO user_roles (user_id, role)
    SELECT id, role FROM users WHERE role IS NOT NULL
    ON CONFLICT (user_id, role) DO NOTHING;
    ALTER TABLE users DROP COLUMN role;
  END IF;
END $$;
