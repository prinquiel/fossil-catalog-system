import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { mediaService, validateImageFiles, MEDIA_MAX_FILES } from '../../services/mediaService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { formatCoord, requestCurrentPosition } from '../../utils/geolocation.js';
import {
  clearFossilCreateDraft,
  loadFossilCreateDraft,
  saveFossilCreateDraft,
} from '../../utils/fossilDraftStorage.js';
import {
  enqueueOfflineFossil,
  readOfflineFossilQueue,
  removeOfflineQueuedFossil,
} from '../../utils/fossilOfflineQueue.js';
import { FOSSIL_CATEGORIES } from '../../constants/fossilMeta.js';
import FossilGeoTaxonomyFields from '../../components/fossil/FossilGeoTaxonomyFields.jsx';
import '../workspace/workspace-pages.css';

const DEFAULT_FORM = {
  name: '',
  category: 'FOS',
  description: '',
  discoverer_name: '',
  discovery_date: '',
  geological_context: '',
  original_state_description: '',
  era_id: '',
  period_id: '',
  kingdom_id: '',
  phylum_id: '',
  class_id: '',
  order_id: '',
  family_id: '',
  genus_id: '',
  species_id: '',
  country_code: '',
  province_code: '',
  canton_code: '',
  latitude: '',
  longitude: '',
  location_description: '',
};

function appendClassificationToPayload(payload, form) {
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

function formatSavedAt(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '';
  }
}

function ExplorerCreateFossil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  /** Borrador en disco detectado al cargar la página (recuperar o descartar). */
  const [recoverableDraft, setRecoverableDraft] = useState(
    /** @type {{ form: typeof DEFAULT_FORM, savedAt: string } | null} */ (null)
  );
  const [lastLocalSaveLabel, setLastLocalSaveLabel] = useState('');
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const [imageFiles, setImageFiles] = useState(/** @type {File[]} */ ([]));
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const isBioCategory = form.category === 'FOS' || form.category === 'PAL';

  useEffect(() => {
    const d = loadFossilCreateDraft();
    if (d?.form) setRecoverableDraft({ form: { ...DEFAULT_FORM, ...d.form }, savedAt: d.savedAt });
  }, []);

  useEffect(() => {
    setOfflineQueueCount(readOfflineFossilQueue().length);
  }, []);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (isBioCategory) return;
    setForm((f) => ({
      ...f,
      kingdom_id: '',
      phylum_id: '',
      class_id: '',
      order_id: '',
      family_id: '',
      genus_id: '',
      species_id: '',
    }));
  }, [isBioCategory]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUseMyLocation = async () => {
    setGeoLoading(true);
    try {
      const { latitude, longitude } = await requestCurrentPosition();
      setForm((f) => ({
        ...f,
        latitude: formatCoord(latitude),
        longitude: formatCoord(longitude),
      }));
      toast.success('Coordenadas GPS aplicadas.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo obtener la ubicación.');
    } finally {
      setGeoLoading(false);
    }
  };

  const onPickImages = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const next = [...imageFiles, ...picked].slice(0, MEDIA_MAX_FILES);
    const check = validateImageFiles(next);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    setImageFiles(next);
  };

  const removeImageAt = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraftLocally = () => {
    const ok = saveFossilCreateDraft(form);
    if (!ok) {
      toast.error('No se pudo guardar en este dispositivo (almacenamiento lleno o bloqueado).');
      return;
    }
    const label = formatSavedAt(new Date().toISOString());
    setLastLocalSaveLabel(label);
    toast.success('Borrador guardado en este navegador. Podés enviar la ficha cuando haya conexión.');
  };

  const handleRestoreDraft = () => {
    if (!recoverableDraft) return;
    setForm(recoverableDraft.form);
    setRecoverableDraft(null);
    toast.success('Borrador recuperado. Las fotos hay que volver a seleccionarlas si las tenías.');
  };

  const handleDiscardDraft = () => {
    clearFossilCreateDraft();
    setRecoverableDraft(null);
    toast('Borrador local eliminado.');
  };

  const buildPayloadFromForm = () => {
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || undefined,
      discoverer_name: form.discoverer_name.trim() || undefined,
      discovery_date: form.discovery_date || undefined,
      geological_context: form.geological_context.trim() || undefined,
      original_state_description: form.original_state_description.trim() || undefined,
    };
    const hasGps = form.latitude.trim() && form.longitude.trim();
    const hasCR = form.province_code.trim() && form.canton_code.trim();
    if (form.country_code.trim()) payload.country_code = form.country_code.trim();
    if (hasCR) {
      payload.province_code = form.province_code.trim();
      payload.canton_code = form.canton_code.trim();
    }
    if (hasGps) {
      payload.latitude = Number(form.latitude);
      payload.longitude = Number(form.longitude);
    }
    if (form.location_description.trim()) payload.location_description = form.location_description.trim();
    appendClassificationToPayload(payload, form);
    return payload;
  };

  const flushOfflineQueue = async () => {
    if (!isOnline) {
      toast.error('Conéctese a internet para sincronizar la cola offline.');
      return;
    }
    const queue = readOfflineFossilQueue();
    if (queue.length === 0) {
      setOfflineQueueCount(0);
      toast('No hay envíos pendientes en cola.');
      return;
    }
    setSyncingQueue(true);
    let successCount = 0;
    for (const item of queue) {
      try {
        const res = await fossilService.create(item.payload);
        if (res?.success) {
          removeOfflineQueuedFossil(item.id);
          successCount += 1;
        }
      } catch (error) {
        toast.error(`Se detuvo la sincronización: ${getApiErrorMessage(error)}`);
        break;
      }
    }
    const remaining = readOfflineFossilQueue().length;
    setOfflineQueueCount(remaining);
    if (successCount > 0) {
      toast.success(`Se sincronizaron ${successCount} ficha(s) offline.`);
    }
    setSyncingQueue(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre del hallazgo es obligatorio.');
      return;
    }
    const payload = buildPayloadFromForm();
    if (!isOnline) {
      enqueueOfflineFossil(payload);
      setOfflineQueueCount(readOfflineFossilQueue().length);
      toast.success('Sin conexión: la ficha se guardó en cola offline para sincronizar luego.');
      return;
    }
    const preCheck = validateImageFiles(imageFiles);
    if (!preCheck.ok) {
      toast.error(preCheck.message);
      return;
    }
    setLoading(true);
    try {
      const res = await fossilService.create(payload);
      if (res.success && res.data?.id) {
        const id = res.data.id;
        if (imageFiles.length > 0) {
          try {
            const up = await mediaService.uploadForFossil(id, imageFiles);
            const n = up.data?.length ?? imageFiles.length;
            toast.success(
              `Registro creado con ${n} imagen(es). Queda en revisión hasta su publicación.`
            );
          } catch (uploadErr) {
            toast.error(
              `${getApiErrorMessage(uploadErr)} El fósil se guardó; podés intentar subir fotos más tarde.`
            );
          }
        } else {
          toast.success('Registro creado. Queda en revisión hasta su publicación.');
        }
        clearFossilCreateDraft();
        setLastLocalSaveLabel('');
        navigate(`/explorer/my-fossils`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Nuevo registro</p>
      <h1 className="workspace-page__title">Registrar un hallazgo</h1>
      <p className="workspace-page__lead">
        Complete la ficha con la información disponible en campo. El código interno se asigna automáticamente
        si no indica uno propio acreditado. Podés <strong>adjuntar fotos</strong> en la sección siguiente al
        resumen del hallazgo.
      </p>

      {!isOnline ? (
        <div className="workspace-alert" role="status" style={{ marginBottom: 16 }}>
          <strong>Sin conexión a internet.</strong> Podés seguir completando la ficha y usar{' '}
          <strong>Guardar borrador en este dispositivo</strong> o <strong>Enviar a cola offline</strong>; cuando vuelva la red,
          abrí esta página y sincronizá.
        </div>
      ) : null}
      {offlineQueueCount > 0 ? (
        <div className="workspace-card" style={{ marginBottom: 16, padding: '14px 18px' }}>
          <p style={{ margin: '0 0 10px' }}>
            Hay <strong>{offlineQueueCount}</strong> ficha(s) en cola offline pendientes de sincronización.
          </p>
          <button type="button" className="workspace-btn" disabled={!isOnline || syncingQueue} onClick={flushOfflineQueue}>
            {syncingQueue ? 'Sincronizando…' : 'Sincronizar cola offline'}
          </button>
        </div>
      ) : null}

      {recoverableDraft ? (
        <div
          className="workspace-card"
          style={{
            marginBottom: 16,
            padding: '14px 18px',
            borderStyle: 'dashed',
            background: 'var(--workspace-muted-bg, rgba(0,0,0,0.04))',
          }}
        >
          <p style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>
            Hay un <strong>borrador guardado</strong> en este navegador
            {recoverableDraft.savedAt ? ` (${formatSavedAt(recoverableDraft.savedAt)})` : ''}.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button type="button" className="workspace-btn" onClick={handleRestoreDraft}>
              Recuperar borrador
            </button>
            <button type="button" className="workspace-btn workspace-btn--ghost" onClick={handleDiscardDraft}>
              Descartar borrador
            </button>
          </div>
        </div>
      ) : null}

      <form className="workspace-card workspace-form" onSubmit={handleSubmit}>
        <div className="workspace-form__row">
          <div>
            <label htmlFor="fossil-name">Nombre descriptivo</label>
            <input id="fossil-name" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label htmlFor="fossil-cat">Categoría</label>
            <select id="fossil-cat" value={form.category} onChange={set('category')}>
              {FOSSIL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="workspace-muted" style={{ margin: '8px 0 0', fontSize: '0.84rem' }}>
              {isBioCategory
                ? 'Fósil/Paleontológico: habilita clasificación biológica (reino a especie/grupo).'
                : 'Roca/Mineral: no requiere clasificación biológica.'}
            </p>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label htmlFor="fossil-desc">Descripción</label>
          <textarea id="fossil-desc" value={form.description} onChange={set('description')} />
        </div>

        <div className="workspace-file-field workspace-file-field--prominent" style={{ marginTop: 18 }}>
          <h2 className="workspace-file-field__heading">Fotografías del hallazgo</h2>
          <p className="workspace-muted" style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>
            Opcional. JPG, PNG o WEBP — hasta {MEDIA_MAX_FILES} archivos, máx. 10 MB cada uno. Se envían al pulsar{' '}
            <strong>Enviar ficha</strong>.
          </p>
          <div className="workspace-file-upload-row">
            <label htmlFor="fossil-images" className="workspace-btn workspace-btn--ghost" style={{ cursor: 'pointer' }}>
              Elegir fotos…
            </label>
            <span className="workspace-muted" style={{ fontSize: '0.86rem' }}>
              {imageFiles.length === 0
                ? 'Ningún archivo seleccionado todavía.'
                : `${imageFiles.length} archivo(s) listo(s) para enviar.`}
            </span>
          </div>
          <input
            id="fossil-images"
            className="workspace-file-upload-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onPickImages}
            disabled={loading}
            aria-label="Seleccionar imágenes del hallazgo"
          />
          {imageFiles.length > 0 ? (
            <ul className="workspace-file-list">
              {imageFiles.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <span>
                    {f.name} ({(f.size / 1024).toFixed(0)} KB)
                  </span>
                  <button type="button" onClick={() => removeImageAt(i)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="fossil-disc">Nombre del descubridor</label>
            <input id="fossil-disc" value={form.discoverer_name} onChange={set('discoverer_name')} />
          </div>
          <div>
            <label htmlFor="fossil-date">Fecha de hallazgo</label>
            <input
              id="fossil-date"
              type="date"
              value={form.discovery_date}
              onChange={set('discovery_date')}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label htmlFor="fossil-geo">Contexto geológico</label>
          <textarea id="fossil-geo" value={form.geological_context} onChange={set('geological_context')} />
        </div>

        <div style={{ marginTop: 14 }}>
          <label htmlFor="fossil-state">Estado original del ejemplar</label>
          <textarea
            id="fossil-state"
            value={form.original_state_description}
            onChange={set('original_state_description')}
          />
        </div>

        <FossilGeoTaxonomyFields
          form={form}
          setForm={setForm}
          disabled={loading}
          showTaxonomy={isBioCategory}
          showSpecies={isBioCategory}
        />

        <hr className="np-rule" style={{ margin: '22px 0' }} />
        <p className="workspace-muted" style={{ marginBottom: 12 }}>
          Ubicación (opcional): puede guardar solo <strong>WGS84</strong> (latitud y longitud) para yacimientos
          fuera de Costa Rica, o combinar coordenadas con códigos de provincia y cantón para archivo nacional.
        </p>
        <div className="workspace-form__row">
          <div>
            <label htmlFor="country">País (ISO alpha-3, opcional)</label>
            <input
              id="country"
              value={form.country_code}
              onChange={set('country_code')}
              placeholder="Ej. ARG, MEX — si solo hay GPS"
              maxLength={3}
            />
          </div>
        </div>
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="prov">Código provincia (Costa Rica)</label>
            <input id="prov" value={form.province_code} onChange={set('province_code')} placeholder="Ej. 1" />
          </div>
          <div>
            <label htmlFor="cant">Código cantón</label>
            <input id="cant" value={form.canton_code} onChange={set('canton_code')} placeholder="Ej. 01" />
          </div>
        </div>
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="lat">Latitud</label>
            <input id="lat" inputMode="decimal" value={form.latitude} onChange={set('latitude')} />
          </div>
          <div>
            <label htmlFor="lng">Longitud</label>
            <input id="lng" inputMode="decimal" value={form.longitude} onChange={set('longitude')} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            className="workspace-btn workspace-btn--ghost"
            disabled={loading || geoLoading}
            onClick={handleUseMyLocation}
          >
            {geoLoading ? 'Obteniendo ubicación…' : 'Usar mi ubicación (GPS)'}
          </button>
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="loc-desc">Descripción del lugar</label>
          <input id="loc-desc" value={form.location_description} onChange={set('location_description')} />
        </div>

        <hr className="np-rule" style={{ margin: '22px 0' }} />
        <p className="workspace-page__kicker" style={{ marginBottom: 8 }}>
          Borrador local (sin conexión o respaldo)
        </p>
        <p className="workspace-muted" style={{ marginBottom: 12, fontSize: '0.9rem', maxWidth: 640 }}>
          <strong>No incluye fotos</strong> (por tamaño); tendrás que volver a elegirlas al enviar.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="workspace-btn workspace-btn--ghost"
            disabled={loading}
            onClick={handleSaveDraftLocally}
          >
            Guardar borrador en este dispositivo
          </button>
          {lastLocalSaveLabel ? (
            <span className="workspace-muted" style={{ fontSize: '0.86rem' }}>
              Último guardado: {lastLocalSaveLabel}
            </span>
          ) : null}
        </div>

        <div className="workspace-actions">
          <button type="submit" className="workspace-btn" disabled={loading}>
            {loading ? 'Guardando…' : isOnline ? 'Enviar ficha' : 'Guardar en cola offline'}
          </button>
          <button
            type="button"
            className="workspace-btn workspace-btn--ghost"
            disabled={loading}
            onClick={() => {
              if (!form.name.trim()) {
                toast.error('Para cola offline, ingrese al menos el nombre del hallazgo.');
                return;
              }
              enqueueOfflineFossil(buildPayloadFromForm());
              setOfflineQueueCount(readOfflineFossilQueue().length);
              toast.success('Ficha añadida a cola offline.');
            }}
          >
            Enviar a cola offline
          </button>
          {!isOnline ? (
            <span className="workspace-muted" style={{ fontSize: '0.88rem' }}>
              Enviar inmediato requiere conexión.
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default ExplorerCreateFossil;
