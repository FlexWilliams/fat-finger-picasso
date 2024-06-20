import { expect, test } from '@playwright/test';

test('demo page has title', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle('Fat Finger Picasso - Demo');
});

test('demo page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Fat Finger Picasso' })).toBeVisible();
});

test('demo page has expected canvas', async ({ page }) => {
	await page.goto('/');

	// Check by element and id
	await expect(page.locator('canvas')).toHaveCount(1);
	await expect(page.locator('canvas')).toBeVisible();
	await expect(page.getByTestId('fat-finger-picasso')).toBeVisible();
});
