
import { expect, test } from '@playwright/test';

test('supports bilingual intent entry and ambiguity confirmation', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('textbox').fill('把 10 SUI 换成 USDC');
  await page.getByRole('button', { name: '解析意图' }).click();
  await expect(page.getByRole('button', { name: '获取报价' })).toBeVisible();

  await page.getByRole('button', { name: 'English' }).click();
  await page.getByRole('textbox').fill('Swap 10 SUI');
  await page.getByRole('button', { name: 'Parse Intent' }).click();
  await expect(page.getByRole('button', { name: 'Confirm Intent' })).toBeVisible();
});
