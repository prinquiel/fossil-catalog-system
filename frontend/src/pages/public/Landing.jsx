import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const eraStories = [
  {
    id: 'paleozoico',
    title: 'Paleozoico',
    years: '541M - 252M años',
    text: 'Predominaron mares antiguos con una gran diversificacion de invertebrados, aparecieron los primeros peces y luego anfibios, y surgieron bosques primitivos que transformaron la atmosfera terrestre.',
  },
  {
    id: 'mesozoico',
    title: 'Mesozoico',
    years: '252M - 66M años',
    text: 'Conocida como la edad de los reptiles, vio el dominio de dinosaurios en tierra, reptiles marinos en los oceanos y pterosaurios en el cielo, junto al origen de las primeras aves y mamiferos tempranos.',
  },
  {
    id: 'cenozoico',
    title: 'Cenozoico',
    years: '66M años - actual',
    text: 'Tras la extincion masiva del final del Mesozoico, se expandieron los mamiferos y aves modernas, se consolidaron ecosistemas actuales y se desarrollaron los linajes que explican gran parte de la biodiversidad presente.',
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
      <nav className="floating-nav" aria-label="Menu principal">
        <Link to="/catalog" className="nav-pill">
          Catalogo
        </Link>
        <Link to="/register" className="nav-pill">
          Registrarse
        </Link>
        <Link to="/login" className="nav-pill">
          Iniciar sesion
        </Link>
      </nav>

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
            Administra fosiles con fichas completas, estado de revision y metadatos
            cientificos trazables.
          </p>
        </article>
        <article className="feature-card">
          <p>
            Visualiza descubrimientos por coordenadas y contexto geologico para
            acelerar investigacion de campo.
          </p>
        </article>
        <article className="feature-card">
          <p>
            Diseñado para exploradores, investigadores y administradores en un flujo
            integrado.
          </p>
        </article>
      </section>

      <section className="timeline-panel">
        <h2>Linea del tiempo</h2>
        <div className="timeline-selector">
          {eraStories.map((era, index) => (
            <button
              key={era.id}
              type="button"
              className={`${era.id === selectedEra ? 'timeline-era active' : 'timeline-era'} era-${era.id} ${
                index === 1 ? 'timeline-era-up' : 'timeline-era-down'
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
            <p className="timeline-description">{activeEra.text}</p>
          </article>
        </div>
      </section>

    </main>
  );
}

export default Landing;
