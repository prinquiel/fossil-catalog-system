/**
 * Ubicación del estudio: solo una modalidad — texto breve (dirección) o coordenadas WGS84.
 */
export function StudyLocationFields({
  mode,
  onModeChange,
  siteText,
  onSiteTextChange,
  siteLat,
  onSiteLatChange,
  siteLng,
  onSiteLngChange,
  idPrefix = 'st',
}) {
  const base = idPrefix;
  return (
    <fieldset className="study-location-fieldset">
      <legend className="study-location-fieldset__legend">Ubicación del estudio o trabajo de campo</legend>
      <p className="study-location-fieldset__hint">
        Elija <strong>una</strong> opción: una dirección corta (calle, barrio, país) o un par de coordenadas; no ambas.
      </p>
      <div className="study-location-fieldset__modes" role="radiogroup" aria-label="Tipo de ubicación">
        <label className="study-location-fieldset__radio">
          <input
            type="radio"
            name={`${base}-site-mode`}
            checked={mode === 'text'}
            onChange={() => onModeChange('text')}
          />
          Dirección breve
        </label>
        <label className="study-location-fieldset__radio">
          <input
            type="radio"
            name={`${base}-site-mode`}
            checked={mode === 'coords'}
            onChange={() => onModeChange('coords')}
          />
          Coordenadas (latitud / longitud)
        </label>
      </div>

      {mode === 'text' ? (
        <div className="study-location-fieldset__field">
          <label htmlFor={`${base}-site-text`}>Dirección o referencia (máx. 280 caracteres)</label>
          <input
            id={`${base}-site-text`}
            type="text"
            maxLength={280}
            value={siteText}
            onChange={(e) => onSiteTextChange(e.target.value)}
            placeholder="Ej. Calle Ejemplo, Barrio Ejemplo, País Ejemplo"
            autoComplete="street-address"
          />
        </div>
      ) : (
        <div className="workspace-form__row study-location-fieldset__coords">
          <div>
            <label htmlFor={`${base}-site-lat`}>Latitud (°)</label>
            <input
              id={`${base}-site-lat`}
              type="text"
              inputMode="decimal"
              value={siteLat}
              onChange={(e) => onSiteLatChange(e.target.value)}
              placeholder="Ej. 9.934739"
            />
          </div>
          <div>
            <label htmlFor={`${base}-site-lng`}>Longitud (°)</label>
            <input
              id={`${base}-site-lng`}
              type="text"
              inputMode="decimal"
              value={siteLng}
              onChange={(e) => onSiteLngChange(e.target.value)}
              placeholder="Ej. -84.087502"
            />
          </div>
        </div>
      )}
    </fieldset>
  );
}
