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

    async evaluatePage(url: string, html: string, ariaTree: string): Promise<string> {
        const prompt = `
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
- DO NOT generate generic assertions. Your locators (e.g. \`page.locator('...')\`) MUST specifically target the exact elements, IDs, classes, or text contents you found in the provided HTML snapshot and Accessibility Tree.
- If an element violates a rule, write an assertion that EXPECTS it to meet the rule (e.g. if an img lacks an alt, write \`await expect(page.locator('img.logo')).toHaveAttribute('alt', /.+/)\` so the test will accurately fail until the user fixes their code).
- Wrap the TypeScript code in a single \`\`\`typescript block.

Start your response now.
`;

        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: prompt,
        });

        return response.text ?? 'No evaluation produced.';
    }
}
