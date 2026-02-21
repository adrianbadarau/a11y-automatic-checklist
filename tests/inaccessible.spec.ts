import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.w3.org/WAI/demos/bad/before/home.html");
});

test.describe('Deque Accessibility Checklist Evaluation for CityLights', () => {

  // 1. Images: All <img> elements must have an alt attribute. Decorative images should have empty alt="".
  test('Images must have alt attributes, decorative images must have empty alt=""', async ({ page }) => {
    // Assert images that currently pass (descriptive alt or empty alt for decorative)
    await expect(page.locator('img[src="../img/w3c.png"]')).toHaveAttribute('alt', 'W3C logo');
    await expect(page.locator('img[src="../img/wai.png"]')).toHaveAttribute('alt', 'Web Accessibility Initiative (WAI) logo');
    await expect(page.locator('img[src="./img/top_logo.gif"]')).toHaveAttribute('alt', /Red dot with a white letter 'C' that symbolizes a moon crescent as well as the sun\. This logo is followed by a black banner that says 'CITYLIGHTS' which is the name of this online portal\. Finally, the slogan of the portal, 'your access to the city', follows in a turquoise green handwriting style and with a slight slant across the top banner\./); 
    await expect(page.locator('img[src="./img/morearrow.gif"]')).toHaveAttribute('alt', ''); // Decorative arrow as alt=""
    await expect(page.locator('img[src="./img/list_bullets.gif"]')).toHaveAttribute('alt', 'bullet');
    await expect(page.locator('img[src="./img/telefon_white_bg.gif"]')).toHaveAttribute('alt', '1234 56789');
    await expect(page.locator('img[src="//www.w3.org/analytics/piwik/piwik.php?idsite=328"]')).toHaveAttribute('alt', '');

    // Assert decorative images missing alt="" (expect them to have empty alt)
    await expect(page.locator('img[src="./img/border_left_top.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/border_top.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/border_right_top.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/border_left.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/top_logo_next_end.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/top_weather.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/top_logo_next_start.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/mark.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src=".img/marker2_w.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/marker2_w.gif"]').first()).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/marker2_t.gif"]').first()).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/blank_5x5.gif"]').first()).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/headline_middle.gif"]').first()).toHaveAttribute('alt', '');

    // Assert image links missing descriptive alt (expect them to have specific descriptive alt text)
    await expect(page.locator('a[href="javascript:location.href=\'home.html\';"] img[name="nav_home"]')).toHaveAttribute('alt', 'Home');
    await expect(page.locator('a[href="javascript:location.href=\'news.html\';"] img[name="nav_news"]')).toHaveAttribute('alt', 'News');
    await expect(page.locator('a[href="javascript:location.href=\'tickets.html\';"] img[name="nav_facts"]')).toHaveAttribute('alt', 'Tickets');
    await expect(page.locator('a[href="javascript:location.href=\'survey.html\';"] img[name="nav_survey"]')).toHaveAttribute('alt', 'Survey');

    // Assert content images missing descriptive alt (expect them to have non-empty alt)
    await expect(page.locator('img[src="./img/teaser_right1.jpg"]')).toHaveAttribute('alt', /.+/); // Should be descriptive, e.g., "Image of free penguins"
    await expect(page.locator('img[src="./img/teaser_right2.jpg"]')).toHaveAttribute('alt', /.+/); // Should be descriptive, e.g., "Image of a city park with white flowers"
  });

  // 2. Headings: The page must have a logical heading structure (H1 -> H2 -> H3) without skipping levels.
  test('Page must have a logical heading structure without skipping levels and use semantic heading tags', async ({ page }) => {
    // Assert that the H1 exists and has correct text
    await expect(page.locator('h1')).toHaveText('Inaccessible Home Page - Before and After Demonstration');
    
    // "Welcome to CityLights" is a visual heading but a <p>. Expect it to be an H2.
    await expect(page.locator('#main p.headline')).toHaveRole('heading', { level: 2 });
    await expect(page.locator('#main p.headline')).toHaveText('Welcome to CityLights');

    // "Elsewhere on the Web" is a visual heading but a <p>. Expect it to be an H3.
    await expect(page.locator('#content p.subheadline')).toHaveRole('heading', { level: 3 });
    await expect(page.locator('#content p.subheadline')).toHaveText('Elsewhere on the Web');

    // "Free Penguins" and "More City Parks" are visual headings but bolded text in table cells. Expect H3.
    await expect(page.locator('td[bgcolor="#A9B8BF"]:has(font > b:text("Free Penguins"))')).toHaveRole('heading', { level: 3 });
    await expect(page.locator('td[bgcolor="#A9B8BF"]:has(font > b:text("More City Parks"))')).toHaveRole('heading', { level: 3 });
  });

  // 3. Forms: Every form input must have an associated <label> or aria-label/aria-labelledby.
  test('Form inputs must have associated labels', async ({ page }) => {
    // The select element lacks an accessible name. Expect it to have an aria-label.
    const selectElement = page.locator('select');
    await expect(selectElement).toHaveAttribute('aria-label', 'Quick Menu'); // Or a meaningful label ID
  });

  // 4. Links and Buttons: Must be focusable, operable via Keyboard (Enter/Space), and have discernible text.
  test('Links must be focusable, operable, and have discernible text', async ({ page }) => {
    // Assert that no links have onfocus="blur();" which removes focus indicators
    await expect(page.locator('a[onfocus="blur();"]')).toHaveCount(0, { timeout: 100 }); // Expect 0 links with this problematic attribute

    // Assert specific generic link texts are replaced with descriptive alternatives
    await expect(page.locator('div.story:has-text("After three years of effort city scientists") a img[src="./img/morearrow.gif"]')).toHaveAttribute('alt', 'Read more about heat wave linked to temperatures');
    await expect(page.locator('div.story:has-text("Mayor: These kinds of crimes need more creative") a img[src="./img/morearrow.gif"]')).toHaveAttribute('alt', 'Read more about Man Gets Nine Months in Violin Case');
    await expect(page.locator('div.story:has-text("Brain donations: huge drop off") a img[src="./img/morearrow.gif"]')).toHaveAttribute('alt', 'Read more about Lack of brains hinders research');
    
    await expect(page.locator('p:has-text("Killer bees.") a')).toHaveText('Killer bees information'); // "Click here" -> "Killer bees information"
    await expect(page.locator('p:has-text("Onions.") a')).toHaveText('Onions information'); // "Click here" -> "Onions information"
    
    await expect(page.locator('td:has-text("Free penguins")').locator('a[href="tickets.html"]')).toHaveText('Read More about Free Penguins'); // "Read More..." -> "Read More about Free Penguins"
    await expect(page.locator('td:has-text("More parks and more green")').locator('a[href="survey.html"]')).toHaveText('Read More about More City Parks'); // "Read More..." -> "Read More about More City Parks"

    // Sanity check for links that already pass with discernible text and focusability (without onfocus="blur")
    await expect(page.locator('#skipnav a')).toHaveText('Skip to inaccessible demo page');
    await expect(page.locator('#skipnav a')).toBeFocusable();
    await expect(page.locator('a[title="W3C Home"]')).toHaveText('W3C logo'); // Image link is accessible via alt text
    await expect(page.locator('a[title="W3C Home"]')).toBeFocusable();
  });

  // 5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents, and ARIA should only be used when native HTML elements fall short.
  test('ARIA attributes must be valid and used appropriately', async ({ page }) => {
    // There are no explicit ARIA attributes in the given HTML snapshot to validate.
    // However, we can assert for a common good practice that is missing: `aria-current="page"` for current navigation.
    await expect(page.locator('#mnav li.current')).toHaveAttribute('aria-current', 'page');

    // Also, ensure visually hidden elements used for screen readers are correctly hidden with aria-hidden="true"
    await expect(page.locator('span.hidden')).toHaveAttribute('aria-hidden', 'true');
    // For text that is only visually hidden for visual layout but intended for screen readers (which is not the case here but good to demonstrate)
    // await expect(page.locator('span.hidden')).not.toHaveAttribute('aria-hidden', 'true'); // if it was intended for screen readers
  });

  // 6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text).
  test('Text must have sufficient color contrast', async ({ page }) => {
    // Assert that the link color (currently #226C8E on #D7D7CD, ~3.4:1) meets contrast requirements.
    // We expect it to change to a color with sufficient contrast, e.g., black or a darker shade.
    const linkColorLocators = page.locator('body a:not(#skipnav a):not(a[title="W3C Home"]):not(a[title="WAI Home"])');
    await expect(linkColorLocators.first()).toHaveCSS('color', 'rgb(0, 0, 0)'); // Expecting black for sufficient contrast

    // Assert that the sidebar heading-like text color (currently #41545D on #A9B8BF, ~2.7:1) meets contrast requirements.
    await expect(page.locator('td[bgcolor="#A9B8BF"] font[color="#41545D"]').first()).toHaveCSS('color', 'rgb(0, 0, 0)'); // Expecting black for sufficient contrast
    
    // Assert that body text color on primary background (passes already)
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(0, 0, 0)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(215, 215, 205)');
  });

  // 7. Page Title & Language: The document must have a descriptive <title> and a valid <html lang="en"> attribute.
  test('Document must have a descriptive title and lang attribute', async ({ page }) => {
    // Assert the title (currently descriptive, so it passes)
    await expect(page).toHaveTitle(/Welcome to CityLights! \[Inaccessible Home Page\]/);
    // Assert the html tag has the lang="en" attribute (currently missing)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  // 8. Keyboard Navigation: Interactive elements must not trap focus and should have a visible focus indicator.
  test('Interactive elements must not trap focus and should have a visible focus indicator', async ({ page }) => {
    // Assert that no interactive elements have onfocus="blur();" which removes the focus indicator
    await expect(page.locator('a[onfocus="blur();"]')).toHaveCount(0);
    // If the select had onfocus="blur()", test that too. It currently does not directly.
    await expect(page.locator('select[onfocus="blur();"]')).toHaveCount(0);

    // Assert that key interactive elements are focusable (even if onfocus=blur defeats visual indicator for now)
    await expect(page.locator('#skipnav a')).toBeFocusable();
    await expect(page.locator('a[href="../Overview.html"]')).toBeFocusable();
    await expect(page.locator('select')).toBeFocusable();
    // After fixing onfocus="blur();", also ensure that focus styling is visible via CSS checks or visual regression tests.
    // This test ensures the problematic JS attribute is removed.
  });
});
