import { test, expect } from '@playwright/test';

test('search employee in Employee Master', async ({ page }, testInfo) => {
  const employeeCode = process.env.EMPLOYEE_CODE?.trim() ?? '';
  expect(employeeCode, 'EMPLOYEE_CODE must be set in the environment or .env file').not.toBe('');

  try {
    await page.goto('/reports/dashboard/asn');
    await expect(page.getByText('Overdue list', { exact: true })).toBeVisible();

    await test.step('Open Administration and Employee Master', async () => {
      await page.getByText('Administration', { exact: true }).click();
      await page.getByText('Employee Master', { exact: true }).click();
      await expect(page.getByRole('main').getByRole('heading', { name: 'Employee Master' })).toBeVisible();
    });

    await test.step(`Search for employee ${employeeCode}`, async () => {
      const employeeMaster = page.getByRole('main');
      const employeeSearch = employeeMaster.getByPlaceholder(/emp code,\s*name,\s*email/i);
      await expect(employeeSearch).toBeVisible();
      await employeeSearch.fill(employeeCode);

      const employeeRows = employeeMaster.getByRole('row').filter({ has: page.getByRole('cell') });
      await expect(employeeRows).toHaveCount(1);

      const matchingRow = employeeRows.filter({ hasText: employeeCode });
      await expect(matchingRow).toHaveCount(1);
      await expect(matchingRow.getByText(employeeCode, { exact: true })).toBeVisible();
    });
  } catch (error) {
    await page.screenshot({ path: testInfo.outputPath('employee-master-search-failure.png'), fullPage: true });
    throw error;
  }
});