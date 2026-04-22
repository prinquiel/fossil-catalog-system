/**
 * Referencia para ubicación en Costa Rica (provincia + cantón).
 * Los códigos numéricos siguen la división territorial administrativa del INEC.
 * @see https://www.inec.cr/ — sección de geografía / división territorial
 */

/** Provincias: código numérico oficial (1–7) y siglas usadas en el proyecto. */
export const CR_PROVINCE_REFERENCE = [
  { code: '1', letters: 'SJO', name: 'San José' },
  { code: '2', letters: 'ALA', name: 'Alajuela' },
  { code: '3', letters: 'CAR', name: 'Cartago' },
  { code: '4', letters: 'HER', name: 'Heredia' },
  { code: '5', letters: 'GUA', name: 'Guanacaste' },
  { code: '6', letters: 'PUN', name: 'Puntarenas' },
  { code: '7', letters: 'LIM', name: 'Limón' },
];

/** Lista de cantones con códigos (consulta rápida). */
export const CR_CANTONES_REFERENCE_URL = 'https://es.wikipedia.org/wiki/Anexo:Cantones_de_Costa_Rica';

/** Instituto Nacional de Estadística y Censos (autoridad oficial). */
export const CR_INEC_HOME_URL = 'https://www.inec.cr/';
