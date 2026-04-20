import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { mediaService, validateImageFiles, MEDIA_MAX_FILES } from '../../services/mediaService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { FOSSIL_CATEGORIES } from '../../constants/fossilMeta.js';
import '../workspace/workspace-pages.css';

function ExplorerCreateFossil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState(/** @type {File[]} */ ([]));
  const [form, setForm] = useState({
    name: '',
    category: 'FOS',
    description: '',
    discoverer_name: '',
    discovery_date: '',
    geological_context: '',
    original_state_description: '',
    country_code: '',
    province_code: '',
    canton_code: '',
    latitude: '',
    longitude: '',
    location_description: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre del hallazgo es obligatorio.');
      return;
    }
    const preCheck = validateImageFiles(imageFiles);
    if (!preCheck.ok) {
      toast.error(preCheck.message);
      return;
    }
    setLoading(true);
    try {
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
        <div style={{ marginTop: 14 }}>
          <label htmlFor="loc-desc">Descripción del lugar</label>
          <input id="loc-desc" value={form.location_description} onChange={set('location_description')} />
        </div>

        <div className="workspace-actions">
          <button type="submit" className="workspace-btn" disabled={loading}>
            {loading ? 'Guardando…' : 'Enviar ficha'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExplorerCreateFossil;
