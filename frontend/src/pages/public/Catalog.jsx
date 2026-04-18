import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fossilService } from '../../services/fossilService';
import './Catalog.css';

const demoFossils = [
  {
    id: 'demo-1',
    unique_code: 'CRI-ALA-SRM-FOS-10321',
    name: 'Amonite de Punta Arenas',
    category: 'FOS',
    status: 'published',
    description:
      'Ejemplar espiralado conservado en matriz arenosa, hallado en un estrato marino de grano fino.',
    geological_context: 'Jurásico tardío',
    discovery_date: '2026-02-15',
    created_at: '2026-02-16',
    created_by_username: 'explorador1',
  },
  {
    id: 'demo-2',
    unique_code: 'CRI-CAR-TLP-PAL-54900',
    name: 'Fragmento vertebral terrestre',
    category: 'PAL',
    status: 'pending',
    description:
      'Sección parcial con mineralización homogénea y patrón de compactación notable en sección transversal.',
    geological_context: 'Cretácico temprano',
    discovery_date: '2026-03-03',
    created_at: '2026-03-04',
    created_by_username: 'explorador2',
  },
  {
    id: 'demo-3',
    unique_code: 'CRI-GUA-NAN-ROC-22119',
    name: 'Roca sedimentaria con impresión',
    category: 'ROC',
    status: 'published',
    description:
      'Lámina de roca con huella biótica superficial, útil para contexto estratigráfico comparativo.',
    geological_context: 'Paleozoico superior',
    discovery_date: '2026-01-09',
    created_at: '2026-01-10',
    created_by_username: 'investigador1',
  },
];

const categoryLabels = {
  FOS: 'Fósil',
  MIN: 'Mineral',
  ROC: 'Roca',
  PAL: 'Paleontológico',
};

const statusLabels = {
  pending: 'En revisión',
  published: 'Publicado',
  rejected: 'Rechazado',
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return parsed.toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function Catalog() {
  const [allFossils, setAllFossils] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await fossilService.getAll();
        const records = Array.isArray(response?.data) ? response.data : [];
        const source = records.length > 0 ? records : demoFossils;

        if (isMounted) {
          setAllFossils(source);
          setSelectedId(source[0]?.id ?? null);
          if (records.length === 0) {
            setErrorMessage('No hay fósiles registrados todavía. Se muestran ejemplos visuales.');
          }
        }
      } catch {
        if (isMounted) {
          setAllFossils(demoFossils);
          setSelectedId(demoFossils[0]?.id ?? null);
          setErrorMessage('No se logró conectar al backend. Se cargó un catálogo de demostración.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFossils = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const base = allFossils.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name?.toLowerCase().includes(normalizedQuery) ||
        item.unique_code?.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery);

      const matchesCategory = category === 'all' || item.category === category;
      const matchesStatus = status === 'all' || item.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    const sorted = [...base];
    if (sortBy === 'name') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'));
      return sorted;
    }

    sorted.sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return bDate - aDate;
    });
    return sorted;
  }, [allFossils, category, query, sortBy, status]);

  const selectedFossil = useMemo(
    () => filteredFossils.find((item) => item.id === selectedId) || filteredFossils[0] || null,
    [filteredFossils, selectedId]
  );

  const stats = useMemo(() => {
    const total = filteredFossils.length;
    const published = filteredFossils.filter((item) => item.status === 'published').length;
    const pending = filteredFossils.filter((item) => item.status === 'pending').length;
    const categories = new Set(filteredFossils.map((item) => item.category)).size;
    return { total, published, pending, categories };
  }, [filteredFossils]);

  return (
    <main className="catalog-shell">
      <nav className="catalog-top-nav" aria-label="Acceso y navegación">
        <Link className="catalog-nav-link" to="/">
          Inicio
        </Link>
        <Link className="catalog-nav-link" to="/login">
          Iniciar sesión
        </Link>
        <Link className="catalog-nav-link accent" to="/register">
          Registrarse
        </Link>
      </nav>

      <header className="catalog-hero">
        <p className="catalog-kicker">Archivo Paleontológico</p>
        <h1>Catálogo Público de Hallazgos</h1>
        <p className="catalog-subtitle">
          Interfaz diseñada para explorar piezas fósiles de forma clara, visual y accesible.
        </p>
        <div className="catalog-hero-actions">
          <Link className="catalog-btn solid" to="/">
            Volver al inicio
          </Link>
          <Link className="catalog-btn ghost" to="/register">
            Crear cuenta
          </Link>
        </div>
      </header>

      <section className="catalog-toolbar" aria-label="Filtros de catálogo">
        <label>
          Buscar
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, código o descripción"
          />
        </label>

        <label>
          Categoría
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estado
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Orden
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </label>
      </section>

      <section className="catalog-stats" aria-label="Resumen de resultados">
        <article>
          <p>Total</p>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <p>Publicados</p>
          <strong>{stats.published}</strong>
        </article>
        <article>
          <p>En revisión</p>
          <strong>{stats.pending}</strong>
        </article>
        <article>
          <p>Categorías</p>
          <strong>{stats.categories}</strong>
        </article>
      </section>

      {errorMessage && <p className="catalog-notice">{errorMessage}</p>}

      {isLoading ? (
        <section className="catalog-loading">
          <div />
          <div />
          <div />
        </section>
      ) : (
        <section className="catalog-grid">
          <div className="catalog-list" role="list" aria-label="Resultados del catálogo">
            {filteredFossils.length === 0 && (
              <article className="catalog-empty">
                <h2>No hay coincidencias</h2>
                <p>Ajusta tus filtros para encontrar registros disponibles.</p>
              </article>
            )}

            {filteredFossils.map((item) => (
              <article
                key={item.id}
                className={item.id === selectedFossil?.id ? 'fossil-card active' : 'fossil-card'}
                role="listitem"
                tabIndex={0}
                onClick={() => setSelectedId(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedId(item.id);
                  }
                }}
              >
                <p className="fossil-card-code">{item.unique_code || 'Código pendiente'}</p>
                <h2>{item.name || 'Sin nombre'}</h2>
                <p className="fossil-card-description">
                  {item.description || 'Sin descripción disponible en este registro.'}
                </p>
                <div className="fossil-card-meta">
                  <span>{categoryLabels[item.category] || item.category || 'Sin categoría'}</span>
                  <span>{statusLabels[item.status] || item.status || 'Sin estado'}</span>
                </div>
              </article>
            ))}
          </div>

          <aside className="catalog-detail" aria-live="polite">
            {selectedFossil ? (
              <>
                <p className="detail-code">{selectedFossil.unique_code || 'Sin código'}</p>
                <h2>{selectedFossil.name || 'Sin nombre'}</h2>
                <p className="detail-description">
                  {selectedFossil.description || 'Sin descripción para este registro.'}
                </p>
                <dl>
                  <div>
                    <dt>Tipo</dt>
                    <dd>
                      {categoryLabels[selectedFossil.category] ||
                        selectedFossil.category ||
                        'No definido'}
                    </dd>
                  </div>
                  <div>
                    <dt>Estado</dt>
                    <dd>
                      {statusLabels[selectedFossil.status] || selectedFossil.status || 'No definido'}
                    </dd>
                  </div>
                  <div>
                    <dt>Fecha de descubrimiento</dt>
                    <dd>{formatDate(selectedFossil.discovery_date)}</dd>
                  </div>
                  <div>
                    <dt>Contexto geológico</dt>
                    <dd>{selectedFossil.geological_context || 'Sin contexto registrado'}</dd>
                  </div>
                  <div>
                    <dt>Creado por</dt>
                    <dd>{selectedFossil.created_by_username || 'No indicado'}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="detail-empty">Selecciona una ficha para visualizar su detalle.</p>
            )}
          </aside>
        </section>
      )}
    </main>
  );
}

export default Catalog;
