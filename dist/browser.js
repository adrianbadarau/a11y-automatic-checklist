import { chromium } from 'playwright';
export class BrowserAdapter {
    browser = null;
    page = null;
    async init(url, visual = false) {
        this.browser = await chromium.launch({ headless: !visual });
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
    async visualizeRules(rules) {
        if (!this.page)
            return;
        for (const rule of rules) {
            // Inject a banner and highlight styles into the page
            await this.page.evaluate(({ description, selector }) => {
                const existingBanner = document.getElementById('playwright-a11y-visual-banner');
                if (existingBanner)
                    existingBanner.remove();
                const banner = document.createElement('div');
                banner.id = 'playwright-a11y-visual-banner';
                banner.style.position = 'fixed';
                banner.style.top = '0';
                banner.style.left = '0';
                banner.style.width = '100%';
                banner.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                banner.style.color = '#fff';
                banner.style.padding = '15px';
                banner.style.fontSize = '24px';
                banner.style.fontWeight = 'bold';
                banner.style.textAlign = 'center';
                banner.style.zIndex = '999999';
                banner.style.pointerEvents = 'none';
                banner.innerText = `Checking for rule: ${description}`;
                document.body.appendChild(banner);
                // Highlight matching elements
                document.querySelectorAll('.playwright-a11y-highlight').forEach(el => {
                    el.classList.remove('playwright-a11y-highlight');
                    el.style.outline = '';
                    el.style.outlineOffset = '';
                    el.style.boxShadow = '';
                });
                document.querySelectorAll(selector).forEach(el => {
                    el.classList.add('playwright-a11y-highlight');
                    el.style.outline = '4px solid #ff00ff';
                    el.style.outlineOffset = '2px';
                    el.style.boxShadow = '0 0 10px #ff00ff';
                });
            }, { description: rule.description, selector: rule.selector });
            // Wait 2 seconds so the user can see it
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        // Cleanup after all rules are checked
        await this.page.evaluate(() => {
            const existingBanner = document.getElementById('playwright-a11y-visual-banner');
            if (existingBanner)
                existingBanner.remove();
            document.querySelectorAll('.playwright-a11y-highlight').forEach(el => {
                el.classList.remove('playwright-a11y-highlight');
                el.style.outline = '';
                el.style.outlineOffset = '';
                el.style.boxShadow = '';
            });
        });
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
        let screenshotBase64;
        try {
            const buffer = await this.page.screenshot({ type: 'png', fullPage: true });
            screenshotBase64 = buffer.toString('base64');
        }
        catch (e) {
            console.warn("Could not capture page screenshot:", e.message);
        }
        return { url: this.page.url(), html, ariaTree, screenshotBase64 };
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
