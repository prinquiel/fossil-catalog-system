/**
 * @param {unknown} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = /** @type {{ response?: { data?: { error?: string; hint?: string } } }} */ (error).response;
    const msg = res?.data?.error;
    const hint = res?.data?.hint;
    if (typeof msg === 'string' && msg.trim()) {
      if (typeof hint === 'string' && hint.trim()) return `${msg} ${hint}`;
      return msg;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error inesperado.';
}
