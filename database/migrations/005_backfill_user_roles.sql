-- Opcional: ejecutar DESPUÉS de 004 si hay usuarios sin ninguna fila en user_roles
-- (por ejemplo, si se eliminó users.role sin haber migrado antes).
-- Asigna 'explorer' por defecto. Los administradores deben ajustarse manualmente en user_roles.

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'explorer'
FROM users u
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id)
ON CONFLICT (user_id, role) DO NOTHING;
