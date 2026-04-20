let pending = 0;
const listeners = new Set();

export function subscribeApiActivity(listener) {
  listeners.add(listener);
  listener(pending);
  return () => listeners.delete(listener);
}

export function getApiPending() {
  return pending;
}

export function apiRequestStart() {
  pending += 1;
  listeners.forEach((l) => l(pending));
}

export function apiRequestEnd() {
  pending = Math.max(0, pending - 1);
  listeners.forEach((l) => l(pending));
}
