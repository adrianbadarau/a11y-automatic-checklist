import { GeminiCliAgent } from '@google/gemini-cli-sdk';
import { GeminiEventType } from '@google/gemini-cli-core';
import { A11yRule } from './rules/index.js';

export class AgentA11yEvaluator {
    private agent: GeminiCliAgent | null = null;
    private model: string;

    constructor(model: string = 'gemini-3-flash-preview') {
        this.model = model;
    }

    async evaluatePage(url: string, rules: A11yRule[]): Promise<string> {
        let systemInstructions = `
You are an expert web accessibility evaluator. 
Your objective is to evaluate the accessibility of a web page using the Chrome Dev Tools MCP server.
You will navigate to the page, inspect the DOM structure, evaluate it against specific WCAG rules, and provide a comprehensive report.

Here are the WCAG rules you must evaluate the page against:

`;
        rules.forEach(rule => {
            systemInstructions += `--- Rule ${rule.id}: ${rule.description} ---\n`;
            systemInstructions += `${rule.promptText}\n\n`;
        });

        systemInstructions += `
CRITICAL INSTRUCTIONS:
1. Use your MCP tools to navigate to the URL: ${url}
2. Use your MCP tools to get the DOM tree, accessibility tree, and any necessary information about the page. Do NOT make up the DOM; query the actual page.
3. Once you have sufficient context, output an Accessibility Evaluation Report.
4. For each rule, provide a markdown section summarizing violations or validations.

Format the output strictly as a markdown report. Provide two sections for each rule:
1. "## Evaluation Report": A markdown summary of any violations found related to the rule. Reference specific elements or roles. If no elements match this rule, state that clearly.
2. "## Playwright Test": One or more valid Playwright \`test('...', async ({ page }) => { ... })\` blocks that cover regressions for the elements mentioned. 
   - DO NOT INCLUDE ANY \`import\` STATEMENTS WHATSOEVER.
   - DO NOT include \`test.describe\`, or \`test.beforeEach\` blocks. Only provide the \`test(...)\` blocks themselves.
   - You MUST use standard Playwright locators (e.g. \`page.locator('...')\`) targeting the exact elements using robust selectors.
   - Wrap the TypeScript code in a single \`\`\`typescript block.

Start exploring the page now.
`;

        this.agent = new GeminiCliAgent({
            instructions: systemInstructions,
            model: this.model,
            // To use MCP tools with the agent, we must enable MCP and extensions.
            // @ts-ignore - Temporary cast to bypass typescript limitations if types are incomplete
            extensionsEnabled: true,
            mcpEnabled: true, 
             // Note: Depending on the specific iteration of the SDK, you may need to pass tools manually
             // or the agent CLI core automatically loads standard MCP servers config from ~/.gemini
        });

        let finalReport = "";

        const session = this.agent.session();
        const stream = session.sendStream(`Start the evaluation of ${url}`);

        for await (const chunk of stream) {
            if (chunk.type === GeminiEventType.Content && typeof chunk.value === 'string') {
                process.stdout.write(chunk.value);
                finalReport += chunk.value;
            } else if (chunk.type === GeminiEventType.ToolCallRequest) {
                console.log(`\n[Agent is using tool: ${chunk.value.name}]`);
            }
        }

        return finalReport;
    }
}
