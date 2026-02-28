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

                try {
                    document.querySelectorAll(selector).forEach(el => {
                        el.classList.add('playwright-a11y-highlight');
                        (el as HTMLElement).style.outline = '4px solid #ff00ff';
                        (el as HTMLElement).style.outlineOffset = '2px';
                        (el as HTMLElement).style.boxShadow = '0 0 10px #ff00ff';
                    });
                } catch (e) {
                    // Invalid selector, ignore
                }
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

    async applyBadges(additionalSelectors: string[] = [], options: { visual?: boolean, keepBadges?: boolean, containerId?: string } = {}): Promise<{ url: string; html: string; ariaTree: string; screenshot: string }> {
        if (!this.page) {
            throw new Error("Page not initialized.");
        }

        const { containerId, visual, keepBadges } = options;

        // 1. Inject Set-of-Mark badges
        await this.page.evaluate(({ cid, extraSelectors }) => {
            let targetNode = document.documentElement;
            if (cid) {
                const el = document.getElementById(cid);
                if (el) targetNode = el;
            }

            const baseSelectors = ['img', 'a', 'button', 'input', 'select', 'textarea', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '[role]'];
            const allSelectors = [...baseSelectors, ...extraSelectors];

            let counter = 1;

            allSelectors.forEach(selector => {
                let somElements: NodeListOf<Element>;
                try {
                    somElements = targetNode.querySelectorAll(selector);
                } catch (e) {
                    // LLM provided an invalid selector
                    return;
                }

                somElements.forEach(el => {
                    if (el.hasAttribute('data-playwright-a11y-id')) return; // Already processed

                    const rect = el.getBoundingClientRect();
                    // Basic visibility check
                    if (rect.width === 0 || rect.height === 0) return;

                    const id = counter++;
                    el.setAttribute('data-playwright-a11y-id', id.toString());

                    const badge = document.createElement('div');
                    badge.className = 'playwright-a11y-badge';
                    badge.textContent = id.toString();
                    badge.style.position = 'absolute';
                    badge.style.top = (rect.top + window.scrollY) + 'px';
                    badge.style.left = (rect.left + window.scrollX) + 'px';
                    badge.style.backgroundColor = 'red';
                    badge.style.color = 'white';
                    badge.style.fontSize = '12px';
                    badge.style.fontWeight = 'bold';
                    badge.style.padding = '2px 4px';
                    badge.style.borderRadius = '3px';
                    badge.style.zIndex = '2147483647';
                    badge.style.pointerEvents = 'none';
                    badge.setAttribute('aria-hidden', 'true');

                    document.body.appendChild(badge);
                });
            });
        }, { cid: containerId, extraSelectors: additionalSelectors });

        if (visual) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 2. Take screenshot with badges injected
        const screenshotBuffer = await this.page.screenshot({ type: 'jpeg', quality: 60, fullPage: true });
        const screenshot = screenshotBuffer.toString('base64');

        // 3. Get ARIA tree via CDP
        let ariaTree = "{}";
        try {
            const client = await this.page.context().newCDPSession(this.page);
            const { nodes } = await client.send('Accessibility.getFullAXTree');
            ariaTree = JSON.stringify(nodes ?? [], null, 2);
        } catch (e: any) {
            console.warn("Could not fetch CDP accessibility tree:", e.message);
        }

        // 4. Get HTML and cleanup DOM
        const html = await this.page.evaluate(({ cid, shouldCleanup }) => {
            let targetNode = document.documentElement;
            if (cid) {
                const el = document.getElementById(cid);
                if (!el) {
                    throw new Error(`Container element with id '${cid}' not found on the page.`);
                }
                targetNode = el;
            }

            // Clone to serialize safely without scripts/styles
            const clone = targetNode.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('script, style, svg, .playwright-a11y-badge').forEach(el => el.remove());
            const outerHTML = clone.outerHTML;

            if (shouldCleanup) {
                // Cleanup the actual page DOM so we don't leave artifacts if the page is re-used
                document.querySelectorAll('.playwright-a11y-badge').forEach(el => el.remove());
                document.querySelectorAll('[data-playwright-a11y-id]').forEach(el => el.removeAttribute('data-playwright-a11y-id'));
            }

            return outerHTML;
        }, { cid: containerId, shouldCleanup: !keepBadges });

        return { url: this.page.url(), html, ariaTree, screenshot };
    }

    async highlightAndScreenshotIssue(badgeNumber: number): Promise<string> {
        if (!this.page) {
            throw new Error("Page not initialized");
        }

        return await this.page.evaluate(async (badgeNum) => {
            // Find element by badge number
            const el = document.querySelector(`[data-playwright-a11y-id="${badgeNum}"]`) as HTMLElement;
            if (!el) return "";

            // Save original styles
            const originalOutline = el.style.outline;
            const originalOutlineOffset = el.style.outlineOffset;
            const originalBoxShadow = el.style.boxShadow;
            const originalPosition = el.style.position;
            const originalZIndex = el.style.zIndex;

            // Apply highlight
            el.style.outline = '4px dashed #ff00ff';
            el.style.outlineOffset = '2px';
            el.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.7)';
            el.style.position = 'relative';
            el.style.zIndex = '999998';

            el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });

            // We need to trigger the screenshot from the page context, but playwright's screenshot
            // is a Node API. We will use a CDP trick or just wait and let the Node context do it.
            // Wait, we can't take a base64 screenshot directly *inside* evaluate without external libraries.
            // Let's just highlight it, return true, and do the screenshot in the Node context.
            return {
                found: true,
                origOutline: originalOutline,
                origOutlineOffset: originalOutlineOffset,
                origBoxShadow: originalBoxShadow,
                origPosition: originalPosition,
                origZIndex: originalZIndex
            };
        }, badgeNumber).then(async (result: any) => {
            if (!result || !result.found) return "";

            // Take the screenshot now that it's highlighted and scrolled into view
            const screenshotBuffer = await this.page!.screenshot({ type: 'jpeg', quality: 60 });
            const b64 = screenshotBuffer.toString('base64');

            // Restore original styles
            await this.page!.evaluate(({ badgeNum, origStyles }) => {
                const el = document.querySelector(`[data-playwright-a11y-id="${badgeNum}"]`) as HTMLElement;
                if (el) {
                    el.style.outline = origStyles.origOutline;
                    el.style.outlineOffset = origStyles.origOutlineOffset;
                    el.style.boxShadow = origStyles.origBoxShadow;
                    el.style.position = origStyles.origPosition;
                    el.style.zIndex = origStyles.origZIndex;
                }
            }, { badgeNum: badgeNumber, origStyles: result });

            return b64;
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
