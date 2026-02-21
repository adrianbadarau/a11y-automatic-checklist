import { GoogleGenAI } from '@google/genai';
export class A11yEvaluator {
    ai;
    model = 'gemini-2.5-flash';
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY environment variable. Please set it.");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }
    async evaluatePage(url, html, ariaTree, screenshot, rules) {
        const options = {
            ai: this.ai,
            model: this.model,
            url,
            html,
            ariaTree,
            screenshot
        };
        const rulePromises = rules.map(rule => rule.evaluate(options));
        const results = await Promise.all(rulePromises);
        let combinedReport = `## Integrated Accessibility Evaluation Report\n\n`;
        let combinedTestCode = `import { test, expect } from '@playwright/test';\n\n`;
        combinedTestCode += `test.describe('Accessibility Requirements', () => {\n`;
        combinedTestCode += `  test.beforeEach(async ({ page }) => {\n`;
        combinedTestCode += `    await page.goto("${url}");\n`;
        combinedTestCode += `  });\n\n`;
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            const result = results[i];
            combinedReport += `### Rule ${rule.id}: ${rule.description}\n`;
            // Extract the report part
            const reportMatch = result.match(/## Evaluation Report\n([\s\S]*?)(?=## Playwright Test|$)/i);
            if (reportMatch && reportMatch[1]) {
                combinedReport += reportMatch[1].trim() + '\n\n';
            }
            else {
                combinedReport += "No specific report generated for this rule.\n\n";
            }
            // Extract the test part
            const testMatch = result.match(/```typescript\n([\s\S]*?)```/);
            if (testMatch && testMatch[1]) {
                const codeBlock = testMatch[1].trim();
                combinedTestCode += `  // Test cases for Rule ${rule.id}: ${rule.description}\n`;
                // Indent each line
                const indentedCode = codeBlock.split('\n').map(line => `  ${line}`).join('\n');
                combinedTestCode += `${indentedCode}\n\n`;
            }
        }
        combinedTestCode += `});\n`;
        // We assemble the final text similarly to what we had before, 
        // returning both the markdown and the typescript block for the CLI to parse.
        return `${combinedReport}\n\n## Playwright Test\n\`\`\`typescript\n${combinedTestCode}\n\`\`\``;
    }
}
