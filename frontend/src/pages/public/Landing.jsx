import { useEffect, useMemo, useRef, useState } from 'react';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import './Landing.css';

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
        <p className="edition-line">
          <span>Edicion Paleontologica</span>
          <span>Vol. I - 2026</span>
        </p>
        <h1>Fossil Catalog System</h1>
        <p className="hero-dek">
          Archivo curado de hallazgos para exploración y ciencia colaborativa con trazabilidad editorial.
        </p>
      </section>

      <section className="landing-grid">
        <article className="feature-card">
          <h3>Registro de campo</h3>
          <p>
            Exploradores documentan hallazgos con coordenadas, estado original y contexto geológico en un flujo
            unificado para evitar pérdida de evidencia.
          </p>
        </article>
        <article className="feature-card">
          <h3>Curación editorial</h3>
          <p>
            El equipo administrador revisa cada ficha antes de publicarla, manteniendo consistencia del archivo y
            trazabilidad institucional del contenido.
          </p>
        </article>
        <article className="feature-card">
          <h3>Investigación científica</h3>
          <p>
            Investigadores consultan el catálogo publicado y vinculan estudios directamente a cada ejemplar, con
            visualización de medios y mapa asociado.
          </p>
        </article>
      </section>

      <section className="timeline-panel">
        <div className="timeline-head">
          <h2>Linea del tiempo</h2>
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
          Cuatro capítulos del registro rocoso. Elegí una era para leer un resumen pensado como nota de
          gabinete, no como lección enciclopédica.
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
