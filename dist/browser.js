import { chromium } from 'playwright';
export class BrowserAdapter {
    browser = null;
    page = null;
    async init(url) {
        this.browser = await chromium.launch({ headless: true });
        // Create a new context
        const context = await this.browser.newContext();
        this.page = await context.newPage();
        if (url) {
            await this.page.goto(url, { waitUntil: 'networkidle' });
        }
        return this.page;
    }
    async attachToDebugger(debuggerUrl) {
        let wsEndpoint = debuggerUrl;
        // If the user provided an http instead of a ws URL, auto-resolve it
        if (debuggerUrl.startsWith('http')) {
            const versionRes = await fetch(`${debuggerUrl}/json/version`);
            const versionData = await versionRes.json();
            if (!versionData.webSocketDebuggerUrl) {
                throw new Error("Could not find webSocketDebuggerUrl from the CDP endpoint.");
            }
            wsEndpoint = versionData.webSocketDebuggerUrl;
        }
        const connectedBrowser = await chromium.connectOverCDP(wsEndpoint);
        this.browser = connectedBrowser;
        const contexts = connectedBrowser.contexts();
        let targetPage = null;
        for (const context of contexts) {
            const pages = context.pages();
            if (pages.length > 0) {
                // Find the first non-background page if possible
                targetPage = pages.find(p => !p.url().startsWith('chrome-extension://')) || pages[0];
                break;
            }
        }
        if (!targetPage) {
            if (contexts.length === 0) {
                const newContext = await connectedBrowser.newContext();
                targetPage = await newContext.newPage();
            }
            else {
                targetPage = await contexts[0].newPage();
            }
        }
        this.page = targetPage;
        return this.page;
    }
    async getPageSnapshot() {
        if (!this.page) {
            throw new Error("Page not initialized.");
        }
        // Get simplified HTML (stripping scripts and styles for LLM context size)
        const html = await this.page.evaluate(() => {
            const clone = document.documentElement.cloneNode(true);
            clone.querySelectorAll('script, style, svg').forEach(el => el.remove());
            return clone.outerHTML;
        });
        // Get approximate accessibility tree via CDP
        let ariaTree = "{}";
        try {
            const client = await this.page.context().newCDPSession(this.page);
            const { nodes } = await client.send('Accessibility.getFullAXTree');
            ariaTree = JSON.stringify(nodes ?? [], null, 2);
        }
        catch (e) {
            console.warn("Could not fetch CDP accessibility tree:", e.message);
        }
        return { url: this.page.url(), html, ariaTree };
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
