import { test, expect } from '@playwright/test';

test.describe('Accessibility Requirements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://www.w3.org/WAI/demos/bad/after/home.html");
  });

  // Test cases for Rule 3: Form labels
  test('form input must have an associated label or aria-label/aria-labelledby', async ({ page }) => {
    // Locate the select element. This specific select element is currently missing an accessible name.
    const selectElement = page.locator('select');

    // Expect the select element to have an accessible name.
    // This test will fail in the current state, indicating a violation.
    // The regex /.+/ ensures that the accessible name is not empty.
    await expect(selectElement).toHaveAccessibleName(/.+/);
  });

});

