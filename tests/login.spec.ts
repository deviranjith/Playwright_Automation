import { test, expect } from '@playwright/test';

test('saved authenticated session opens the dashboard', async ({ page }, testInfo) => {
  try {
    await page.goto('/reports/dashboard/asn');
    await expect(page).toHaveURL(/\/reports\/dashboard\/asn(?:[/?#]|$)/);
    await expect(page.getByText('Overdue list', { exact: true })).toBeVisible();
  } catch (error) {
    await page.screenshot({ path: testInfo.outputPath('authenticated-session-failure.png'), fullPage: true });
    throw error;
  }
});
