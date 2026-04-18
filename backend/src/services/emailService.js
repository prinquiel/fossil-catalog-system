const nodemailer = require('nodemailer');

function isTruthy(v) {
  return v === 'true' || v === '1' || v === 'yes';
}

/**
 * SMTP con usuario/contraseña (Gmail, etc.) o sin auth (Mailpit, MailHog en local).
 * Requiere SMTP_HOST. Sin auth: SMTP_NO_AUTH=true y normalmente SMTP_PORT=1025.
 */
function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const noAuth = isTruthy(process.env.SMTP_NO_AUTH);

  if (noAuth) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
    });
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';
}

function labelForRoles(roles) {
  if (!roles || roles.length === 0) return 'explorador/a';
  const hasE = roles.includes('explorer');
  const hasR = roles.includes('researcher');
  if (hasE && hasR) return 'explorador/a e investigador/a';
  if (hasR) return 'investigador/a';
  return 'explorador/a';
}

/**
 * Envía correo de aceptación de registro. Si SMTP no está configurado, no lanza error.
 * @param {{ to: string, firstName?: string, roles?: string[], role?: string }} params — `roles` preferido; `role` legacy
 * @returns {{ sent: boolean, skipped?: boolean, error?: string }}
 */
async function sendRegistrationApprovedEmail({ to, firstName, roles, role }) {
  const transport = createTransport();
  if (!transport) {
    console.warn(
      '[email] SMTP no configurado: define SMTP_HOST y (SMTP_USER+SMTP_PASS) o SMTP_NO_AUTH=true para Mailpit local; ver backend/.env.example'
    );
    return { sent: false, skipped: true };
  }

  const appName = process.env.APP_NAME || 'Sistema de Catalogación de Fósiles';
  const loginUrl = `${(process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')}/login`;
  const displayName = firstName || 'Usuario';
  const roleList = Array.isArray(roles) && roles.length > 0 ? roles : role ? [role] : ['explorer'];
  const roleLabel = labelForRoles(roleList);

  const subject = `Registro aprobado — ${appName}`;
  const text = `Hola ${displayName},

Tu solicitud de registro como ${roleLabel} ha sido aprobada. Ya puedes iniciar sesión en:
${loginUrl}

Saludos,
${appName}`;

  const html = `<p>Hola ${escapeHtml(displayName)},</p>
<p>Tu solicitud de registro como <strong>${escapeHtml(roleLabel)}</strong> ha sido <strong>aprobada</strong>.</p>
<p><a href="${loginUrl}">Iniciar sesión</a></p>
<p>Saludos,<br/>${escapeHtml(appName)}</p>`;

  try {
    await transport.sendMail({
      from: getFromAddress(),
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('[email] Error al enviar correo de aprobación:', err.message);
    return { sent: false, error: err.message };
  }
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendRegistrationApprovedEmail, createTransport };
