import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const authFile = path.resolve(__dirname, '../playwright/.auth/user.json');

test('authenticate and save browser state', async ({ page }) => {
  const username = process.env.WOORY_USERNAME ?? '';
  const password = process.env.WOORY_PASSWORD ?? '';

  expect(username, 'WOORY_USERNAME must be set in the environment or .env file').not.toBe('');
  expect(password, 'WOORY_PASSWORD must be set in the environment or .env file').not.toBe('');

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

  await page.getByRole('textbox', { name: /Enter your username or email/i }).fill(username);
  await page.getByRole('textbox', { name: /Enter your password/i }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/reports\/dashboard\/asn(?:[/?#]|$)/);
  await expect(page.getByText('Overdue list', { exact: true })).toBeVisible();

  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});