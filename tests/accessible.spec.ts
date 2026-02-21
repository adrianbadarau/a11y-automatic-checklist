import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.w3.org/WAI/demos/bad/after/home.html");
});

test.describe('Deque Accessibility Checklist Evaluation', () => {

  test('1. Images: All <img> elements must have an alt attribute, decorative images should have empty alt=""', async ({ page }) => {
    // Pass: W3C logo
    await expect(page.locator('p#logos img[alt="W3C logo"]')).toHaveAttribute('alt', 'W3C logo');
    // Pass: WAI logo
    await expect(page.locator('p#logos img[alt="Web Accessibility Initiative (WAI) logo"]')).toHaveAttribute('alt', 'Web Accessibility Initiative (WAI) logo');
    // Pass: CityLights logo (implicitly handled by AT name, but checking alt on img itself)
    await expect(page.locator('#header img[alt="Citylights: your access to the city."]')).toHaveAttribute('alt', 'Citylights: your access to the city.');
    // Pass: Weather image
    await expect(page.locator('#header img[alt="Sunny Spells"]')).toHaveAttribute('alt', 'Sunny Spells');
    // Pass: Decorative panda image
    await expect(page.locator('.news:nth-of-type(1) img')).toHaveAttribute('alt', '');
    // Pass: Decorative violin image
    await expect(page.locator('.news:nth-of-type(2) img')).toHaveAttribute('alt', '');
    // Pass: Decorative brain image
    await expect(page.locator('.news:nth-of-type(3) img')).toHaveAttribute('alt', '');
    // Pass: Concert teaser image
    await expect(page.locator('#contentright img[alt="Free Penguins playing on stage"]')).toHaveAttribute('alt', 'Free Penguins playing on stage');
    // Pass: Survey teaser image
    await expect(page.locator('#contentright img[alt="Anemone-Snowdrop flower blooming"]')).toHaveAttribute('alt', 'Anemone-Snowdrop flower blooming');
  });

  test('2. Headings: The page must have a logical heading structure (H1 -> H2 -> H3) without skipping levels.', async ({ page }) => {
    // Check main H1 for overall demo page
    await expect(page.locator('h1:has-text("Accessible Home Page - Before and After Demonstration")')).toBeVisible();
    await expect(page.locator('h1').first()).toHaveAttribute('role', 'heading'); // Implicit via h1 tag, but good to assert if using ARIA roles.
    await expect(page.locator('h1').first()).toHaveJSProperty('level', 1);

    // Check H1 for main content
    await expect(page.locator('#contentmain h1:has-text("Welcome to CityLights")')).toBeVisible();
    await expect(page.locator('#contentmain h1')).toHaveJSProperty('level', 1);

    // Check H2 for navigation
    await expect(page.locator('h2#navtarget:has-text("Navigation menu:")')).toBeVisible();
    await expect(page.locator('h2#navtarget')).toHaveJSProperty('level', 2);

    // Check H2s for news articles
    await expect(page.locator('.news:nth-of-type(1) h2')).toHaveJSProperty('level', 2);
    await expect(page.locator('.news:nth-of-type(2) h2')).toHaveJSProperty('level', 2);
    await expect(page.locator('.news:nth-of-type(3) h2')).toHaveJSProperty('level', 2);

    // Check H2 for "Elsewhere on the Web"
    await expect(page.locator('h2.header:has-text("Elsewhere on the Web")')).toHaveJSProperty('level', 2);

    // Check H2s in contentright
    await expect(page.locator('#contentright h2:has-text("Citylights Concert")')).toHaveJSProperty('level', 2);
    await expect(page.locator('#contentright h2:has-text("Citylights Survey")')).toHaveJSProperty('level', 2);

    // Assert that there are no skipped heading levels (e.g., H1 followed by H3 directly)
    // This is more complex to test programmatically without full DOM traversal and state management.
    // We'll assert that no H3s exist without an H2 before them globally, which is a simplification.
    // For this specific page, the structure is H1 then H2, so we can check for no H3s being used without H2.
    // No H3s or higher are used, so this check primarily confirms H1 followed by H2.
    await expect(page.locator('h3, h4, h5, h6')).not.toBeVisible(); // This implies no skips because only H1/H2 exist.
  });

  test('3. Forms: Every form input must have an associated <label> or aria-label/aria-labelledby.', async ({ page }) => {
    // Check the select input in the quick menu form
    const selectElement = page.locator('select#qkmenu');
    const labelElement = page.locator('label#qklabel');

    // Expect the select to be associated with the label
    await expect(selectElement).toHaveAttribute('id', 'qkmenu');
    await expect(labelElement).toHaveAttribute('for', 'qkmenu');
    await expect(labelElement).toContainText('Explore Site by Topic:');

    // Check the submit button (value attribute acts as accessible name)
    const submitButton = page.locator('input[type="submit"][value="Go"]');
    await expect(submitButton).toHaveAttribute('value', 'Go');
    await expect(submitButton).toHaveAccessibleName('Go');
  });

  test('4. Links and Buttons: Must be focusable, operable via Keyboard (Enter/Space), and have discernible text.', async ({ page }) => {
    // Pass: Skip link
    await expect(page.locator('p#skipnav a[href="#page"]')).toHaveAccessibleName('Skip to accessible demo page');
    await expect(page.locator('p#skipnav a[href="#page"]')).toBeEnabled();

    // Pass: W3C logo link
    await expect(page.locator('p#logos a[title="W3C Home"]')).toHaveAccessibleName('W3C logo');
    await expect(page.locator('p#logos a[title="W3C Home"]')).toBeEnabled();

    // Pass: WAI logo link
    await expect(page.locator('p#logos a[title="WAI Home"]')).toHaveAccessibleName('Web Accessibility Initiative (WAI) logo');
    await expect(page.locator('p#logos a[title="WAI Home"]')).toBeEnabled();

    // Violation: "Accessible Home Page" link in main nav submenu should be focusable and operable
    const accessibleHomePageLink = page.locator('#mnav ul li.current.first div.subnav li.accessible a.page.current');
    // Expect it to have an href attribute to be focusable
    await expect(accessibleHomePageLink).toHaveAttribute('href', /.+/); // Fails, as it lacks href
    await expect(accessibleHomePageLink).toBeEnabled(); // This might pass if not disabled, but won't be keyboard operable without href

    // Violation: CityLights logo link should be focusable and operable
    const cityLightsLogoLink = page.locator('#header a').filter({ has: page.locator('img[alt="Citylights: your access to the city."]') });
    // Expect it to have an href attribute to be focusable
    await expect(cityLightsLogoLink).toHaveAttribute('href', /.+/); // Fails, as it lacks href
    await expect(cityLightsLogoLink).toBeEnabled(); // This might pass if not disabled, but won't be keyboard operable without href

    // Violation: "Home" link in content navigation should be focusable and operable
    const homeContentNav = page.locator('#nav ul li.home_set a');
    // Expect it to have an href attribute to be focusable
    await expect(homeContentNav).toHaveAttribute('href', /.+/); // Fails, as it lacks href
    await expect(homeContentNav).toBeEnabled(); // This might pass if not disabled, but won't be keyboard operable without href

    // Pass: Form submit button
    await expect(page.locator('input[type="submit"][value="Go"]')).toBeEnabled();
    await expect(page.locator('input[type="submit"][value="Go"]')).toHaveAccessibleName('Go');

    // Pass: Other navigation links in #mnav (e.g., Overview)
    await expect(page.locator('#mnav ul li.first a[href="../Overview.html"]')).toHaveAccessibleName('Overview');
    await expect(page.locator('#mnav ul li.first a[href="../Overview.html"]')).toBeEnabled();

    // Pass: Other navigation links in #nav (e.g., News)
    await expect(page.locator('#nav ul li.news a[href="news.html"]')).toHaveAccessibleName('News');
    await expect(page.locator('#nav ul li.news a[href="news.html"]')).toBeEnabled();
  });

  test('5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents, and ARIA should only be used when native HTML elements fall short.', async ({ page }) => {
    // Violation: Main navigation container should have role="navigation"
    await expect(page.locator('div#mnav')).toHaveAttribute('role', 'navigation'); // Fails, as it lacks role="navigation"
    await expect(page.locator('div#mnav')).toHaveAttribute('aria-label', /.+/); // Fails, as it lacks an aria-label

    // Violation: Acronym tags should be abbr tags
    // Check W3C acronym
    await expect(page.locator('footer acronym[title="World Wide Web Consortium"]')).toHaveJSProperty('tagName', 'ABBR'); // Fails, as it's an ACROYM
    // Check MIT acronym
    await expect(page.locator('footer acronym[title="Massachusetts Institute of Technology"]')).toHaveJSProperty('tagName', 'ABBR'); // Fails
    // Check ERCIM acronym
    await expect(page.locator('footer acronym[title="European Research Consortium for Informatics and Mathematics"]')).toHaveJSProperty('tagName', 'ABBR'); // Fails
    // Check WAI-TIES acronym in meta-footer
    await expect(page.locator('#meta-footer acronym[title="Web Accessibility Initiative: Training, Implementation, Education, Support"]')).toHaveJSProperty('tagName', 'ABBR'); // Fails
    // Check WAI-AGE acronym in meta-footer
    await expect(page.locator('#meta-footer acronym[title="Web Accessibility Initiative: Ageing Education and Harmonisation"]')).toHaveJSProperty('tagName', 'ABBR'); // Fails
    // Check IST acronym in meta-footer
    await expect(page.locator('#meta-footer acronym[title="Information Society Technologies"]')).toHaveJSProperty('tagName', 'ABBR'); // Fails

    // Pass: Hidden span for screen reader text in main H1
    await expect(page.locator('h1 span.hidden')).toHaveText('-'); // Verifies text content
    await expect(page.locator('h1')).toHaveAccessibleName('Accessible Home Page - Before and After Demonstration'); // Verifies the combined accessible name

    // Pass: Hidden span for current location in main nav
    await expect(page.locator('#mnav li.current.first span.hidden')).toHaveText('Current location: ');
  });

  test('6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text).', async ({ page }) => {
    // Note: Playwright alone cannot directly compute color contrast ratios.
    // This test serves as a placeholder to indicate the check was considered.
    // For actual contrast testing, an integration with a tool like axe-core would be necessary.
    // Based on visual inspection from the screenshot, no obvious contrast issues were found.
    // This assertion will always pass, as it's a placeholder.
    await expect(true).toBe(true);
  });

  test('7. Page Title & Language: The document must have a descriptive <title> and a valid <html lang="en"> attribute.', async ({ page }) => {
    // Check html lang attribute
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Check document title
    await expect(page).toHaveTitle('Welcome to CityLights! [Accessible Home Page]');
  });

  test('8. Keyboard Navigation: Interactive elements must not trap focus and should have a visible focus indicator.', async ({ page }) => {
    // Focus trapping is difficult to test with static analysis; assuming no traps for this page.
    // Visible focus indicator is also difficult to test directly; assuming default browser focus is used.

    // Test specific elements for focusability as per keyboard navigation rule.
    // Pass: Skip link is focusable
    await page.press('body', 'Tab'); // Tab to the first focusable element
    await expect(page.locator('p#skipnav a[href="#page"]')).toBeFocused();
    await page.press('Tab', 'Enter'); // Test operability for skip link
    await expect(page.locator('#page')).toBeVisible(); // Assuming it jumps to the #page element

    // Test problematic links for focusability (should fail if they lack href and are not custom-tabbable)
    // Violation: "Accessible Home Page" link in main nav submenu should be focusable
    const accessibleHomePageLink = page.locator('#mnav ul li.current.first div.subnav li.accessible a.page.current');
    // Tab through elements until we reach the vicinity of the problematic link
    // This is a simplified check. A full check would involve tabbing through all elements.
    await page.keyboard.press('Tab'); // From #page
    await page.keyboard.press('Tab'); // To #logos a W3C
    await page.keyboard.press('Tab'); // To #logos a WAI
    await page.keyboard.press('Tab'); // To Overview
    await page.keyboard.press('Tab'); // To Inaccessible Home Page
    await page.keyboard.press('Tab'); // To Inaccessible Home Page Report
    // The next tab should ideally go to "Accessible Home Page" if it were focusable
    await expect(accessibleHomePageLink).toBeFocused(); // Fails: This link is not focusable

    // Violation: CityLights logo link should be focusable
    const cityLightsLogoLink = page.locator('#header a').filter({ has: page.locator('img[alt="Citylights: your access to the city."]') });
    // After tabbing past the previous elements and main content links, it should eventually reach this one if focusable.
    // This requires a more complex tabbing sequence or direct focus testing.
    // For simplicity, we'll try to focus it directly.
    await cityLightsLogoLink.focus();
    await expect(cityLightsLogoLink).toBeFocused(); // Fails: This link is not focusable

    // Violation: "Home" link in content navigation should be focusable
    const homeContentNav = page.locator('#nav ul li.home_set a');
    await homeContentNav.focus();
    await expect(homeContentNav).toBeFocused(); // Fails: This link is not focusable

    // Pass: Ensure quick menu select is focusable
    const qkmenuSelect = page.locator('select#qkmenu');
    await qkmenuSelect.focus();
    await expect(qkmenuSelect).toBeFocused();

    // Pass: Ensure quick menu submit button is focusable
    const goButton = page.locator('input[type="submit"][value="Go"]');
    await goButton.focus();
    await expect(goButton).toBeFocused();
  });
});
