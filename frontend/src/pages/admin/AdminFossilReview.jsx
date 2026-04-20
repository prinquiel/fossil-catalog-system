import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { studyService } from '../../services/studyService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { formatCoord, requestCurrentPosition } from '../../utils/geolocation.js';
import { FOSSIL_CATEGORIES } from '../../constants/fossilMeta.js';
import FossilMediaEditor from '../../components/fossil/FossilMediaEditor.jsx';
import FossilGeoTaxonomyFields from '../../components/fossil/FossilGeoTaxonomyFields.jsx';
import { mapFossilApiToForm, buildFossilUpdatePayload } from '../../utils/fossilEditForm.js';
import '../admin/adminPages.css';
import '../workspace/workspace-pages.css';

function AdminFossilReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fossil, setFossil] = useState(null);
  const [form, setForm] = useState(() => mapFossilApiToForm({}));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [linkedStudies, setLinkedStudies] = useState([]);
  const [studiesLoading, setStudiesLoading] = useState(false);

  const busy = saving || publishing || rejecting;

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const res = await fossilService.getById(id);
        if (m && res.success && res.data) {
          setFossil(res.data);
          setForm(mapFossilApiToForm(res.data));
        }
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => {
      m = false;
    };
  }, [id]);

  useEffect(() => {
    let m = true;
    setStudiesLoading(true);
    (async () => {
      try {
        const res = await studyService.getByFossil(id);
        if (m && res.success && Array.isArray(res.data)) {
          setLinkedStudies(res.data);
        } else if (m) {
          setLinkedStudies([]);
        }
      } catch {
        if (m) setLinkedStudies([]);
      } finally {
        if (m) setStudiesLoading(false);
      }
    })();
    return () => {
      m = false;
    };
  }, [id]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleUseMyLocation = async () => {
    setGeoLoading(true);
    try {
      const { latitude, longitude } = await requestCurrentPosition();
      setForm((prev) => ({
        ...prev,
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

  const persistForm = async () => {
    const payload = buildFossilUpdatePayload(form);
    const res = await fossilService.update(id, payload);
    if (!res.success) {
      const err = res.message || res.error || 'No se pudo guardar.';
      throw new Error(typeof err === 'string' ? err : 'No se pudo guardar.');
    }
    if (res.data) {
      setFossil(res.data);
      setForm(mapFossilApiToForm(res.data));
    }
  };

  const handleSaveOnly = async () => {
    if (!fossil) return;
    setSaving(true);
    try {
      await persistForm();
      toast.success('Cambios guardados.');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!fossil) return;
    setPublishing(true);
    try {
      await persistForm();
      await fossilService.approve(id);
      toast.success('Datos actualizados y publicado en catálogo.');
      navigate('/admin/pending-fossils');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setPublishing(false);
    }
  };

  const reject = async () => {
    if (!window.confirm('¿Rechazar este fósil?')) return;
    setRejecting(true);
    try {
      await fossilService.reject(id);
      toast.success('Rechazado.');
      navigate('/admin/pending-fossils');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setRejecting(false);
    }
  };

  if (loading) return <div className="admin-empty">Cargando ficha…</div>;
  if (!fossil) return <div className="admin-panel admin-empty">No se encontró el registro.</div>;

  const isPending = fossil.status === 'pending';

  return (
    <>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Revisión</p>
        <h1 className="admin-page-title">Revisar y editar ficha</h1>
        <p className="admin-page-desc">
          <strong>{form.name || fossil.name}</strong> · {fossil.unique_code} · Estado:{' '}
          <strong>{fossil.status}</strong>
        </p>
        <p className="admin-page-desc" style={{ marginTop: 8 }}>
          Puede corregir datos antes de publicar; al publicar se guardan los cambios y el hallazgo pasa al
          catálogo público.
        </p>
      </header>

      {studiesLoading ? (
        <p className="admin-page-desc" style={{ marginBottom: 16 }}>
          Cargando estudios vinculados…
        </p>
      ) : linkedStudies.length > 0 ? (
        <div className="admin-panel" style={{ maxWidth: 780, marginBottom: 16 }}>
          <p className="admin-page-desc" style={{ marginTop: 0, fontWeight: 700 }}>
            Estudios científicos vinculados
          </p>
          <p className="admin-page-desc" style={{ marginTop: 6, marginBottom: 10 }}>
            Solo lectura; abra cada estudio para revisar el contenido completo antes de publicarlo desde la lista de
            pendientes.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {linkedStudies.map((s) => (
              <li key={s.id} style={{ marginBottom: 8 }}>
                <Link to={`/admin/study/${s.id}`} className="workspace-link">
                  {s.title || 'Sin título'}
                </Link>
                {s.publication_status ? (
                  <span className="admin-tag" style={{ marginLeft: 8, fontSize: '0.78rem' }}>
                    {s.publication_status === 'pending'
                      ? 'Pendiente'
                      : s.publication_status === 'published'
                        ? 'Publicado'
                        : s.publication_status === 'rejected'
                          ? 'Rechazado'
                          : s.publication_status}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="admin-panel" style={{ maxWidth: 780 }}>
        <form
          className="workspace-card workspace-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveOnly();
          }}
        >
          <div className="workspace-form__row">
            <div>
              <label htmlFor="ar-name">Nombre</label>
              <input id="ar-name" value={form.name} onChange={set('name')} required disabled={busy} />
            </div>
            <div>
              <label htmlFor="ar-cat">Categoría</label>
              <select id="ar-cat" value={form.category} onChange={set('category')} disabled={busy}>
                {FOSSIL_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label htmlFor="ar-desc">Descripción</label>
            <textarea id="ar-desc" value={form.description} onChange={set('description')} disabled={busy} />
          </div>
          <div className="workspace-form__row" style={{ marginTop: 14 }}>
            <div>
              <label htmlFor="ar-disc">Descubridor</label>
              <input id="ar-disc" value={form.discoverer_name} onChange={set('discoverer_name')} disabled={busy} />
            </div>
            <div>
              <label htmlFor="ar-date">Fecha de hallazgo</label>
              <input
                id="ar-date"
                type="date"
                value={form.discovery_date}
                onChange={set('discovery_date')}
                disabled={busy}
              />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label htmlFor="ar-geo">Contexto geológico</label>
            <textarea id="ar-geo" value={form.geological_context} onChange={set('geological_context')} disabled={busy} />
          </div>
          <div style={{ marginTop: 14 }}>
            <label htmlFor="ar-state">Estado original</label>
            <textarea
              id="ar-state"
              value={form.original_state_description}
              onChange={set('original_state_description')}
              disabled={busy}
            />
          </div>

          <FossilGeoTaxonomyFields form={form} setForm={setForm} disabled={busy} idPrefix="ar-" />

          <hr className="np-rule" style={{ margin: '22px 0' }} />
          <p className="workspace-page__kicker" style={{ marginBottom: 10 }}>
            Ubicación
          </p>
          <div className="workspace-form__row">
            <div>
              <label htmlFor="ar-country">País (ISO alpha-3)</label>
              <input
                id="ar-country"
                value={form.country_code}
                onChange={set('country_code')}
                maxLength={3}
                placeholder="Opcional"
                disabled={busy}
              />
            </div>
          </div>
          <div className="workspace-form__row" style={{ marginTop: 14 }}>
            <div>
              <label htmlFor="ar-prov">Provincia (CR)</label>
              <input id="ar-prov" value={form.province_code} onChange={set('province_code')} disabled={busy} />
            </div>
            <div>
              <label htmlFor="ar-cant">Cantón</label>
              <input id="ar-cant" value={form.canton_code} onChange={set('canton_code')} disabled={busy} />
            </div>
          </div>
          <div className="workspace-form__row" style={{ marginTop: 14 }}>
            <div>
              <label htmlFor="ar-lat">Latitud</label>
              <input id="ar-lat" inputMode="decimal" value={form.latitude} onChange={set('latitude')} disabled={busy} />
            </div>
            <div>
              <label htmlFor="ar-lng">Longitud</label>
              <input id="ar-lng" inputMode="decimal" value={form.longitude} onChange={set('longitude')} disabled={busy} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              className="workspace-btn workspace-btn--ghost"
              disabled={busy || geoLoading}
              onClick={handleUseMyLocation}
            >
              {geoLoading ? 'Obteniendo ubicación…' : 'Usar mi ubicación (GPS)'}
            </button>
          </div>
          <div style={{ marginTop: 14 }}>
            <label htmlFor="ar-loc">Descripción del lugar</label>
            <input id="ar-loc" value={form.location_description} onChange={set('location_description')} disabled={busy} />
          </div>

          <hr className="np-rule" style={{ margin: '22px 0' }} />
          <FossilMediaEditor fossilId={id} />

          <div className="admin-actions-row" style={{ marginTop: 24, flexWrap: 'wrap', gap: 10 }}>
            <button type="submit" className="admin-btn" disabled={busy}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {isPending && (
              <>
                <button type="button" className="admin-btn" disabled={busy} onClick={handlePublish}>
                  {publishing ? 'Publicando…' : 'Guardar y publicar en catálogo'}
                </button>
                <button type="button" className="admin-btn admin-btn--ghost" disabled={busy} onClick={reject}>
                  {rejecting ? 'Rechazando…' : 'Rechazar'}
                </button>
              </>
            )}
          </div>
        </form>

        <div className="admin-actions-row" style={{ marginTop: 16 }}>
          <Link to="/admin/pending-fossils" className="admin-btn admin-btn--ghost">
            Volver a pendientes
          </Link>
          <Link to="/admin/fossils" className="admin-btn admin-btn--ghost">
            Todos los fósiles
          </Link>
        </div>
      </div>
    </>
  );
}

export default AdminFossilReview;
