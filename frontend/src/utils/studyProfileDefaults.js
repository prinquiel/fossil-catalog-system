/**
 * Valores por defecto para el bloque de contacto del estudio según el usuario autenticado.
 * @param {{ email?: string; username?: string; first_name?: string; last_name?: string; phone?: string; workplace?: string } | null | undefined} user
 */
export function getDefaultStudyContactFromUser(user) {
  if (!user) {
    return { email: '', name: '', phone: '', institution: '' };
  }
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return {
    email: user.email || '',
    name: name || user.username || '',
    phone: user.phone || '',
    institution: user.workplace || '',
  };
}

/** Solo dígitos y separadores habituales de teléfono (+, espacios, guiones, paréntesis). */
const PHONE_ALLOWED = /[^\d+()\s.-]/g;

export function filterPhoneInput(value) {
  return String(value ?? '').replace(PHONE_ALLOWED, '').slice(0, 24);
}
