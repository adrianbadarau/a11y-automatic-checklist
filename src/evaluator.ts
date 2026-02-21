import { GoogleGenAI } from '@google/genai';
import { dequeA11yRuleset } from './rules.js';

export class A11yEvaluator {
    private ai: GoogleGenAI;
    private model = 'gemini-2.5-flash';

    constructor(apiKey?: string) {
        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY environment variable. Please set it.");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    async evaluatePage(url: string, html: string, ariaTree: string, screenshotBase64?: string): Promise<string> {
        let prompt = `
System Context: ${dequeA11yRuleset}

You are tasked with evaluating the accessibility of a web page based on its DOM snapshot and Accessibility Tree.
Review the elements and check against the Deque rules. We want to be comprehensive.

Page HTML Snapshot:
\`\`\`html
${html.substring(0, 150000)} /* Truncating to avoid extreme length, but typically sufficient for flash context */
\`\`\`

Accessibility Tree (JSON):
\`\`\`json
${ariaTree.substring(0, 100000)}
\`\`\`

Provide two sections in your response:
1. "## Evaluation Report": A markdown summary of any accessibility violations found, referencing specific elements or roles. Also note what passes if it's prominently accessible.
2. "## Playwright Test": A valid TypeScript Playwright test script (\`test.spec.ts\`) that covers regressions for the elements mentioned. 

CRITICAL TEST REQUIREMENTS:
- The test script MUST include a \`test.beforeEach\` block with an explicit \`await page.goto("${url}")\` so the tests run against the live page.
- You MUST write a test case for EVERY SINGLE RULE in the ruleset above, even if it passes.
- DO NOT generate brittle assertions that rely on the presence of broken elements (e.g., expecting a specific broken \`img\` to have an \`alt\`). If the user fixes the code by removing the broken element, your test would fail due to a timeout.
- INSTEAD, write assertions that test for the ABSENCE of rule violations. (e.g., \`await expect(page.locator('img:not([alt])')).toHaveCount(0)\` to assert no images are missing alt text).
- USE ONLY standard CSS selectors. DO NOT use advanced CSS nesting like \`&\` or invalid Playwright pseudo-classes like \`:text-is(/regex/)\`. Playwright locators must be valid CSS or valid standard text matchers.
- The generated test script should FAIL when run against the current page, but MUST PASS if the developer fixes the reported accessibility issues (even if that involves completely removing the offending elements).
- Wrap the TypeScript code in a single \`\`\`typescript block.`;

        if (screenshotBase64) {
            prompt += `\n\nYou have also been provided a full-page screenshot. Use this screenshot to verify visual accessibility guidelines, such as color contrast or text formatting mimicking headings without semantic tags.`;
        }

        prompt += `\n\nStart your response now.`;

        let contents: any = prompt;
        if (screenshotBase64) {
            contents = [
                prompt,
                {
                    inlineData: {
                        data: screenshotBase64,
                        mimeType: "image/png"
                    }
                }
            ];
        }

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: contents,
        });

        return response.text ?? 'No evaluation produced.';
    }
}
