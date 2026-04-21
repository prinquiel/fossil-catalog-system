/**
 * Algunos registros antiguos guardaron texto de perfil en `username` en lugar del login.
 */
function looksLikeRoleLabel(login) {
  if (!login || typeof login !== 'string') return false;
  const t = login.trim().toLowerCase();
  if (t === 'investigador' || t === 'explorador') return true;
  if (t.includes('investigador') && t.includes('explorador')) return true;
  if (t.includes('explorador') && t.includes('investigador')) return true;
  return false;
}

/**
 * Etiqueta para columnas admin (lista de estudios): nombre de usuario (login) del investigador.
 * Compatibilidad con respuestas antiguas (`researcher_username`).
 */
export function studyResearcherAccountLabel(row) {
  const login = row?.study_researcher_login ?? row?.researcher_username;
  const email = row?.study_researcher_email;
  if (login && email && looksLikeRoleLabel(login)) {
    const local = email.split('@')[0];
    if (local) return local;
  }
  if (login) return login;
  if (email) return email.split('@')[0] || email;
  return '—';
}
