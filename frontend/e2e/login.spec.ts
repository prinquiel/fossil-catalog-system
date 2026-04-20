import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('shows headline and email field', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel(/correo electrónico/i)).toBeVisible();
  });
});

test.describe('Public catalog', () => {
  test('loads catalog heading', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByRole('heading', { name: /catálogo público/i })).toBeVisible();
  });
});
