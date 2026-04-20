/**
 * Solicita la posición actual del dispositivo (WGS84).
 * Requiere contexto seguro (HTTPS o localhost) y permiso del usuario.
 *
 * @param {PositionOptions} [options]
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
export function requestCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Tu navegador no admite geolocalización.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        const code = err?.code;
        let msg = 'No se pudo obtener la ubicación.';
        if (code === 1) msg = 'Permiso de ubicación denegado. Actívalo en la configuración del navegador.';
        else if (code === 2) msg = 'La posición no está disponible en este momento.';
        else if (code === 3) msg = 'Tiempo de espera agotado al obtener la ubicación.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
        ...options,
      }
    );
  });
}

/** Formatea coordenadas para inputs (≈ precisión de metros). */
export function formatCoord(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return String(n.toFixed(6));
}
