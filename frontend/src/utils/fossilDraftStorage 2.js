const STORAGE_KEY = 'fossil_catalog_create_draft_v1';

/**
 * Guarda la ficha de nuevo hallazgo en localStorage (solo texto; sin fotos).
 * @param {Record<string, string>} form
 * @returns {boolean}
 */
export function saveFossilCreateDraft(form) {
  try {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      form: { ...form },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * @returns {{ form: Record<string, string>, savedAt: string } | null}
 */
export function loadFossilCreateDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    if (!j.form || typeof j.form !== 'object') return null;
    return { form: j.form, savedAt: typeof j.savedAt === 'string' ? j.savedAt : '' };
  } catch {
    return null;
  }
}

export function clearFossilCreateDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function hasFossilCreateDraft() {
  return loadFossilCreateDraft() != null;
}
