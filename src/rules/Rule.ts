import { GoogleGenAI } from '@google/genai';

export interface RuleOptions {
    ai: GoogleGenAI;
    model: string;
    url: string;
    html: string;
    ariaTree: string;
    screenshot: string;
}

export abstract class A11yRule {
    abstract readonly id: number;
    abstract readonly description: string;
    abstract readonly selector: string;
    readonly fullPageOnly?: boolean;
    protected abstract readonly promptText: string;

    /**
     * Evaluates the provided HTML/ARIA tree against this specific rule using the LLM.
     */
    async evaluate(options: RuleOptions): Promise<string> {
        const prompt = `
System Context: You are an expert accessibility evaluator using the Deque Accessibility Checklists as your primary reference.
Evaluate the provided web page representation against the following rule:

${this.promptText}

Page HTML Snapshot:
\`\`\`html
${options.html.substring(0, 150000)}
\`\`\`

Accessibility Tree (JSON):
\`\`\`json
${options.ariaTree.substring(0, 100000)}
\`\`\`

I have also attached a visual screenshot of the page. The screenshot has been annotated with numbered badges indicating the position of interactive and semantic elements. These numbers correspond directly to the \`data-playwright-a11y-id\` attribute on elements in the provided HTML snapshot. Use this screenshot along with the HTML and Accessibility Tree to perform your comprehensive visual accessibility assessment.

If you identify a visual violation, find its badge number, look up the corresponding element in the HTML using the \`data-playwright-a11y-id\`, and formulate your evaluation based on it.

Provide two sections in your response:
1. "## Evaluation Report": A markdown summary of any accessibility violations found related to this specific rule. Reference specific elements or roles, and include the badge number when applicable (e.g., "Badge 5 (\`<button class='submit'>\`): missing aria-label"). Also note what passes if it's prominently accessible. If no elements match this rule, state that clearly.
2. "## Playwright Test": One or more valid Playwright \`test('...', async ({ page }) => { ... })\` blocks that cover regressions for the elements mentioned.

CRITICAL TEST REQUIREMENTS:
- DO NOT include \`import\` statements at all. They are already provided. DO NOT include \`test.describe\`, or \`test.beforeEach\` blocks. Only provide the \`test(...)\` blocks themselves.
- You MUST use standard Playwright locators (e.g. \`page.locator('...')\`) targeting the exact elements using robust selectors (standard CSS selectors, text, ARIA roles, or stable classes/IDs). DO NOT use the \`data-playwright-a11y-id\` attribute in your Playwright locators!
- If an element violates a rule, write an assertion that EXPECTS it to meet the rule (e.g. if an img lacks an alt, write \`await expect(page.locator('img.logo')).toHaveAttribute('alt', /.+/)\` so the test will accurately fail until the user fixes their code).
- Wrap the TypeScript code in a single \`\`\`typescript block.

Start your response now.
`;

        const response = await options.ai.models.generateContent({
            model: options.model,
            contents: [
                prompt,
                {
                    inlineData: {
                        data: options.screenshot,
                        mimeType: 'image/jpeg'
                    }
                }
            ],
        });

        return response.text ?? 'No evaluation produced.';
    }
}
