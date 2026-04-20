import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import './Landing.css';

const faqItems = [
  {
    id: 'faq-1',
    question: '¿Quién puede registrar hallazgos?',
    answer:
      'Los usuarios con rol de explorador documentan nuevos ejemplares desde su espacio de trabajo. Cada envío pasa por revisión editorial antes de publicarse en el catálogo abierto.',
  },
  {
    id: 'faq-2',
    question: '¿En qué se diferencia el investigador del explorador?',
    answer:
      'El explorador se enfoca en el registro de campo y evidencias. El investigador vincula estudios científicos a fósiles ya publicados y consulta el mapa y el archivo con herramientas de trabajo.',
  },
  {
    id: 'faq-3',
    question: '¿Puedo ver el archivo sin crear una cuenta?',
    answer:
      'Sí. El catálogo público, el mapa y el índice de estudios publicados están disponibles para todos. Algunos metadatos reservados solo se muestran a cuentas con rol autorizado.',
  },
  {
    id: 'faq-4',
    question: '¿Cómo se garantiza la calidad del contenido?',
    answer:
      'Un equipo administrador cura registros pendientes, estudios científicos y cuentas de usuario. Así se mantiene trazabilidad y coherencia del archivo institucional.',
  },
];

const eraStories = [
  {
    id: 'hadeano-arcaico',
    title: 'Hadeano y Arcaico',
    years: '~4600M – 2500M años',
    text: 'Etapa de enfriamiento inicial del planeta y surgimiento de las primeras señales de vida microbiana. El registro fósil es escaso, pero clave para estudiar el origen de ecosistemas primitivos.',
  },
  {
    id: 'proterozoico',
    title: 'Proterozoico',
    years: '2500M – 541M años',
    text: 'Se consolidan oxígeno atmosférico y ambientes marinos complejos; aparecen organismos multicelulares tempranos. Es una base esencial para entender la transición hacia fauna visible del Paleozoico.',
  },
  {
    id: 'paleozoico',
    title: 'Paleozoico',
    years: '541M – 252M años',
    text: 'Grandes radiaciones marinas, expansión de vertebrados y colonización terrestre por plantas y anfibios. Este intervalo documenta cambios evolutivos profundos y varias crisis bióticas.',
  },
  {
    id: 'triasico',
    title: 'Triásico',
    years: '252M – 201M años',
    text: 'Fase de recuperación posterior a la gran extinción del Pérmico. Se diversifican reptiles y aparecen linajes tempranos de dinosaurios y mamíferos, con yacimientos muy valiosos para filogenia.',
  },
  {
    id: 'jurasico',
    title: 'Jurásico',
    years: '201M – 145M años',
    text: 'Expansión de dinosaurios de gran tamaño, ecosistemas costeros muy productivos y fauna marina diversa. Intervalo crucial para correlaciones estratigráficas en depósitos continentales.',
  },
  {
    id: 'cretacico',
    title: 'Cretácico',
    years: '145M – 66M años',
    text: 'Alta diversidad de dinosaurios, aves tempranas y reptiles marinos; se expanden plantas con flor. Cierra con un evento de extinción masiva que redefine la biota global.',
  },
  {
    id: 'cenozoico',
    title: 'Cenozoico',
    years: '66M años – actualidad',
    text: 'Tras la extinción masiva del límite Cretácico-Paleógeno, mamíferos y aves modernas diversificaron los ecosistemas actuales. Los sedimentos cuaternarios enterraron restos de megafauna y ambientes recientes —útiles para correlacionar cambio climático con el registro fósil.',
  },
];

function Landing() {
  const [selectedEra, setSelectedEra] = useState(eraStories[0].id);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [faqOpenId, setFaqOpenId] = useState(null);
  const chipsRef = useRef(null);
  const scrollFrameRef = useRef(0);
  const scrollEndTimerRef = useRef(0);

  const activeEra = useMemo(
    () => eraStories.find((era) => era.id === selectedEra) || eraStories[0],
    [selectedEra]
  );

  const activeIndex = useMemo(
    () => Math.max(0, eraStories.findIndex((era) => era.id === selectedEra)),
    [selectedEra]
  );

  const getCenteredProgress = (container) => {
    const cards = Array.from(container.querySelectorAll('[data-era]'));
    if (cards.length < 2) {
      const max = Math.max(0, container.scrollWidth - container.clientWidth);
      if (max <= 0) return 0;
      return Math.min(1, Math.max(0, container.scrollLeft / max));
    }
    const firstCenter = cards[0].offsetLeft + cards[0].clientWidth / 2;
    const lastCenter = cards[cards.length - 1].offsetLeft + cards[cards.length - 1].clientWidth / 2;
    const centerRange = Math.max(1, lastCenter - firstCenter);
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    return Math.min(1, Math.max(0, (containerCenter - firstCenter) / centerRange));
  };

  const updateScrollProgress = () => {
    const container = chipsRef.current;
    if (!container) return;
    const nextProgress = getCenteredProgress(container);
    setScrollProgress((prev) => (Math.abs(prev - nextProgress) < 0.001 ? prev : nextProgress));
  };

  const scrollToEra = (eraId, behavior = 'smooth') => {
    const container = chipsRef.current;
    if (!container) return;
    const node = container.querySelector(`[data-era="${eraId}"]`);
    if (!node) return;
    const targetLeft = node.offsetLeft - (container.clientWidth - node.clientWidth) / 2;
    const max = Math.max(0, container.scrollWidth - container.clientWidth);
    const clampedTarget = Math.min(max, Math.max(0, targetLeft));
    container.scrollTo({ left: clampedTarget, behavior });
  };

  const selectEra = (eraId, options = {}) => {
    if (eraId === selectedEra && options.scroll === false) return;
    setSelectedEra(eraId);
    if (options.scroll !== false) scrollToEra(eraId, options.behavior || 'smooth');
  };

  const prevEra = () => {
    const nextId = eraStories[Math.max(0, activeIndex - 1)].id;
    selectEra(nextId, { scroll: true });
  };
  const nextEra = () => {
    const nextId = eraStories[Math.min(eraStories.length - 1, activeIndex + 1)].id;
    selectEra(nextId, { scroll: true });
  };

  const onTimelineWheel = (event) => {
    const container = chipsRef.current;
    if (!container) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      const maxDelta = 56;
      const safeDelta = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), maxDelta);
      container.scrollBy({ left: safeDelta, behavior: 'auto' });
    }
  };

  const onTimelineScroll = () => {
    if (!chipsRef.current) return;
    if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = requestAnimationFrame(() => {
      updateScrollProgress();
    });
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      const container = chipsRef.current;
      if (!container) return;
      const cards = Array.from(container.querySelectorAll('[data-era]'));
      if (!cards.length) return;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;
      let closestEra = null;
      let minDistance = Number.POSITIVE_INFINITY;
      for (const card of cards) {
        const left = card.offsetLeft;
        const center = left + card.clientWidth / 2;
        const distance = Math.abs(center - containerCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestEra = card.getAttribute('data-era');
        }
      }
      if (closestEra) {
        setSelectedEra((current) => (current === closestEra ? current : closestEra));
      }
    }, 140);
  };

  const onScrollBarClick = (event) => {
    const container = chipsRef.current;
    if (!container) return;
    const track = event.currentTarget;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const cards = Array.from(container.querySelectorAll('[data-era]'));
    if (cards.length >= 2) {
      const firstCenter = cards[0].offsetLeft + cards[0].clientWidth / 2;
      const lastCenter = cards[cards.length - 1].offsetLeft + cards[cards.length - 1].clientWidth / 2;
      const targetCenter = firstCenter + ratio * (lastCenter - firstCenter);
      const max = Math.max(0, container.scrollWidth - container.clientWidth);
      const targetLeft = Math.min(max, Math.max(0, targetCenter - container.clientWidth / 2));
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
      return;
    }
    const max = Math.max(0, container.scrollWidth - container.clientWidth);
    container.scrollTo({ left: ratio * max, behavior: 'smooth' });
  };

  useEffect(() => {
    updateScrollProgress();
    const onResize = () => updateScrollProgress();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, []);

  return (
    <main className="landing-shell">
      <SiteHeader />

      <section className="landing-hero">
        <div className="landing-hero-visual" aria-hidden="true">
          <svg className="landing-hero-svg" viewBox="0 0 900 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="landing-strata-a" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(139,21,50,0.35)" />
                <stop offset="50%" stopColor="rgba(180,140,90,0.25)" />
                <stop offset="100%" stopColor="rgba(91,76,58,0.3)" />
              </linearGradient>
            </defs>
            <path
              d="M0,95 Q200,70 400,88 T800,82 L900,90 L900,120 L0,120 Z"
              fill="url(#landing-strata-a)"
              opacity="0.45"
            />
            <path
              d="M0,72 Q220,48 440,62 T880,55 L900,62 L900,120 L0,120 Z"
              fill="rgba(244,239,230,0.85)"
              opacity="0.9"
            />
            <path
              d="M0,52 Q180,38 360,48 T720,40 L900,48 L900,120 L0,120 Z"
              fill="rgba(255,252,247,0.55)"
            />
          </svg>
        </div>
        <p className="edition-line">
          <span>Edición paleontológica</span>
          <span>Vol. I — 2026</span>
        </p>
        <h1>Fossil Catalog System</h1>
        <p className="hero-dek">
          Archivo curado de hallazgos para exploración y ciencia colaborativa con trazabilidad editorial.
        </p>
        <ul className="landing-hero-tags" aria-label="Capacidades del sistema">
          <li>Georreferencia y medios</li>
          <li>Geología y taxonomía</li>
          <li>Estudios vinculados al ejemplar</li>
        </ul>
      </section>

      <section className="landing-explore landing-reveal" aria-labelledby="landing-explore-title">
        <div className="landing-section-head">
          <h2 id="landing-explore-title">Explorar el archivo</h2>
          <p className="landing-section-lead">Accesos directos al contenido publicado. Sin cuenta para consultar.</p>
        </div>
        <div className="landing-explore__grid">
          <Link to="/catalog" className="landing-explore-card">
            <span className="landing-explore-card__icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="4" y="5" width="10" height="10" rx="2" />
                <rect x="18" y="5" width="10" height="10" rx="2" />
                <rect x="4" y="19" width="10" height="10" rx="2" />
                <rect x="18" y="19" width="10" height="10" rx="2" />
              </svg>
            </span>
            <span className="landing-explore-card__title">Catálogo de hallazgos</span>
            <span className="landing-explore-card__desc">Fichas publicadas, filtros y galería por ejemplar.</span>
            <span className="landing-explore-card__cta">Abrir catálogo →</span>
          </Link>
          <Link to="/catalog/estudios" className="landing-explore-card">
            <span className="landing-explore-card__icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 6h14l6 6v16a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                <path d="M22 6v6h6M11 17h10M11 21h8" />
              </svg>
            </span>
            <span className="landing-explore-card__title">Estudios científicos</span>
            <span className="landing-explore-card__desc">Trabajos aprobados ligados a cada fósil publicado.</span>
            <span className="landing-explore-card__cta">Ver estudios →</span>
          </Link>
          <Link to="/map" className="landing-explore-card">
            <span className="landing-explore-card__icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="16" cy="11" r="3.5" />
                <path d="M9 26c2-6 5-9 7-9s5 3 7 9" />
                <path d="M4 10l2-4h20l2 4v14H4V10z" opacity="0.35" />
              </svg>
            </span>
            <span className="landing-explore-card__title">Mapa geográfico</span>
            <span className="landing-explore-card__desc">Distribución de hallazgos con coordenadas públicas.</span>
            <span className="landing-explore-card__cta">Abrir mapa →</span>
          </Link>
          <Link to="/register" className="landing-explore-card landing-explore-card--accent">
            <span className="landing-explore-card__icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M16 9v14M9 16h14" />
                <circle cx="16" cy="16" r="11" />
              </svg>
            </span>
            <span className="landing-explore-card__title">Crear cuenta</span>
            <span className="landing-explore-card__desc">Solicita acceso como explorador, investigador o ambos.</span>
            <span className="landing-explore-card__cta">Registrarse →</span>
          </Link>
        </div>
      </section>

      <section className="landing-grid landing-reveal">
        <article className="feature-card">
          <div className="feature-card__icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M10 32l8-22 4 12 8-16" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="8" r="2.5" />
            </svg>
          </div>
          <h3>Registro de campo</h3>
          <p>
            Exploradores documentan hallazgos con coordenadas, estado original y contexto geológico en un flujo
            unificado para evitar pérdida de evidencia.
          </p>
        </article>
        <article className="feature-card">
          <div className="feature-card__icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M8 12h24v16H8z" />
              <path d="M12 8h16v8H12z" />
              <path d="M14 22h12M14 26h8" />
            </svg>
          </div>
          <h3>Curación editorial</h3>
          <p>
            El equipo administrador revisa cada ficha antes de publicarla, manteniendo consistencia del archivo y
            trazabilidad institucional del contenido.
          </p>
        </article>
        <article className="feature-card">
          <div className="feature-card__icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="20" cy="14" r="6" />
              <path d="M10 34c0-8 4-12 10-12s10 4 10 12" />
            </svg>
          </div>
          <h3>Investigación científica</h3>
          <p>
            Investigadores consultan el catálogo publicado y vinculan estudios directamente a cada ejemplar, con
            visualización de medios y mapa asociado.
          </p>
        </article>
      </section>

      <section className="landing-faq landing-reveal" aria-labelledby="landing-faq-title">
        <div className="landing-section-head">
          <h2 id="landing-faq-title">Preguntas frecuentes</h2>
          <p className="landing-section-lead">Pulse cada tema para expandir la respuesta.</p>
        </div>
        <div className="landing-faq__list">
          {faqItems.map((item) => {
            const open = faqOpenId === item.id;
            return (
              <div key={item.id} className={`landing-faq__item${open ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="landing-faq__trigger"
                  aria-expanded={open}
                  id={`${item.id}-btn`}
                  aria-controls={`${item.id}-panel`}
                  onClick={() => setFaqOpenId(open ? null : item.id)}
                >
                  <span>{item.question}</span>
                  <span className="landing-faq__chev" aria-hidden="true">
                    {open ? '−' : '+'}
                  </span>
                </button>
                <div
                  id={`${item.id}-panel`}
                  role="region"
                  aria-labelledby={`${item.id}-btn`}
                  className="landing-faq__panel"
                  hidden={!open}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="timeline-panel landing-reveal">
        <div className="timeline-head">
          <h2>Línea del tiempo</h2>
          <div className="timeline-nav">
            <button type="button" onClick={prevEra} disabled={activeIndex <= 0} aria-label="Era anterior">
              ←
            </button>
            <button
              type="button"
              onClick={nextEra}
              disabled={activeIndex >= eraStories.length - 1}
              aria-label="Era siguiente"
            >
              →
            </button>
          </div>
        </div>
        <p className="timeline-intro">
          Recorre el registro rocoso: elegí una era para leer un resumen pensado como nota de gabinete, no como
          lección enciclopédica. Deslizá horizontalmente o usá la barra inferior.
        </p>
        <div
          ref={chipsRef}
          className="timeline-scroll"
          role="tablist"
          aria-label="Eras geológicas"
          onWheel={onTimelineWheel}
          onScroll={onTimelineScroll}
        >
          {eraStories.map((era) => (
            <button
              key={era.id}
              type="button"
              data-era={era.id}
              className={era.id === selectedEra ? 'timeline-era-chip is-active' : 'timeline-era-chip'}
              onClick={() => selectEra(era.id, { scroll: true })}
            >
              <span className="timeline-era-chip__eyebrow">Era</span>
              <span className="timeline-era-chip__title">{era.title}</span>
              <span className="timeline-era-chip__years">{era.years}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="timeline-progress"
          aria-label="Barra de desplazamiento de eras"
          onClick={onScrollBarClick}
        >
          <span style={{ width: `${scrollProgress * 100}%` }} />
        </button>
        <div className="timeline-content">
          <article className="timeline-detail-card" aria-live="polite">
            <p className="timeline-years">{activeEra.years}</p>
            <p className="timeline-description">{activeEra.text}</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Landing;
