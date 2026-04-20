import { useMemo, useState } from 'react';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import './Landing.css';

const eraStories = [
  {
    id: 'precambrico',
    title: 'Precámbrico',
    years: '~4600M – 541M años',
    text: 'Constituye la mayor parte de la historia de la Tierra: corteza que se estabiliza, mares primitivos y las primeras huellas químicas de vida. Los fósiles son raros y sutiles —estromatolitos, microfósiles— pero son la ventana más antigua al planeta vivo.',
  },
  {
    id: 'paleozoico',
    title: 'Paleozoico',
    years: '541M – 252M años',
    text: 'Mares poco profundos y arrecifes de organismos con concha dominaron buena parte del registro. Surgieron los primeros vertebrados, bosques que oxigenaron continentes y anfibios que colonizaron la orilla. Es una era clave para entender radiaciones y extinciones tempranas.',
  },
  {
    id: 'mesozoico',
    title: 'Mesozoico',
    years: '252M – 66M años',
    text: 'La «edad media» de los vertebrados terrestres y marinos: dinosaurios, pterosaurios, cocodrilomorfos y reptiles oceánicos. También aparecen las primeras aves y mamíferos cretácicos pequeños. Los yacimientos de este intervalo suelen conservar esqueletos articulados excepcionales.',
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

  const activeEra = useMemo(
    () => eraStories.find((era) => era.id === selectedEra) || eraStories[0],
    [selectedEra]
  );

  return (
    <main className="landing-shell">
      <SiteHeader />

      <section className="landing-hero">
        <p className="edition-line">
          <span>Edicion Paleontologica</span>
          <span>Vol. I - 2026</span>
        </p>
        <h1>Fossil Catalog System</h1>
        <p className="hero-dek">Archivo curado de hallazgos para exploracion y ciencia colaborativa.</p>
      </section>

      <section className="landing-grid">
        <article className="feature-card">
          <p>
            Curación institucional: cada hallazgo conserva taxonomía provisional, estado editorial (borrador,
            revisión, publicado) y trazabilidad de quién registró y quién autorizó la ficha pública.
          </p>
        </article>
        <article className="feature-card">
          <p>
            Georreferencia y estratigrafía en un solo flujo: coordenadas, descripción de facies y notas de
            campo enlazadas al registro, pensado para equipos que trabajan lejos del laboratorio.
          </p>
        </article>
        <article className="feature-card">
          <p>
            Un mismo archivo para quienes documentan en terreno, quienes revisan literatura científica y
            quienes administran accesos —sin duplicar hojas de cálculo ni perder el hilo de las versiones.
          </p>
        </article>
      </section>

      <section className="timeline-panel">
        <h2>Linea del tiempo</h2>
        <p className="timeline-intro">
          Cuatro capítulos del registro rocoso. Elegí una era para leer un resumen pensado como nota de
          gabinete, no como lección enciclopédica.
        </p>
        <div className="timeline-selector">
          {eraStories.map((era, index) => (
            <button
              key={era.id}
              type="button"
              className={`${era.id === selectedEra ? 'timeline-era active' : 'timeline-era'} era-${era.id} ${
                index % 2 === 1 ? 'timeline-era-up' : 'timeline-era-down'
              }`}
              onClick={() => setSelectedEra(era.id)}
            >
              <span className="timeline-divider" aria-hidden="true" />
              <span className="timeline-era-icon" aria-hidden="true" />
              <span className="timeline-era-label">{era.title}</span>
              <span className="timeline-era-years">{era.years}</span>
            </button>
          ))}
        </div>
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
