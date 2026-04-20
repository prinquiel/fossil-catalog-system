-- Corrige password_hash de usuarios cargados con 02-seed-data.sql antiguo:
-- el hash guardado no correspondia a la contrasena documentada "Admin123!".
-- Contrasena tras este script: Admin123! (misma que en seed actualizado).
UPDATE users
SET password_hash = '$2a$10$3wSvsYAItgU2CR.u8Fz5RegyaP1mPyEGUABMr4TQHqLI1a5E2PiZe',
    updated_at = CURRENT_TIMESTAMP
WHERE password_hash = '$2a$10$rQ8KvVPzJ.KqVx6kH9vEzOX8pGqX7nwYNWzJ3VH0cK3WXBmkEu7Ga';
