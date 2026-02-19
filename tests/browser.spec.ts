import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { BrowserAdapter } from '../src/browser.js';

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
    });

    it('should throw if getting snapshot without initializing', async () => {
        await expect(adapter.getPageSnapshot()).rejects.toThrow(/Page not initialized/);
    });
});
