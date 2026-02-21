import { test, expect } from '@playwright/test';

test.describe('Accessibility Requirements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://www.w3.org/WAI/demos/bad/after/home.html");
  });

  // Test cases for Rule 1: Images missing alt attributes
  test('decorative images must have empty alt attributes', async ({ page }) => {
    // Decorative border images
    await expect(page.locator('img[src="./img/border_left_top.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/border_top.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/border_right_top.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/border_left.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/top_logo_next_end.gif"]')).toHaveAttribute('alt', '');
    // Assuming top_weather.gif is decorative due to surrounding text describing the weather
    await expect(page.locator('img[src="./img/top_weather.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/top_logo_next_start.gif"]')).toHaveAttribute('alt', '');
    await expect(page.locator('img[src="./img/mark.gif"]')).toHaveAttribute('alt', '');
    // Image with a typo in src, still needs alt
    await expect(page.locator('img[src=".img/marker2_w.gif"]')).toHaveAttribute('alt', '');
    // First instance of marker2_w.gif within the main #page content area (left nav border)
    await expect(page.locator('div#page table:nth-of-type(2) img[src="./img/marker2_w.gif"]').first()).toHaveAttribute('alt', '');
    // First instance of marker2_t.gif within the main #page content area (left nav border)
    await expect(page.locator('div#page table:nth-of-type(2) img[src="./img/marker2_t.gif"]').first()).toHaveAttribute('alt', '');
    // Decorative spacer image
    await expect(page.locator('img[src="./img/blank_5x5.gif"]')).toHaveAttribute('alt', '');
    // Decorative headline icon, first of three
    await expect(page.locator('img[src="./img/headline_middle.gif"]').first()).toHaveAttribute('alt', '');
    // Decorative border images in the footer area
    await expect(page.locator('td[background="./img/border_right.gif"] > img')).toHaveAttribute('alt', '');
    await expect(page.locator('td[background="./img/border_bottom_left.gif"] > img')).toHaveAttribute('alt', '');
    await expect(page.locator('td[background="./img/border_bottom.gif"] > img')).toHaveAttribute('alt', '');
    await expect(page.locator('td[background="./img/border_bottom_right.gif"] > img')).toHaveAttribute('alt', '');
  });
  
  test('informative navigation images must have descriptive alt attributes', async ({ page }) => {
    // Navigation images from the left sidebar
    await expect(page.locator('img[name="nav_home"]')).toHaveAttribute('alt', /Home/);
    await expect(page.locator('img[name="nav_news"]')).toHaveAttribute('alt', /News/);
    // The name is nav_facts but context implies it's for 'Tickets' page
    await expect(page.locator('img[name="nav_facts"]')).toHaveAttribute('alt', /(Tickets|Facts)/); 
    await expect(page.locator('img[name="nav_survey"]')).toHaveAttribute('alt', /Survey/);
  });
  
  test('informative content images must have descriptive alt attributes', async ({ page }) => {
    // Teaser images from the right sidebar
    // The specific alt text will depend on the image content; regex checks for non-empty alt.
    await expect(page.locator('img[src="./img/teaser_right1.jpg"]')).toHaveAttribute('alt', /.+/);
    await expect(page.locator('img[src="./img/teaser_right2.jpg"]')).toHaveAttribute('alt', /.+/);
  });

});

