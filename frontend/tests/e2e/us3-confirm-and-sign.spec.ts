
import { expect, test } from '@playwright/test';

test('requires confirmation before wallet handoff', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox').fill('Swap 10 SUI to USDC');
  await page.getByRole('button', { name: 'Parse Intent' }).click();
  await page.getByRole('button', { name: 'Get Quote' }).click();
  await page.getByRole('button', { name: 'Generate Preview' }).click();

  await expect(page.getByRole('button', { name: 'Request Wallet Signature' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Confirm And Unlock Wallet' }).click();
  await expect(page.getByRole('button', { name: 'Request Wallet Signature' })).toBeVisible();
  await page.getByRole('button', { name: 'Request Wallet Signature' }).click();
  await expect(page.getByText(/mock-signature:/)).toBeVisible();
});
