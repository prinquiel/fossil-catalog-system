import '@testing-library/jest-dom/vitest';

const memory = new Map();
const localStorageMock = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => {
    memory.set(key, String(value));
  },
  removeItem: (key) => {
    memory.delete(key);
  },
  clear: () => memory.clear(),
  key: () => null,
  length: 0,
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
/* Misma instancia: el código de auth usa sessionStorage; los tests no deben divergir */
Object.defineProperty(globalThis, 'sessionStorage', { value: localStorageMock, writable: true });
