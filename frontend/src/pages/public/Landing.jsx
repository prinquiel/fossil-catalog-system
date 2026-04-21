import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
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
  const { isAuthenticated } = useAuth();
  const [selectedEra, setSelectedEra] = useState(eraStories[0].id);
  const [windowStart, setWindowStart] = useState(0);
  const [visibleCardCount, setVisibleCardCount] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 2 : 4
  );
  const [faqOpenId, setFaqOpenId] = useState(null);

  const activeEra = useMemo(
    () => eraStories.find((era) => era.id === selectedEra) || eraStories[0],
    [selectedEra]
  );

  const activeIndex = useMemo(
    () => Math.max(0, eraStories.findIndex((era) => era.id === selectedEra)),
    [selectedEra]
  );

  const scrollProgress = useMemo(() => {
    if (eraStories.length <= 1) return 0;
    return activeIndex / (eraStories.length - 1);
  }, [activeIndex]);

  const selectEra = (eraId) => {
    if (eraId === selectedEra) return;
    setSelectedEra(eraId);
  };

  const prevEra = () => {
    const nextId = eraStories[Math.max(0, activeIndex - 1)].id;
    selectEra(nextId);
  };
  const nextEra = () => {
    const nextId = eraStories[Math.min(eraStories.length - 1, activeIndex + 1)].id;
    selectEra(nextId);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setVisibleCardCount(mq.matches ? 2 : 4);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const maxStart = Math.max(0, eraStories.length - visibleCardCount);
    queueMicrotask(() => {
      if (windowStart > maxStart) {
        setWindowStart(maxStart);
        return;
      }
      if (activeIndex < windowStart) {
        setWindowStart(activeIndex);
        return;
      }
      if (activeIndex >= windowStart + visibleCardCount) {
        setWindowStart(Math.min(activeIndex - visibleCardCount + 1, maxStart));
      }
    });
  }, [activeIndex, windowStart, visibleCardCount]);

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
            <span className="landing-explore-card__title">Catálogo Publico</span>
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
            <span className="landing-explore-card__title">Estudios - Aportes</span>
            <span className="landing-explore-card__desc">Estudios y aportes científicos aprobados de cada fósil publicado.</span>
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
          {!isAuthenticated ? (
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
          ) : (
            <Link to="/profile" className="landing-explore-card landing-explore-card--accent">
              <span className="landing-explore-card__icon" aria-hidden="true">
                <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="16" cy="11" r="4" />
                  <path d="M7 27c0-5 4-8 9-8s9 3 9 8" />
                </svg>
              </span>
              <span className="landing-explore-card__title">Mi perfil</span>
              <span className="landing-explore-card__desc">Revisá tu sesión y entra a tu espacio de trabajo por rol.</span>
              <span className="landing-explore-card__cta">Abrir perfil →</span>
            </Link>
          )}
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
          lección enciclopédica. Podés avanzar con las flechas o seleccionando cada tarjeta.
        </p>
        <div
          className="timeline-scroll"
          role="region"
          aria-label="Eras geológicas"
          style={{
            '--timeline-window-start': windowStart,
            '--timeline-visible-cards': visibleCardCount,
          }}
        >
          <div className="timeline-track" role="tablist" aria-label="Tarjetas de eras">
            {eraStories.map((era) => (
              <button
                key={era.id}
                type="button"
                data-era={era.id}
                className={era.id === selectedEra ? 'timeline-era-chip is-active' : 'timeline-era-chip'}
                onClick={() => selectEra(era.id)}
              >
                <span className="timeline-era-chip__eyebrow">Era</span>
                <span className="timeline-era-chip__title">{era.title}</span>
                <span className="timeline-era-chip__years">{era.years}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled
          className="timeline-progress"
          aria-label="Barra de desplazamiento de eras"
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
    </main>
  );
}

export default Landing;
