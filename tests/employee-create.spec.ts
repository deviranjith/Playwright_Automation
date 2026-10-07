import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';

test('create employee in Employee Master', async ({ page }, testInfo) => {
  const employee = {
    code: `EMP-${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`,
    firstName: 'Test Employee',
    mobileNumber: '9876543210',
    gender: 'Female',
  };

  try {
    await page.goto('/reports/dashboard/asn');
    await expect(page.getByText('Overdue list', { exact: true })).toBeVisible();

    await test.step('Navigate to Administration and Employee Master', async () => {
      await page.getByText('Administration', { exact: true }).click();
      await page.getByRole('link', { name: 'Employee Master' }).click();
      await expect(page.getByRole('main').getByRole('heading', { name: 'Employee Master' })).toBeVisible();
    });

    await test.step('Open and complete the New Employee form', async () => {
      const employeeMaster = page.getByRole('main');
      await employeeMaster.getByRole('button', { name: 'Create Employee' }).click();
      await expect(employeeMaster.getByRole('heading', { name: 'New Employee Master' })).toBeVisible();

      await employeeMaster.getByRole('textbox', { name: 'e.g., EMP-001' }).fill(employee.code);
      await employeeMaster.getByRole('textbox', { name: 'First name' }).fill(employee.firstName);
      await employeeMaster.getByRole('textbox', { name: 'e.g. +91 98765 43210' }).fill(employee.mobileNumber);

      await employeeMaster.getByRole('combobox').nth(1).click();
      await page.getByRole('option', { name: employee.gender, exact: true }).click();

      await employeeMaster.getByRole('button', { name: 'Save', exact: true }).click();
    });

    await test.step('Verify the saved employee in Employee Master', async () => {
      await expect(page).toHaveURL(/\/admin\/employee\/employee-master(?:[/?#]|$)/);

      const employeeMaster = page.getByRole('main');
      const employeeSearch = employeeMaster.getByRole('textbox', { name: /emp code,\s*name,\s*email/i });
      await expect(employeeSearch).toBeVisible();
      await employeeSearch.fill(employee.code);

      const createdEmployee = page
        .getByRole('main')
        .getByRole('row')
        .filter({ hasText: employee.code });
      await expect(createdEmployee).toHaveCount(1);
      await expect(createdEmployee).toContainText(employee.code);
      await expect(createdEmployee).toContainText(employee.firstName);
      await expect(createdEmployee).toContainText(employee.mobileNumber);
      await expect(createdEmployee).toContainText(employee.gender);
    });
  } catch (error) {
    await page.screenshot({ path: testInfo.outputPath('employee-create-failure.png'), fullPage: true });
    throw error;
  }
});