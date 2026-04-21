/** Map API row → estado de formulario de edición (explorador y admin). */
export function idStr(v) {
  if (v == null || v === '') return '';
  return String(v);
}

export function mapFossilApiToForm(f) {
  return {
    name: f.name || '',
    category: f.category || 'FOS',
    description: f.description || '',
    discoverer_name: f.discoverer_name || '',
    discovery_date: f.discovery_date ? String(f.discovery_date).slice(0, 10) : '',
    geological_context: f.geological_context || '',
    original_state_description: f.original_state_description || '',
    era_id: idStr(f.era_id),
    period_id: idStr(f.period_id),
    kingdom_id: idStr(f.kingdom_id),
    phylum_id: idStr(f.phylum_id),
    class_id: idStr(f.class_id),
    order_id: idStr(f.taxonomic_order_id),
    family_id: idStr(f.family_id),
    genus_id: idStr(f.genus_id),
    species_id: idStr(f.species_id),
    country_code: f.country_code != null ? String(f.country_code) : '',
    province_code: f.province_code != null ? String(f.province_code) : '',
    canton_code: f.canton_code != null ? String(f.canton_code) : '',
    latitude: f.latitude != null && f.latitude !== '' ? String(f.latitude) : '',
    longitude: f.longitude != null && f.longitude !== '' ? String(f.longitude) : '',
    location_description: f.location_description || '',
  };
}

export function appendClassificationToPayload(payload, form) {
  const keys = [
    'era_id',
    'period_id',
    'kingdom_id',
    'phylum_id',
    'class_id',
    'order_id',
    'family_id',
    'genus_id',
    'species_id',
  ];
  keys.forEach((k) => {
    const v = form[k];
    if (v === '' || v == null) payload[k] = '';
    else payload[k] = Number(v);
  });
}

/** Payload base para PUT /fossils/:id (misma forma que ExplorerEditFossil). */
export function buildFossilUpdatePayload(form) {
  const payload = {
    name: form.name.trim(),
    category: form.category,
    description: form.description.trim(),
    discoverer_name: form.discoverer_name.trim(),
    discovery_date: form.discovery_date || null,
    geological_context: form.geological_context.trim(),
    original_state_description: form.original_state_description.trim(),
    country_code: form.country_code.trim(),
    province_code: form.province_code.trim(),
    canton_code: form.canton_code.trim(),
    latitude: form.latitude.trim(),
    longitude: form.longitude.trim(),
    location_description: form.location_description.trim(),
  };
  appendClassificationToPayload(payload, form);
  return payload;
}
