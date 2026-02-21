import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { BrowserAdapter } from '../src/browser.js';
import { Rule } from '../src/rules.js';

describe('BrowserAdapter', () => {
    let adapter: BrowserAdapter;

    beforeEach(() => {
        adapter = new BrowserAdapter();
    });

    afterEach(async () => {
        await adapter.close();
    });

    it('should initialize a browser and return a page', async () => {
        const page = await adapter.init();
        expect(page).toBeDefined();
        expect(page.url()).toBe('about:blank'); // default empty page
    });

    it('should navigate to a url if provided during init', async () => {
        // We'll use a local data URI to avoid network dependency in tests
        const dataUrl = 'data:text/html,<html><body><h1>Hello World</h1></body></html>';
        const page = await adapter.init(dataUrl);

        expect(page.url()).toBe(dataUrl);

        const snapshot = await adapter.getPageSnapshot();
        expect(snapshot.html).toContain('Hello World');
        expect(snapshot.url).toBe(dataUrl);
        // Ensure accessibility tree is generated (might be "{}" depending on dummy page complexity in pure headless, but we expect it to exist as a string)
        expect(typeof snapshot.ariaTree).toBe('string');
        // Ensure a screenshot is returned as a base64 string
        expect(typeof snapshot.screenshotBase64).toBe('string');
        expect(snapshot.screenshotBase64?.length).toBeGreaterThan(0);
    });

    it('should throw if getting snapshot without initializing', async () => {
        await expect(adapter.getPageSnapshot()).rejects.toThrow(/Page not initialized/);
    });

    it('should visualize rules if the visualize method is called', async () => {
        const dummyRules: Rule[] = [
            { id: 1, description: 'Test Rule', selector: 'h1', promptText: 'Test' }
        ];

        const dataUrl = 'data:text/html,<html><body><h1>Test H1</h1></body></html>';
        const page = await adapter.init(dataUrl);

        // This method does not exist yet; test should fail compiling or running
        await adapter.visualizeRules(dummyRules);

        // After visualization we should expect the banner was injected and then removed.
        // It's hard to test the intermediate states without a complex mock, but we can
        // ensure it runs without throwing and doesn't pollute the final snapshot.
        const snapshot = await adapter.getPageSnapshot();
        expect(snapshot.html).toContain('Test H1');
        expect(snapshot.html).not.toContain('playwright-a11y-visual-banner'); // Ensure banner is cleaned up
    });
});
