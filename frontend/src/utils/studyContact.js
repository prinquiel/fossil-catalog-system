/**
 * Contacto del estudio guardado en `scientific_studies.institution_contact`.
 * Formato JSON v1 con campos fijos; texto plano previo se trata como legado.
 */

/**
 * @param {{ email?: string; name?: string; phone?: string; institution?: string }} parts
 * @returns {string} cadena vacía si no hay nada que guardar, o JSON
 */
export function serializeStudyContact(parts) {
  const email = parts.email?.trim() ?? '';
  const name = parts.name?.trim() ?? '';
  const phone = parts.phone?.trim() ?? '';
  const institution = parts.institution?.trim() ?? '';
  if (!email && !name && !phone && !institution) return '';
  return JSON.stringify({ v: 1, email, name, phone, institution });
}

/**
 * @param {string | null | undefined} raw
 * @returns {{ kind: 'empty' } | { kind: 'structured'; email?: string; name?: string; phone?: string; institution?: string } | { kind: 'legacy'; text: string }}
 */
export function parseStudyContact(raw) {
  if (raw == null || String(raw).trim() === '') return { kind: 'empty' };
  const s = String(raw).trim();
  if (s.startsWith('{')) {
    try {
      const o = JSON.parse(s);
      if (o && typeof o === 'object' && o.v === 1) {
        return {
          kind: 'structured',
          email: typeof o.email === 'string' ? o.email : '',
          name: typeof o.name === 'string' ? o.name : '',
          phone: typeof o.phone === 'string' ? o.phone : '',
          institution: typeof o.institution === 'string' ? o.institution : '',
        };
      }
    } catch {
      /* legado */
    }
  }
  return { kind: 'legacy', text: s };
}
