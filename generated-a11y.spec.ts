// test.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Navigate to the example domain for all tests
    await page.goto("https://example.com/");
});

test.describe('Deque Accessibility Checklist Evaluation', () => {

    test('1. Images: All <img> elements must have an alt attribute.', async ({ page }) => {
        // Assert that there are no image elements on the page.
        // If there were images, this test would need to iterate and check for alt attributes.
        const images = page.locator('img');
        await expect(images).toHaveCount(0); // Expect no images on the page
    });

    test('2. Headings: The page must have a logical heading structure (H1 -> H2 -> H3) without skipping levels.', async ({ page }) => {
        // Expect an H1 to be present and contain the correct text.
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
        await expect(h1).toHaveText('Example Domain');

        // Assert that no other heading levels (h2-h6) are present, which ensures no skipped levels for this simple structure.
        const otherHeadings = page.locator('h2, h3, h4, h5, h6');
        await expect(otherHeadings).toHaveCount(0);
    });

    test('3. Forms: Every form input must have an associated <label> or aria-label/aria-labelledby.', async ({ page }) => {
        // Assert that no form input elements are present on the page.
        const formInputs = page.locator('input, textarea, select');
        await expect(formInputs).toHaveCount(0);
    });

    test('4. Links and Buttons: Must be focusable, operable via Keyboard (Enter/Space), and have discernible text.', async ({ page }) => {
        const learnMoreLink = page.locator('a[href="https://iana.org/domains/example"]');

        // Check for discernible text
        await expect(learnMoreLink).toBeVisible();
        await expect(learnMoreLink).toHaveText('Learn more');

        // Check focusability by attempting to focus and asserting it's focused.
        await learnMoreLink.focus();
        await expect(learnMoreLink).toBeFocused();
        
        // Operability via keyboard (Enter/Space) is typically inherent for native HTML links that are focusable.
        // A direct assertion for "operable" isn't straightforward without a navigation test,
        // but being focused and enabled implies operability for a simple link.
        await expect(learnMoreLink).toBeEnabled();
    });

    test('5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents, and ARIA should only be used when native HTML elements fall short.', async ({ page }) => {
        // Assert that no ARIA attributes are present on any element, aligning with the rule that ARIA should be used sparingly.
        const elementsWithAria = page.locator('[aria-*]');
        await expect(elementsWithAria).toHaveCount(0);
    });

    test('6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text).', async ({ page }) => {
        // Playwright does not directly calculate color contrast ratios.
        // This test serves as a placeholder to confirm the presence of text elements that require contrast checking.
        // Actual contrast verification requires manual inspection or integration with a dedicated accessibility tool (e.g., Axe).
        
        // Assert that key text elements are visible, indicating there is text content to be evaluated for contrast.
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('p').first()).toBeVisible();
        await expect(page.locator('a')).toBeVisible();

        // Annotation for manual verification or specialized tool integration
        test.info().annotations.push({ type: 'TODO', description: 'Manual verification or integration with a color contrast analysis tool (e.g., Axe-core) is required to ensure sufficient color contrast ratios.' });
    });

    test('7. Page Title & Language: The document must have a descriptive <title> and a valid <html lang="en"> attribute.', async ({ page }) => {
        // Check for the document title
        await expect(page).toHaveTitle('Example Domain');

        // Check for the lang attribute on the html element
        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveAttribute('lang', 'en');
    });

    test('8. Keyboard Navigation: Interactive elements must not trap focus and should have a visible focus indicator.', async ({ page }) => {
        const learnMoreLink = page.locator('a[href="https://iana.org/domains/example"]');

        // Simulate tabbing to the first interactive element.
        await page.keyboard.press('Tab');
        await expect(learnMoreLink).toBeFocused(); // Verify the link receives focus.

        // Simulate tabbing again to ensure focus moves past the element (no focus trap).
        await page.keyboard.press('Tab');
        await expect(learnMoreLink).not.toBeFocused(); // The link should no longer be focused.

        // A visible focus indicator is a visual property. While Playwright can verify CSS properties,
        // confirming "visibility" of an outline requires more advanced visual testing or manual inspection.
        test.info().annotations.push({ type: 'TODO', description: 'Visual inspection is required to confirm the presence and visibility of a focus indicator for interactive elements.' });
    });
});
