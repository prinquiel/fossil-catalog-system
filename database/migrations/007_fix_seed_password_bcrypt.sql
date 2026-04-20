-- Legado: corrige password_hash si en el pasado se cargó un seed antiguo con hash incorrecto.
-- El seed actual (02-seed-data.sql) ya no inserta usuarios de demostración.
UPDATE users
SET password_hash = '$2a$10$3wSvsYAItgU2CR.u8Fz5RegyaP1mPyEGUABMr4TQHqLI1a5E2PiZe',
    updated_at = CURRENT_TIMESTAMP
WHERE password_hash = '$2a$10$rQ8KvVPzJ.KqVx6kH9vEzOX8pGqX7nwYNWzJ3VH0cK3WXBmkEu7Ga';
