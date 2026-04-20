/**
 * @template T
 * @param {T[]} items
 * @param {{ page: number; pageSize: number }} opts
 * @returns {{ slice: T[]; page: number; pageSize: number; total: number; totalPages: number }}
 */
export function clientPaginate(items, { page, pageSize }) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { slice, page: safePage, pageSize, total, totalPages };
}
