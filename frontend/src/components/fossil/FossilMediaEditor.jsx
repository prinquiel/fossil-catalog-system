import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  mediaService,
  validateImageFiles,
  MEDIA_MAX_FILES,
  MEDIA_CATEGORIES,
  MEDIA_ANGLES,
} from '../../services/mediaService';
import { mediaFileUrl } from '../../utils/mediaUrl.js';
import { getApiErrorMessage } from '../../utils/apiError.js';
import './FossilMediaEditor.css';

/**
 * Ver, eliminar y agregar imágenes en una ficha existente (explorador autor).
 * @param {{ fossilId: string | number }} props
 */
export default function FossilMediaEditor({ fossilId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    if (fossilId == null) return;
    setLoading(true);
    try {
      const res = await mediaService.getByFossil(fossilId);
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fossilId]);

  useEffect(() => {
    load();
  }, [load, version]);

  const remove = async (mediaId) => {
    if (!window.confirm('¿Eliminar esta imagen del registro?')) return;
    try {
      await mediaService.deleteMedia(mediaId);
      toast.success('Imagen eliminada.');
      setVersion((v) => v + 1);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const saveMeta = async (mediaId, patch) => {
    try {
      await mediaService.updateMedia(mediaId, patch);
      setItems((prev) =>
        prev.map((item) => (item.id === mediaId ? { ...item, ...patch } : item))
      );
      toast.success('Metadatos actualizados.');
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const onAddFiles = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length === 0) return;
    const next = picked;
    const check = validateImageFiles(next);
    if (!check.ok) {
      toast.error(check.message);
      return;
    }
    setUploading(true);
    try {
      await mediaService.uploadForFossil(fossilId, next);
      toast.success('Imágenes subidas.');
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fossil-media-editor">
      <p className="workspace-page__kicker" style={{ marginBottom: 8 }}>
        Multimedia del hallazgo
      </p>
      <p className="workspace-muted" style={{ marginBottom: 14, fontSize: '0.9rem' }}>
        Podés revisar el material actual, eliminar archivos, añadir más imágenes y definir metadatos de{' '}
        <strong>categoría</strong> (antes/después/análisis/detalle) y <strong>ángulo</strong>.
      </p>

      {loading ? (
        <p className="workspace-muted">Cargando imágenes…</p>
      ) : (
        <ul className="fossil-media-editor__list">
          {items.map((m) => {
            const src = mediaFileUrl(m.file_path);
            const isVideo =
              m.file_type === 'video' ||
              /\.(mp4|webm|mov|m4v)$/i.test(m.file_path || '') ||
              /\.(mp4|webm|mov|m4v)$/i.test(m.file_name || '');
            return (
              <li key={m.id} className="fossil-media-editor__item">
                <div className="fossil-media-editor__thumb">
                  {src ? (
                    isVideo ? (
                      <video src={src} muted playsInline preload="metadata" />
                    ) : (
                      <img src={src} alt="" loading="lazy" />
                    )
                  ) : (
                    <span className="fossil-media-editor__bad">Sin ruta</span>
                  )}
                </div>
                <div className="fossil-media-editor__meta">
                  <span className="fossil-media-editor__name">{m.file_name || 'archivo'}</span>
                  <div className="fossil-media-editor__chips">
                    <span>{m.file_type || 'image'}</span>
                    {m.media_category ? <span>{m.media_category}</span> : null}
                    {m.angle ? <span>{m.angle}</span> : null}
                  </div>
                  <div className="fossil-media-editor__row">
                    <label htmlFor={`media-category-${m.id}`}>Categoría</label>
                    <select
                      id={`media-category-${m.id}`}
                      value={m.media_category || 'general'}
                      onChange={(event) => saveMeta(m.id, { media_category: event.target.value })}
                    >
                      {MEDIA_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="fossil-media-editor__row">
                    <label htmlFor={`media-angle-${m.id}`}>Ángulo</label>
                    <select
                      id={`media-angle-${m.id}`}
                      value={m.angle || 'other'}
                      onChange={(event) => saveMeta(m.id, { angle: event.target.value })}
                    >
                      {MEDIA_ANGLES.map((angle) => (
                        <option key={angle} value={angle}>
                          {angle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className="fossil-media-editor__remove" onClick={() => remove(m.id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="fossil-media-editor__add">
        <label htmlFor={`fossil-media-add-${fossilId}`} className="fossil-media-editor__add-label">
          {uploading ? 'Subiendo…' : 'Agregar imágenes'}
        </label>
        <input
          id={`fossil-media-add-${fossilId}`}
          className="fossil-media-editor__file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading}
          onChange={onAddFiles}
        />
      </div>
    </div>
  );
}
