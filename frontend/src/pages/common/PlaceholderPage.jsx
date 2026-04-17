function PlaceholderPage({ title, description, className = '' }) {
  return (
    <section className={`placeholder-page ${className}`.trim()} style={{ textAlign: 'left' }}>
      <h2>{title}</h2>
      <p>{description || 'Seccion base creada. Aqui puedes agregar la implementacion final.'}</p>
    </section>
  );
}

export default PlaceholderPage;
