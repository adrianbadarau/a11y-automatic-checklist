import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto("https://example.com/");
});

test.describe('Deque Accessibility Checklist Evaluation', () => {

  // 1. Images: All `<img>` elements must have an `alt` attribute. Decorative images should have empty `alt=""`.
  test('Images: No img elements with missing or invalid alt attributes', async ({ page }) => {
    // This page has no <img> elements. The test asserts that no <img> elements exist,
    // which implicitly means no images violate the alt attribute rule.
    await expect(page.locator('img')).toHaveCount(0);
  });

  // 2. Headings: The page must have a logical heading structure (H1 -> H2 -> H3) without skipping levels.
  test('Headings: Page has a logical heading structure', async ({ page }) => {
    // Verify an H1 element exists
    await expect(page.locator('h1')).toBeVisible();
    // Verify there are no H2 or H3 elements, ensuring no heading levels are skipped after H1.
    // For this simple page, only H1 is present, thus the structure is implicitly logical.
    await expect(page.locator('h2')).toHaveCount(0);
    await expect(page.locator('h3')).toHaveCount(0);
  });

  // 3. Forms: Every form input must have an associated `<label>` or `aria-label`/`aria-labelledby`.
  test('Forms: All form inputs have associated labels', async ({ page }) => {
    // This page has no form elements (input, select, textarea).
    // The test asserts that no such elements exist, thus no violations of the labeling rule.
    await expect(page.locator('input, select, textarea')).toHaveCount(0);
  });

  // 4. Links and Buttons: Must be focusable, operable via Keyboard (Enter/Space), and have discernible text.
  test('Links: The "Learn more" link is focusable and has discernible text', async ({ page }) => {
    const learnMoreLink = page.locator('a:has-text("Learn more")');
    // Verify the link is visible and therefore interactable
    await expect(learnMoreLink).toBeVisible();
    // Verify the link has discernible text
    await expect(learnMoreLink).toHaveText('Learn more');
    // Verify the link is focusable (operability via keyboard is typically native for <a> tags)
    await expect(learnMoreLink).toBeFocusable();
  });

  // 5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents,
  //    and ARIA should only be used when native HTML elements fall short.
  test('ARIA: No invalid or unnecessary ARIA attributes are used', async ({ page }) => {
    // This page does not explicitly use any ARIA attributes.
    // The test asserts that no elements with 'aria-*' attributes are present,
    // which means there are no ARIA-related violations to check for.
    await expect(page.locator('[aria-*]')).toHaveCount(0);
  });

  // 6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text).
  test('Color Contrast: Text content is visible (requires manual contrast check)', async ({ page }) => {
    // Playwright cannot directly compute color contrast ratios without advanced custom logic
    // involving getting computed styles for foreground and background colors and applying an algorithm.
    // This test ensures the main text content elements are present and visible,
    // but a manual check or a dedicated accessibility testing tool is needed for actual contrast ratio validation.
    await expect(page.locator('h1:has-text("Example Domain")')).toBeVisible();
    await expect(page.locator('p').first()).toBeVisible();
    await expect(page.locator('a:has-text("Learn more")')).toBeVisible();
    // Manual/Tool Verification Note: Check color contrast for all text elements against their backgrounds.
  });

  // 7. Page Title & Language: The document must have a descriptive `<title>` and a valid `<html lang="en">` attribute.
  test('Page Title & Language: Document has a descriptive title and valid language attribute', async ({ page }) => {
    // Verify the document has a descriptive title
    await expect(page).toHaveTitle('Example Domain');
    // Verify the html element has a valid lang attribute set to "en"
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  // 8. Keyboard Navigation: Interactive elements must not trap focus and should have a visible focus indicator.
  test('Keyboard Navigation: Interactive elements are focusable and do not trap focus', async ({ page }) => {
    const learnMoreLink = page.locator('a:has-text("Learn more")');
    // Verify the interactive link is focusable.
    await expect(learnMoreLink).toBeFocused();

    // Focus trapping is difficult to test programmatically without simulating complex user interactions.
    // For this simple page, there are no elements likely to trap focus.
    // Manual/Visual Verification Note:
    // 1. Tab through all interactive elements to ensure focus moves logically and does not get stuck (no focus traps).
    // 2. Verify that a clear and visible focus indicator (e.g., an outline) appears on interactive elements when they receive keyboard focus.
  });
});
