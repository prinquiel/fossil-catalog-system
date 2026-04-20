import { describe, it, expect } from 'vitest';
import { workspaceHomePath } from './workspace.js';

describe('workspaceHomePath', () => {
  it('returns null without user', () => {
    expect(workspaceHomePath(null)).toBeNull();
  });

  it('prefers admin when present', () => {
    expect(workspaceHomePath({ roles: ['explorer', 'admin'] })).toBe('/admin/dashboard');
  });

  it('uses researcher before explorer', () => {
    expect(workspaceHomePath({ roles: ['explorer', 'researcher'] })).toBe('/researcher/dashboard');
  });

  it('falls back to explorer', () => {
    expect(workspaceHomePath({ roles: ['explorer'] })).toBe('/explorer/dashboard');
  });

  it('supports legacy single role field', () => {
    expect(workspaceHomePath({ role: 'admin' })).toBe('/admin/dashboard');
  });
});
