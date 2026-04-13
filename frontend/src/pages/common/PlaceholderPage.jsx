function PlaceholderPage({ title, description }) {
  return (
    <section style={{ textAlign: 'left' }}>
      <h2>{title}</h2>
      <p>{description || 'Seccion base creada. Aqui puedes agregar la implementacion final.'}</p>
    </section>
  );
}

export default PlaceholderPage;
