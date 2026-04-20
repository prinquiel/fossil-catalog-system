import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { FOSSIL_CATEGORIES } from '../../constants/fossilMeta.js';
import FossilMediaEditor from '../../components/fossil/FossilMediaEditor.jsx';
import '../workspace/workspace-pages.css';

function ExplorerEditFossil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fossil, setFossil] = useState(null);
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fossilService.getById(id);
        if (!mounted || !res.success || !res.data) return;
        const f = res.data;
        if (String(f.created_by) !== String(user?.id)) {
          setFossil(null);
          return;
        }
        setFossil(f);
        setForm({
          name: f.name || '',
          category: f.category || 'FOS',
          description: f.description || '',
          discoverer_name: f.discoverer_name || '',
          discovery_date: f.discovery_date ? String(f.discovery_date).slice(0, 10) : '',
          geological_context: f.geological_context || '',
          original_state_description: f.original_state_description || '',
          country_code: f.country_code != null ? String(f.country_code) : '',
          province_code: f.province_code != null ? String(f.province_code) : '',
          canton_code: f.canton_code != null ? String(f.canton_code) : '',
          latitude: f.latitude != null && f.latitude !== '' ? String(f.latitude) : '',
          longitude: f.longitude != null && f.longitude !== '' ? String(f.longitude) : '',
          location_description: f.location_description || '',
        });
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, user?.id]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fossil) return;
    setSaving(true);
    try {
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
      const res = await fossilService.update(id, payload);
      if (res.success) {
        toast.success('Cambios guardados.');
        navigate('/explorer/my-fossils');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="workspace-page">
        <p className="workspace-muted">Cargando ficha…</p>
      </div>
    );
  }

  if (!fossil) {
    return (
      <div className="workspace-page">
        <div className="workspace-alert">
          No puede editar este registro: no existe o no figura usted como autor del hallazgo.
        </div>
        <Link to="/explorer/my-fossils" className="workspace-link">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <p className="workspace-page__kicker">Edición</p>
      <h1 className="workspace-page__title">Editar hallazgo</h1>
      <p className="workspace-page__lead">
        Código: <strong>{fossil.unique_code}</strong> · Estado actual: <strong>{fossil.status}</strong>
      </p>

      <form className="workspace-card workspace-form" onSubmit={handleSubmit}>
        <div className="workspace-form__row">
          <div>
            <label htmlFor="e-name">Nombre</label>
            <input id="e-name" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label htmlFor="e-cat">Categoría</label>
            <select id="e-cat" value={form.category} onChange={set('category')}>
              {FOSSIL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="e-desc">Descripción</label>
          <textarea id="e-desc" value={form.description} onChange={set('description')} />
        </div>
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="e-disc">Descubridor</label>
            <input id="e-disc" value={form.discoverer_name} onChange={set('discoverer_name')} />
          </div>
          <div>
            <label htmlFor="e-date">Fecha de hallazgo</label>
            <input id="e-date" type="date" value={form.discovery_date} onChange={set('discovery_date')} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="e-geo">Contexto geológico</label>
          <textarea id="e-geo" value={form.geological_context} onChange={set('geological_context')} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="e-state">Estado original</label>
          <textarea
            id="e-state"
            value={form.original_state_description}
            onChange={set('original_state_description')}
          />
        </div>

        <hr className="np-rule" style={{ margin: '22px 0' }} />
        <p className="workspace-page__kicker" style={{ marginBottom: 10 }}>
          Ubicación
        </p>
        <p className="workspace-muted" style={{ marginBottom: 12 }}>
          Puede corregir coordenadas o notas de lugar en cualquier estado; el mapa de investigación solo lista
          hallazgos ya publicados.
        </p>
        <div className="workspace-form__row">
          <div>
            <label htmlFor="e-country">País (ISO alpha-3)</label>
            <input
              id="e-country"
              value={form.country_code}
              onChange={set('country_code')}
              maxLength={3}
              placeholder="Opcional"
            />
          </div>
        </div>
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="e-prov">Provincia (CR)</label>
            <input id="e-prov" value={form.province_code} onChange={set('province_code')} />
          </div>
          <div>
            <label htmlFor="e-cant">Cantón</label>
            <input id="e-cant" value={form.canton_code} onChange={set('canton_code')} />
          </div>
        </div>
        <div className="workspace-form__row" style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="e-lat">Latitud</label>
            <input id="e-lat" inputMode="decimal" value={form.latitude} onChange={set('latitude')} />
          </div>
          <div>
            <label htmlFor="e-lng">Longitud</label>
            <input id="e-lng" inputMode="decimal" value={form.longitude} onChange={set('longitude')} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="e-loc">Descripción del lugar</label>
          <input id="e-loc" value={form.location_description} onChange={set('location_description')} />
        </div>

        <hr className="np-rule" style={{ margin: '22px 0' }} />
        <FossilMediaEditor fossilId={id} />

        <p className="workspace-muted" style={{ marginTop: 12 }}>
          El estado editorial (publicado / revisión / rechazado) lo define un administrador con el flujo de
          aprobación; usted puede corregir datos descriptivos y ubicación si es el autor del registro.
        </p>
        <div className="workspace-actions">
          <button type="submit" className="workspace-btn" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Link to="/explorer/my-fossils" className="workspace-btn workspace-btn--ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ExplorerEditFossil;
