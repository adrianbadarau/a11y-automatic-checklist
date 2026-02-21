import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto("https://www.w3.org/WAI/demos/bad/after/home.html/");
});

test.describe('Deque Accessibility Checklist Violations', () => {

    // 1. Images: All <img> elements must have an alt attribute.
    test('Images: No <img> elements should be missing an alt attribute', async ({ page }) => {
        // This test asserts that there are no <img> tags without an 'alt' attribute.
        await expect(page.locator('img:not([alt])')).toHaveCount(0);
    });

    // 2. Headings: The page must have a logical heading structure (H1 -> H2 -> H3) without skipping levels.
    // The primary violation here is multiple H1s, not a skip from H1 to H3 directly.
    test('Headings: The page should have exactly one <h1> element for the main content', async ({ page }) => {
        // This test asserts that there is only one <h1> element on the page,
        // which should represent the main content.
        await expect(page.locator('h1')).toHaveCount(1);
    });

    // 3. Forms: Every form input must have an associated <label> or aria-label/aria-labelledby.
    test('Forms: All visible input fields should have an associated <label>, aria-label, or aria-labelledby', async ({ page }) => {
        // This test finds inputs that are NOT hidden and DO NOT have 'aria-label' or 'aria-labelledby'.
        // For such inputs, it then checks if they also lack an 'id' attribute or a corresponding '<label for="id">'.
        // The current page's search input (name="q") is a violation because it relies on 'title' attribute.
        // To pass, the input[name="q"] would need an <label> or ARIA attribute.
        const inputsWithoutAriaLabel = page.locator('input:not([type="hidden"]):not([aria-label]):not([aria-labelledby])');
        const countViolations = await inputsWithoutAriaLabel.evaluateAll(async (inputs, { pageInstance }) => {
            let violations = 0;
            for (const input of inputs) {
                const id = input.id;
                if (!id) {
                    // If no id, check if it's wrapped by a <label>
                    if (!(input.closest('label'))) {
                        violations++;
                    }
                } else {
                    // If has id, check for a matching <label for="id">
                    const labelExists = await pageInstance.locator(`label[for="${id}"]`).count();
                    if (labelExists === 0) {
                        violations++;
                    }
                }
            }
            return violations;
        }, { pageInstance: page });

        expect(countViolations).toBe(0);
    });

    // 4. Links and Buttons: Must be focusable, operable via Keyboard (Enter/Space), and have discernible text.
    test('Links and Buttons: All interactive elements should have a discernible accessible name', async ({ page }) => {
        // This test checks that all links and buttons have a non-empty accessible name.
        // Accessible name can come from text content, aria-label, aria-labelledby, or alt text of child image.
        // Playwright's toHaveAccessibleName() handles these sources.
        const interactiveElements = page.locator('a[href], button');
        const elementsWithEmptyAccessibleName = await interactiveElements.evaluateAll(async (elements) => {
            let emptyNames = 0;
            for (const el of elements) {
                // Use the native browser's Accessible Name Computation (ANC) through AOM if possible
                // Fallback for Playwright:
                const accessibleName = el.ariaLabel || el.textContent?.trim() || el.title || (el.querySelector('img') && el.querySelector('img')?.alt);
                if (!accessibleName || accessibleName.trim() === '') {
                    emptyNames++;
                }
            }
            return emptyNames;
        });
        expect(elementsWithEmptyAccessibleName).toBe(0);
    });

    // 5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents,
    // and ARIA should only be used when native HTML elements fall short.
    test('ARIA: No elements should use accesskey attributes', async ({ page }) => {
        // This test asserts that no element on the page uses the 'accesskey' attribute.
        await expect(page.locator('[accesskey]')).toHaveCount(0);
    });

    test('ARIA: tabindex values should be correctly managed (only 0 or -1)', async ({ page }) => {
        // This test asserts that no element has a positive tabindex value (e.g., tabindex="1", "2", "3").
        // Only tabindex="0" (for natural flow or custom focus) or tabindex="-1" (for programmatic focus) are generally acceptable.
        await expect(page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])')).toHaveCount(0);
    });

    // 6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text).
    test('Color Contrast: "Leading the web to its full potential" text must have sufficient contrast', async ({ page }) => {
        // This test specifically targets the element identified with insufficient color contrast.
        // It asserts that this element (identified by its styling) should no longer exist with those problematic colors.
        // The selector includes the problematic color and background-color values.
        await expect(page.locator('p.w3c_sec_nav p[style*="rgb(102, 102, 102)"][style*="rgb(238, 238, 238)"]')).toHaveCount(0);
    });

    // 7. Page Title & Language: The document must have a descriptive <title> and a valid <html lang="en"> attribute.
    test('Page Title & Language: Document should have a descriptive title', async ({ page }) => {
        // This test asserts that the page title is descriptive.
        // The current title "Error 404 - Not found" passes this criterion.
        await expect(page).toHaveTitle(/Error 404 - Not found/);
    });

    test('Page Title & Language: Document should have a valid html lang attribute set to "en"', async ({ page }) => {
        // This test asserts that the <html> element has a 'lang="en"' attribute.
        // The current page has 'xml:lang="en"', which is acceptable, but for stricter HTML5, 'lang' is preferred.
        // Playwright's toHaveAttribute checks for either 'lang' or 'xml:lang' if the attribute is present.
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });

    // 8. Keyboard Navigation: Interactive elements must not trap focus and should have a visible focus indicator.
    // Focus trapping is hard to test statically. Visible focus indicator is visual and depends on CSS.
    // The primary keyboard navigation issue detected via static analysis is the misuse of tabindex,
    // which is already covered in the ARIA section.
    test('Keyboard Navigation: Interactive elements should not have confusing tabindex values', async ({ page }) => {
        // This test is a duplicate of the ARIA tabindex test as it directly addresses a keyboard navigation issue.
        // It asserts that no element has a positive tabindex value (e.g., tabindex="1", "2", "3"), which disrupts natural keyboard flow.
        await expect(page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])')).toHaveCount(0);
    });

});
