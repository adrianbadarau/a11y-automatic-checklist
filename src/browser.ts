import { chromium, Browser, Page } from 'playwright';
import { A11yRule } from './rules/index.js';

export class BrowserAdapter {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async init(url?: string, visual: boolean = false): Promise<Page> {
        this.browser = await chromium.launch({ headless: !visual });

        // Create a new context
        const context = await this.browser.newContext();
        this.page = await context.newPage();

        if (url) {
            await this.page.goto(url, { waitUntil: 'networkidle' });
        }

        return this.page;
    }

    async attachToDebugger(debuggerUrl: string): Promise<Page> {
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
        let targetPage: Page | null = null;

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
            } else {
                targetPage = await contexts[0].newPage();
            }
        }

        this.page = targetPage;
        return this.page;
    }

    async visualizeRules(rules: A11yRule[]) {
        if (!this.page) return;

        for (const rule of rules) {
            // Inject a banner and highlight styles into the page
            await this.page.evaluate(({ description, selector }) => {
                const existingBanner = document.getElementById('playwright-a11y-visual-banner');
                if (existingBanner) existingBanner.remove();

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
                    (el as HTMLElement).style.outline = '';
                    (el as HTMLElement).style.outlineOffset = '';
                    (el as HTMLElement).style.boxShadow = '';
                });

                document.querySelectorAll(selector).forEach(el => {
                    el.classList.add('playwright-a11y-highlight');
                    (el as HTMLElement).style.outline = '4px solid #ff00ff';
                    (el as HTMLElement).style.outlineOffset = '2px';
                    (el as HTMLElement).style.boxShadow = '0 0 10px #ff00ff';
                });
            }, { description: rule.description, selector: rule.selector });

            // Wait 2 seconds so the user can see it
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Cleanup after all rules are checked
        await this.page.evaluate(() => {
            const existingBanner = document.getElementById('playwright-a11y-visual-banner');
            if (existingBanner) existingBanner.remove();

            document.querySelectorAll('.playwright-a11y-highlight').forEach(el => {
                el.classList.remove('playwright-a11y-highlight');
                (el as HTMLElement).style.outline = '';
                (el as HTMLElement).style.outlineOffset = '';
                (el as HTMLElement).style.boxShadow = '';
            });
        });
    }

    async getPageSnapshot(): Promise<{ url: string; html: string; ariaTree: string }> {
        if (!this.page) {
            throw new Error("Page not initialized.");
        }

        // Get HTML enriched with visual structural cues
        const html = await this.page.evaluate(`(() => {
            function processNode(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent?.trim();
                    if (!text) return null;
                    return document.createTextNode(text);
                }

                if (node.nodeType !== Node.ELEMENT_NODE) return null;

                const el = node;
                const tagName = el.tagName.toLowerCase();

                // Skip non-visual/non-semantic nodes
                if (['script', 'style', 'svg', 'noscript', 'meta', 'link', 'head'].includes(tagName)) {
                    return null;
                }

                const clone = document.createElement(tagName);

                // Copy relevant attributes
                for (const attr of Array.from(el.attributes)) {
                    clone.setAttribute(attr.name, attr.value);
                }

                // Add visual semantic hints
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();

                // Only consider visible elements that have size
                if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
                    clone.setAttribute('data-rect', \`\${\~\~rect.top},\${\~\~rect.left},\${\~\~rect.width},\${\~\~rect.height}\`);

                    if (style.backgroundImage && style.backgroundImage !== 'none') {
                        clone.setAttribute('data-bg-image', style.backgroundImage);
                    }
                    if (style.fontSize) {
                        clone.setAttribute('data-font-size', style.fontSize);
                    }
                    if (style.fontWeight && style.fontWeight !== '400') {
                        clone.setAttribute('data-font-weight', style.fontWeight);
                    }
                    if (style.color) {
                        clone.setAttribute('data-color', style.color);
                    }
                }

                for (const child of Array.from(el.childNodes)) {
                    const processedChild = processNode(child);
                    if (processedChild) {
                        clone.appendChild(processedChild);
                    }
                }

                return clone;
            }

            const processedBody = processNode(document.body);
            return processedBody ? processedBody.outerHTML : '<body></body>';
        })()`) as string;

        return { url: this.page.url(), html, ariaTree: "{}" };
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
