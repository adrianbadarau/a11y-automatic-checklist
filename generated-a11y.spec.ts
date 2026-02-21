import { test, expect } from '@playwright/test';

test.describe('Accessibility Requirements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://www.w3.org/WAI/demos/bad/after/home.html");
  });

  // Test cases for Rule 1: Images missing alt attributes
  test('decorative images without alt should have empty alt', async ({ page }) => {
      const decorativeImageSrcs = [
          './img/border_left_top.gif',
          './img/border_top.gif',
          './img/border_right_top.gif',
          './img/border_left.gif',
          './img/top_logo_next_end.gif',
          './img/top_logo_next_start.gif',
          './img/mark.gif',
          '.img/marker2_w.gif', // Typo in src path in the HTML
          './img/marker2_w.gif',
          './img/marker2_t.gif',
          './img/blank_5x5.gif',
          './img/headline_middle.gif',
          './img/border_right.gif',
          './img/border_bottom_left.gif',
          './img/border_bottom.gif',
          './img/border_bottom_right.gif'
      ];
  
      for (const src of decorativeImageSrcs) {
          const images = page.locator(`img[src="${src}"]`);
          const count = await images.count();
          // Assert that all instances of these decorative images should have an empty alt attribute
          for (let i = 0; i < count; i++) {
              await expect(images.nth(i), `Decorative image with src="${src}" should have alt=""`).toHaveAttribute('alt', '');
          }
      }
  });
  
  test('decorative list bullets should have empty alt', async ({ page }) => {
      // These decorative list bullets currently have alt="bullet" and should be empty.
      const listBulletImages = page.locator('img[src="./img/list_bullets.gif"]');
      const count = await listBulletImages.count();
      for (let i = 0; i < count; i++) {
          await expect(listBulletImages.nth(i), `Decorative list bullet image should have alt=""`).toHaveAttribute('alt', '');
      }
  });
  
  test('informative images without alt should have descriptive alt', async ({ page }) => {
      // Informative images that need descriptive alt text (currently missing alt attribute)
      const informativeImageLocators = [
          page.locator('img[src="./img/top_weather.gif"]'),
          page.locator('img[name="nav_home"]'),
          page.locator('img[name="nav_news"]'),
          page.locator('img[name="nav_facts"]'), // Represents 'Tickets' navigation
          page.locator('img[name="nav_survey"]'),
          page.locator('img[src="./img/teaser_right1.jpg"]'),
          page.locator('img[src="./img/teaser_right2.jpg"]')
      ];
  
      for (const locator of informativeImageLocators) {
          // Assert that each informative image should have a non-empty alt attribute
          // The .nth(0) is used to explicitly target the first element found by the locator if it's not unique by nature
          await expect(locator.first(), 
              `Informative image (src: ${await locator.first().getAttribute('src') || await locator.first().getAttribute('name')}) should have a descriptive alt attribute`
          ).toHaveAttribute('alt', /.+/);
      }
  });

});

