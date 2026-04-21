/**
 * Ubicación del estudio en `scientific_studies.study_site_notes`.
 * v2: texto breve O coordenadas (una sola modalidad).
 * Legado: texto libre largo (se muestra tal cual).
 */

const MAX_TEXT_LEN = 280;

/**
 * @param {string | null | undefined} raw
 * @returns {{ kind: 'empty' } | { kind: 'legacy'; raw: string } | { kind: 'text'; text: string } | { kind: 'coords'; lat: number; lng: number }}
 */
export function parseStudySiteLocation(raw) {
  if (raw == null || String(raw).trim() === '') return { kind: 'empty' };
  const s = String(raw).trim();
  if (s.startsWith('{')) {
    try {
      const o = JSON.parse(s);
      if (o && typeof o === 'object' && o.v === 2 && o.mode === 'text' && typeof o.text === 'string') {
        return { kind: 'text', text: o.text };
      }
      if (o && typeof o === 'object' && o.v === 2 && o.mode === 'coords') {
        const lat = Number(o.lat);
        const lng = Number(o.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { kind: 'coords', lat, lng };
        }
      }
    } catch {
      /* seguir como legado */
    }
  }
  return { kind: 'legacy', raw: s };
}

/**
 * @param {{ mode: 'text' | 'coords'; text?: string; lat?: string; lng?: string }} input
 * @returns {string} cadena vacía si no hay datos válidos
 */
export function serializeStudySiteLocation(input) {
  if (input.mode === 'text') {
    const t = (input.text || '').trim().slice(0, MAX_TEXT_LEN);
    if (!t) return '';
    return JSON.stringify({ v: 2, mode: 'text', text: t });
  }
  const la = parseFloat(String(input.lat ?? '').replace(',', '.'));
  const ln = parseFloat(String(input.lng ?? '').replace(',', '.'));
  if (
    Number.isFinite(la) &&
    Number.isFinite(ln) &&
    la >= -90 &&
    la <= 90 &&
    ln >= -180 &&
    ln <= 180
  ) {
    return JSON.stringify({ v: 2, mode: 'coords', lat: la, lng: ln });
  }
  return '';
}

/**
 * @param {string | null | undefined} raw
 * @returns {string}
 */
export function formatStudySiteLocationDisplay(raw) {
  const p = parseStudySiteLocation(raw);
  if (p.kind === 'empty') return '';
  if (p.kind === 'legacy') return p.raw;
  if (p.kind === 'text') return p.text;
  return `Coordenadas WGS84: ${p.lat}, ${p.lng}`;
}
