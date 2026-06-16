
import { expect, test } from '@playwright/test';

test('renders preview details after quote generation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox').fill('Swap 10 SUI to USDC');
  await page.getByRole('button', { name: 'Parse Intent' }).click();
  await page.getByRole('button', { name: 'Get Quote' }).click();
  await page.getByRole('button', { name: 'Generate Preview' }).click();

  await expect(page.getByText('Preview')).toBeVisible();
  await expect(page.getByText(/Expected output:/)).toBeVisible();
  await expect(page.getByText(/Minimum output:/)).toBeVisible();
});
