import { GoogleGenAI } from '@google/genai';

export interface RuleOptions {
    ai: GoogleGenAI;
    model: string;
    url: string;
    html: string;
    ariaTree: string;
}

export abstract class A11yRule {
    abstract readonly id: number;
    abstract readonly description: string;
    abstract readonly selector: string;
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

Provide two sections in your response:
1. "## Evaluation Report": A markdown summary of any accessibility violations found related to this specific rule, referencing specific elements or roles. Also note what passes if it's prominently accessible. If no elements match this rule, state that clearly.
2. "## Playwright Test": One or more valid Playwright \`test('...', async ({ page }) => { ... })\` blocks that cover regressions for the elements mentioned.

CRITICAL TEST REQUIREMENTS:
- DO NOT include \`import\` statements, \`test.describe\`, or \`test.beforeEach\` blocks. Only provide the \`test(...)\` blocks themselves.
- DO NOT generate generic assertions. Your locators (e.g. \`page.locator('...')\`) MUST specifically target the exact elements, IDs, classes, or text contents you found in the provided HTML snapshot and Accessibility Tree that relate to this rule.
- If an element violates a rule, write an assertion that EXPECTS it to meet the rule (e.g. if an img lacks an alt, write \`await expect(page.locator('img.logo')).toHaveAttribute('alt', /.+/)\` so the test will accurately fail until the user fixes their code).
- Wrap the TypeScript code in a single \`\`\`typescript block.

Start your response now.
`;

        const response = await options.ai.models.generateContent({
            model: options.model,
            contents: prompt,
        });

        return response.text ?? 'No evaluation produced.';
    }
}
