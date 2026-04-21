import { filterPhoneInput } from '../../utils/studyProfileDefaults.js';

/**
 * Contacto publicable del estudio; suele autocompletarse desde el perfil del usuario.
 */
export function StudyContactFields({
  email,
  name,
  phone,
  institution,
  onEmailChange,
  onNameChange,
  onPhoneChange,
  onInstitutionChange,
  idPrefix = 'st',
}) {
  const p = idPrefix;
  return (
    <div className="study-contact">
      <p className="study-contact__title">Contacto del estudio</p>
      <p className="study-contact__prefill-hint">
        Los datos se rellenan desde su perfil de usuario (correo de la sesión, nombre, teléfono e institución). Puede
        editarlos solo para este estudio.
      </p>
      <p className="study-contact__blank">
        <span className="study-contact__label">Correo electrónico:</span>
        <input
          id={`${p}-contact-email`}
          className="study-contact__input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="correo@institución.ac.cr"
        />
      </p>
      <p className="study-contact__blank">
        <span className="study-contact__label">Nombre:</span>
        <input
          id={`${p}-contact-name`}
          className="study-contact__input"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nombre completo"
        />
      </p>
      <p className="study-contact__blank">
        <span className="study-contact__label">Número celular:</span>
        <input
          id={`${p}-contact-phone`}
          className="study-contact__input"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => onPhoneChange(filterPhoneInput(e.target.value))}
          placeholder="+506 …"
        />
      </p>
      <p className="study-contact__blank">
        <span className="study-contact__label">Institución de trabajo:</span>
        <input
          id={`${p}-contact-institution`}
          className="study-contact__input"
          type="text"
          autoComplete="organization"
          value={institution}
          onChange={(e) => onInstitutionChange(e.target.value)}
          placeholder="Universidad u organización"
        />
      </p>
    </div>
  );
}
