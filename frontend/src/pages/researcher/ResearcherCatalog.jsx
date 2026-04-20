import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fossilService } from '../../services/fossilService';
import { getApiErrorMessage } from '../../utils/apiError.js';
import { clientPaginate } from '../../utils/pagination.js';
import { FOSSIL_CATEGORIES } from '../../constants/fossilMeta.js';
import { mediaService } from '../../services/mediaService';
import { mediaFileUrlCandidates } from '../../utils/mediaUrl.js';
import '../workspace/workspace-pages.css';
import './researcher-pages.css';

const PAGE_SIZE = 10;

function ResearcherCatalog() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [coverByFossilId, setCoverByFossilId] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fossilService.getAll();
        if (!mounted) return;
        setRows(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const published = useMemo(() => rows.filter((f) => f.status === 'published'), [rows]);
  const {
    slice,
    totalPages,
    page: safePage,
  } = useMemo(() => clientPaginate(published, { page, pageSize: PAGE_SIZE }), [published, page]);

  useEffect(() => {
    let cancelled = false;
    if (slice.length === 0) {
      setCoverByFossilId({});
      return undefined;
    }
    (async () => {
      const entries = await Promise.all(
        slice.map(async (f) => {
          try {
            const res = await mediaService.getByFossil(f.id);
            const first = Array.isArray(res?.data) ? res.data[0] : null;
            return [f.id, first?.file_path ? mediaFileUrlCandidates(first.file_path) : []];
          } catch {
            return [f.id, []];
          }
        })
      );
      if (!cancelled) setCoverByFossilId(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [slice]);

  const catLabel = (v) => FOSSIL_CATEGORIES.find((c) => c.value === v)?.label || v;

  return (
    <div className="workspace-page rw-animate-in">
      <div className="rw-catalog-hero">
        <p className="workspace-page__kicker">Archivo</p>
        <h1 className="workspace-page__title" style={{ border: 0, paddingBottom: 0, marginBottom: 8 }}>
          Catálogo de trabajo
        </h1>
        <p className="workspace-page__lead" style={{ marginBottom: 0 }}>
          Fichas <strong>publicadas</strong> por el sistema, listas para citación y estudios. Elegí una
          tarjeta para ver la ficha completa y el mapa del ejemplar.
        </p>
      </div>

      {loading ? (
        <p className="workspace-muted">Cargando…</p>
      ) : published.length === 0 ? (
        <div className="workspace-card workspace-muted">No hay registros publicados aún.</div>
      ) : (
        <>
          <div className="rw-catalog-grid">
            {slice.map((f) => (
              <Link key={f.id} to={`/researcher/fossil/${f.id}`} className="rw-catalog-card">
                {Array.isArray(coverByFossilId[f.id]) && coverByFossilId[f.id].length > 0 ? (
                  <div className="rw-catalog-card__thumb-wrap">
                    <img
                      src={coverByFossilId[f.id][0]}
                      alt=""
                      className="rw-catalog-card__thumb"
                      loading="lazy"
                      onError={(event) => {
                        const options = coverByFossilId[f.id] || [];
                        const current = event.currentTarget.getAttribute('src') || '';
                        const idx = options.findIndex((u) => u === current);
                        const nextUrl = idx >= 0 ? options[idx + 1] : options[1];
                        if (nextUrl) event.currentTarget.setAttribute('src', nextUrl);
                      }}
                    />
                  </div>
                ) : null}
                <span className="rw-catalog-card__code">{f.unique_code}</span>
                <h2 className="rw-catalog-card__name">{f.name}</h2>
                <div className="rw-catalog-card__meta">{catLabel(f.category)}</div>
                <span className="rw-catalog-card__link">Abrir ficha →</span>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="workspace-pager" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="workspace-btn workspace-btn--ghost"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span>
                Página {safePage} de {totalPages}
              </span>
              <button
                type="button"
                className="workspace-btn workspace-btn--ghost"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ResearcherCatalog;
