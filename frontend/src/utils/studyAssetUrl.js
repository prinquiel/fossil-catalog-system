/** URL absoluta para archivos bajo uploads/ (imágenes de estudio, etc.). */
export function studyAssetUrl(filePath) {
  if (!filePath) return '';
  let root = import.meta.env.VITE_API_URL?.trim() || '';
  root = root.replace(/\/$/, '').replace(/\/api$/, '');
  if (!root) root = 'http://localhost:5001';
  return `${root}/uploads/${filePath}`;
}
