import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { mediaService } from '../../services/mediaService';
import { mediaFileUrlCandidates } from '../../utils/mediaUrl.js';
import './FossilMediaGallery.css';

/**
 * @param {{ fossilId: string | number; title?: string; className?: string }} props
 */
export default function FossilMediaGallery({ fossilId, title = 'Imágenes del registro', className = '' }) {
  const canPortal = typeof document !== 'undefined' && document.body;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brokenIds, setBrokenIds] = useState(() => new Set());
  const [previewIndex, setPreviewIndex] = useState(-1);

  useEffect(() => {
    setBrokenIds(new Set());
    setPreviewIndex(-1);
  }, [fossilId]);

  useEffect(() => {
    if (previewIndex < 0) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setPreviewIndex(-1);
      if (event.key === 'ArrowLeft') setPreviewIndex((i) => Math.max(0, i - 1));
      if (event.key === 'ArrowRight') setPreviewIndex((i) => Math.min(items.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewIndex, items.length]);

  useEffect(() => {
    if (previewIndex < 0) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [previewIndex]);

  useEffect(() => {
    if (fossilId == null) return undefined;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await mediaService.getByFossil(fossilId);
        if (!mounted) return;
        setItems(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        if (mounted) setError('No se pudieron cargar las imágenes de este registro.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fossilId]);

  if (loading) {
    return (
      <div className={`fossil-media-gallery fossil-media-gallery--loading ${className}`.trim()}>
        <p className="fossil-media-gallery__hint">Cargando imágenes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`fossil-media-gallery fossil-media-gallery--empty ${className}`.trim()}>
        <p className="fossil-media-gallery__hint">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`fossil-media-gallery fossil-media-gallery--empty ${className}`.trim()}>
        <p className="fossil-media-gallery__hint">No hay fotos adjuntas a este registro.</p>
      </div>
    );
  }

  return (
    <div className={`fossil-media-gallery ${className}`.trim()}>
      {title ? <h3 className="fossil-media-gallery__title">{title}</h3> : null}
      <div className="fossil-media-gallery__grid">
        {items.map((m) => {
          const candidates = mediaFileUrlCandidates(m.file_path);
          const src = candidates[0] || '';
          if (!src) return null;
          const failed = brokenIds.has(m.id);
          return (
            <figure key={m.id} className="fossil-media-gallery__figure">
              {failed ? (
                <div className="fossil-media-gallery__broken">
                  <p className="fossil-media-gallery__broken-text">No se pudo mostrar la imagen.</p>
                  {m.file_name ? (
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fossil-media-gallery__broken-link"
                    >
                      Abrir archivo
                    </a>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  className="fossil-media-gallery__link"
                  aria-label={`Abrir vista ampliada de ${m.file_name || `imagen ${m.id}`}`}
                  onClick={() => setPreviewIndex(items.findIndex((x) => x.id === m.id))}
                >
                  <img
                    src={src}
                    alt={m.file_name || `Imagen ${m.id}`}
                    loading="lazy"
                    className="fossil-media-gallery__img"
                    onError={(event) => {
                      const current = event.currentTarget.getAttribute('src') || '';
                      const idx = candidates.findIndex((u) => u === current);
                      const nextUrl = idx >= 0 ? candidates[idx + 1] : candidates[1];
                      if (nextUrl) {
                        event.currentTarget.setAttribute('src', nextUrl);
                        return;
                      }
                      setBrokenIds((prev) => {
                        const next = new Set(prev);
                        next.add(m.id);
                        return next;
                      });
                    }}
                  />
                </button>
              )}
              {m.file_name ? <figcaption className="fossil-media-gallery__cap">{m.file_name}</figcaption> : null}
            </figure>
          );
        })}
      </div>
      {previewIndex >= 0 && items[previewIndex] && canPortal
        ? createPortal(
            <div
              className="fossil-media-gallery__lightbox"
              role="dialog"
              aria-modal="true"
              onClick={() => setPreviewIndex(-1)}
            >
              <div
                className="fossil-media-gallery__lightbox-card"
                onClick={(event) => event.stopPropagation()}
                role="presentation"
              >
                <button
                  type="button"
                  className="fossil-media-gallery__close"
                  onClick={() => setPreviewIndex(-1)}
                  aria-label="Cerrar vista ampliada"
                >
                  ×
                </button>
                <img
                  src={mediaFileUrlCandidates(items[previewIndex].file_path)[0]}
                  alt={items[previewIndex].file_name || `Imagen ${items[previewIndex].id}`}
                  className="fossil-media-gallery__lightbox-img"
                  onError={(event) => {
                    const candidates = mediaFileUrlCandidates(items[previewIndex].file_path);
                    const current = event.currentTarget.getAttribute('src') || '';
                    const idx = candidates.findIndex((u) => u === current);
                    const nextUrl = idx >= 0 ? candidates[idx + 1] : candidates[1];
                    if (nextUrl) event.currentTarget.setAttribute('src', nextUrl);
                  }}
                />
                <div className="fossil-media-gallery__lightbox-meta">
                  <p>{items[previewIndex].file_name || 'Imagen sin nombre'}</p>
                  <a
                    href={mediaFileUrlCandidates(items[previewIndex].file_path)[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir original
                  </a>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
