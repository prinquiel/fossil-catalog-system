function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function looksCostaRicaMeta(point) {
  return point?.country_code === 'CRI' || Boolean(point?.province_code || point?.canton_code);
}

function inCostaRicaBounds(lat, lng) {
  return lat >= 7.5 && lat <= 11.5 && lng <= -82 && lng >= -86.8;
}

function distanceToCostaRica(lat, lng) {
  const crLat = 9.93;
  const crLng = -84.08;
  return Math.sqrt((lat - crLat) ** 2 + (lng - crLng) ** 2);
}

/**
 * Normaliza coordenadas con heurísticas seguras para registros CR
 * donde históricamente se guardó lat/lng invertido o sin signo.
 */
export function normalizeGeoPoint(point) {
  if (!point) return null;
  let lat = toNum(point.latitude);
  let lng = toNum(point.longitude);
  if (lat == null || lng == null) return null;

  const isCostaRicaContext = looksCostaRicaMeta(point);

  // Caso típico: lat = -84, lng = 9 (campos invertidos).
  if ((isCostaRicaContext || (Math.abs(lat) > 20 && Math.abs(lng) < 30)) && Math.abs(lat) > 20 && Math.abs(lng) < 30) {
    const prevLat = lat;
    lat = lng;
    lng = prevLat;
  }

  // Caso típico: lng positivo por falta de signo (debe ser oeste/negativo).
  if ((isCostaRicaContext || (lat > 5 && lat < 12.5)) && lng > 60 && lng < 100) {
    lng = -lng;
  }

  if (isCostaRicaContext) {
    // Elegimos la combinación más coherente con CR si el registro está marcado como CRI.
    const candidates = [
      { lat, lng },
      { lat: lng, lng: lat },
      { lat, lng: -Math.abs(lng) },
      { lat: lng, lng: -Math.abs(lat) },
    ].filter((c) => Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180);

    const inBounds = candidates.find((c) => inCostaRicaBounds(c.lat, c.lng));
    if (inBounds) {
      lat = inBounds.lat;
      lng = inBounds.lng;
    } else if (candidates.length) {
      const closest = [...candidates].sort(
        (a, b) => distanceToCostaRica(a.lat, a.lng) - distanceToCostaRica(b.lat, b.lng)
      )[0];
      lat = closest.lat;
      lng = closest.lng;
    }
  }

  // Rango válido geográfico
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { ...point, latitude: lat, longitude: lng };
}

export function hasValidCoords(point) {
  const p = normalizeGeoPoint(point);
  return Boolean(p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
}
