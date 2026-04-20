import { describe, it, expect } from 'vitest';
import { clientPaginate } from './pagination.js';

describe('clientPaginate', () => {
  const items = [1, 2, 3, 4, 5];

  it('returns first page slice', () => {
    const r = clientPaginate(items, { page: 1, pageSize: 2 });
    expect(r.slice).toEqual([1, 2]);
    expect(r.totalPages).toBe(3);
    expect(r.page).toBe(1);
  });

  it('clamps page to valid range', () => {
    const r = clientPaginate(items, { page: 99, pageSize: 2 });
    expect(r.page).toBe(3);
  });
});
