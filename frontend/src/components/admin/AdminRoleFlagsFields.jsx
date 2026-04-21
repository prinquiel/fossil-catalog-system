/**
 * Perfil: casillas Explorador / Investigador (pueden ir juntas) y Administrador excluyente.
 * Si hay al menos uno de los dos primeros, administrador no seleccionable.
 */
export default function AdminRoleFlagsFields({ flags, setFlags, disabled }) {
  const adminLocked = Boolean(flags.explorer || flags.researcher);

  const cardStyle = (active) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(61, 52, 40, 0.14)',
    background: active ? 'rgba(139, 21, 50, 0.06)' : 'rgba(255, 255, 255, 0.5)',
    opacity: disabled ? 0.65 : 1,
  });

  return (
    <div className="admin-page-desc" style={{ margin: 0 }}>
      <span style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>Perfil</span>

      <div style={{ display: 'grid', gap: 10 }}>
        <label style={cardStyle(flags.explorer)}>
          <input
            type="checkbox"
            checked={flags.explorer}
            disabled={disabled || flags.admin}
            onChange={(e) => {
              const checked = e.target.checked;
              setFlags((prev) => {
                if (checked) return { ...prev, explorer: true, admin: false };
                return { ...prev, explorer: false };
              });
            }}
            style={{ marginTop: 3 }}
          />
          <span>
            <span style={{ fontWeight: 700, display: 'block' }}>Explorador</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--ink-muted, #6a6154)' }}>
              Registro de hallazgos en campo
            </span>
          </span>
        </label>

        <label style={cardStyle(flags.researcher)}>
          <input
            type="checkbox"
            checked={flags.researcher}
            disabled={disabled || flags.admin}
            onChange={(e) => {
              const checked = e.target.checked;
              setFlags((prev) => {
                if (checked) return { ...prev, researcher: true, admin: false };
                return { ...prev, researcher: false };
              });
            }}
            style={{ marginTop: 3 }}
          />
          <span>
            <span style={{ fontWeight: 700, display: 'block' }}>Investigador</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--ink-muted, #6a6154)' }}>
              Catálogo de trabajo y estudios
            </span>
          </span>
        </label>

        <label
          style={{
            ...cardStyle(flags.admin),
            opacity: disabled ? 0.65 : adminLocked ? 0.55 : 1,
            cursor: disabled || adminLocked ? 'not-allowed' : 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={flags.admin}
            disabled={disabled || adminLocked}
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                setFlags({ explorer: false, researcher: false, admin: true });
              } else {
                setFlags((prev) => ({ ...prev, admin: false }));
              }
            }}
            style={{ marginTop: 3 }}
          />
          <span>
            <span style={{ fontWeight: 700, display: 'block' }}>Administrador</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--ink-muted, #6a6154)' }}>
              Curación, usuarios y aprobaciones
              {adminLocked && !disabled ? (
                <span style={{ display: 'block', marginTop: 4, fontStyle: 'italic' }}>
                  Desmarque explorador e investigador para habilitar esta opción.
                </span>
              ) : null}
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
