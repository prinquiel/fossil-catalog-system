import api from './api';

/** Coincide con backend: multer upload.array('images', 10) y límite por archivo */
export const MEDIA_MAX_FILES = 10;
export const MEDIA_MAX_BYTES_PER_FILE = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

/**
 * @param {File[]} files
 * @returns {{ ok: true } | { ok: false; message: string }}
 */
export function validateImageFiles(files) {
  if (!files.length) return { ok: true };
  if (files.length > MEDIA_MAX_FILES) {
    return { ok: false, message: `Máximo ${MEDIA_MAX_FILES} imágenes por envío.` };
  }
  for (const f of files) {
    if (f.size > MEDIA_MAX_BYTES_PER_FILE) {
      return { ok: false, message: `«${f.name}» supera 10 MB.` };
    }
    if (!ALLOWED_MIME.has(f.type)) {
      return { ok: false, message: `«${f.name}» no es JPG, PNG ni WEBP.` };
    }
  }
  return { ok: true };
}

export const mediaService = {
  /**
   * POST /api/media/upload (multipart). Requiere fósil ya creado.
   * Usa fetch para no forzar Content-Type: application/json del cliente axios.
   * @param {number} fossilId
   * @param {File[]} files
   */
  async uploadForFossil(fossilId, files) {
    if (!files?.length) return { success: true, data: [], skipped: true };

    const formData = new FormData();
    formData.append('fossil_id', String(fossilId));
    formData.append('media_category', 'general');
    for (const file of files) {
      formData.append('images', file);
    }

    const token = localStorage.getItem('token');
    const base = (api.defaults.baseURL || '').replace(/\/$/, '');
    const url = `${base}/media/upload`;

    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      const err = new Error(data.error || `Error al subir imágenes (${res.status})`);
      err.response = { data: { error: data.error, hint: data.hint } };
      throw err;
    }

    return data;
  },
};
