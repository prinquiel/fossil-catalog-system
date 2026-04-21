import { useState } from 'react';
import toast from 'react-hot-toast';
import SiteHeader from '../../components/layout/SiteHeader.jsx';
import { contactService } from '../../services/contactService.js';
import { getApiErrorMessage } from '../../utils/apiError.js';
import './public-info-pages.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTITUTIONAL_EMAIL = 'fosiles@unadeca.net';

export default function PublicContact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error('Complete nombre, asunto y mensaje.');
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      toast.error('Ingrese un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await contactService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      if (res?.success) {
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        toast.success('Mensaje enviado al equipo del museo digital.');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="public-page-shell public-contact-page">
      <SiteHeader />

      <article className="public-contact-board" aria-labelledby="contact-main-heading">
        <header className="public-contact-board__head">
          <p className="public-contact-board__eyebrow">Canal institucional</p>
          <h1 id="contact-main-heading" className="public-contact-board__title">
            Contáctanos
          </h1>
          <p className="public-contact-board__deck">
            Coordinación editorial, colaboración científica y consultas sobre el archivo digital de hallazgos.
          </p>
        </header>

        <div className="public-contact-board__body">
          <aside className="public-contact-side" aria-label="Datos de contacto institucional">
            <div className="public-contact-side__block">
              <p className="public-contact-side__label">Correo de referencia</p>
              <a className="public-contact-side__email" href={`mailto:${INSTITUTIONAL_EMAIL}`}>
                {INSTITUTIONAL_EMAIL}
              </a>
              <p className="public-contact-side__hint">
                Use un asunto claro para agilizar la derivación al equipo correspondiente.
              </p>
            </div>
            <ul className="public-contact-side__list">
              <li>Respuesta orientativa en días hábiles.</li>
              <li>Información sensible tratada según políticas del archivo.</li>
              <li>No comparta credenciales ni datos personales de terceros sin consentimiento.</li>
            </ul>
          </aside>

          <div className="public-contact-form-panel">
            {sent ? (
              <div className="public-contact-success" role="status">
                <strong>Mensaje recibido</strong>
                <p>
                  El equipo revisará su solicitud y responderá al correo indicado en el formulario cuando corresponda.
                </p>
              </div>
            ) : null}

            <form className="public-form public-contact-form" onSubmit={handleSubmit}>
              <div className="public-contact-form__row">
                <label className="public-contact-field">
                  <span className="public-contact-field__label">Nombre completo</span>
                  <input
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Nombre y apellidos"
                    autoComplete="name"
                  />
                </label>
                <label className="public-contact-field">
                  <span className="public-contact-field__label">Correo electrónico</span>
                  <input
                    value={form.email}
                    onChange={set('email')}
                    type="email"
                    placeholder="correo@institución.org"
                    autoComplete="email"
                  />
                </label>
              </div>
              <label className="public-contact-field">
                <span className="public-contact-field__label">Asunto</span>
                <input
                  value={form.subject}
                  onChange={set('subject')}
                  placeholder="Asunto"
                />
              </label>
              <label className="public-contact-field">
                <span className="public-contact-field__label">Mensaje</span>
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  rows={6}
                  placeholder="Describa el motivo de la consulta, contexto y, si aplica, referencia al registro o estudio."
                />
              </label>
              <div className="public-contact-form__actions">
                <button type="submit" className="public-btn public-btn--contact-primary" disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </article>
    </main>
  );
}
