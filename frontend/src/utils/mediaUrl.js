import api from '../services/api.js';

/** Base del sitio para `/uploads/...` (mismo host que el front en dev con proxy). */
export function getUploadsBaseUrl() {
  if (typeof window === 'undefined') return '';
  const base = api.defaults.baseURL || '';
  if (base.startsWith('http')) {
    return base.replace(/\/api\/?$/, '');
  }
  return window.location.origin;
}

function dedupe(items) {
  return [...new Set(items.filter(Boolean))];
}

function normalizePath(filePath) {
  if (!filePath || typeof filePath !== 'string') return '';
  const clean = filePath.trim().replace(/\\/g, '/').replace(/^https?:\/\/[^/]+\//i, '');
  if (!clean) return '';

  const noLeading = clean.replace(/^\/+/, '');
  if (noLeading.includes('/uploads/')) {
    return noLeading.slice(noLeading.indexOf('uploads/'));
  }
  if (noLeading.startsWith('uploads/')) return noLeading;
  return `uploads/${noLeading}`;
}

function getCandidateBases() {
  if (typeof window === 'undefined') return [];
  const current = window.location.origin;
  const apiBase = getUploadsBaseUrl();
  const devBackendGuess =
    current.includes('localhost:517') || current.includes('127.0.0.1:517')
      ? current.replace(/:(5173|5174)$/, ':5001')
      : '';
  return dedupe([apiBase, current, devBackendGuess].map((x) => x?.replace(/\/$/, '')));
}

export function mediaFileUrlCandidates(filePath) {
  const normalized = normalizePath(filePath);
  if (!normalized) return [];
  const encoded = normalized
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  return getCandidateBases().map((base) => `${base}/${encoded}`);
}

/**
 * @param {string | null | undefined} filePath Ruta relativa en servidor (ej. uploads/images/fossil-1.webp)
 */
export function mediaFileUrl(filePath) {
  return mediaFileUrlCandidates(filePath)[0] || '';
}
