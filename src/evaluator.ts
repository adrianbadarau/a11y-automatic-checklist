import { GoogleGenAI } from '@google/genai';
import { A11yRule, RuleOptions } from './rules/index.js';

export class A11yEvaluator {
    private ai: GoogleGenAI;
    private model = 'gemini-2.5-flash';

    constructor(apiKey?: string) {
        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY environment variable. Please set it.");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    async evaluatePage(initialUrl: string, browserAdapter: any, rules: A11yRule[], options: { containerId?: string, visual?: boolean } = {}): Promise<string> {
        let additionalSelectors: string[] = [];
        let html = "";
        let ariaTree = "";
        let screenshot = "";
        let url = initialUrl;

        const MAX_ITERATIONS = 3;
        for (let i = 0; i < MAX_ITERATIONS; i++) {
            const isLastIteration = i === MAX_ITERATIONS - 1;
            const keepBadges = options.visual || isLastIteration;

            const snapshot = await browserAdapter.applyBadges(additionalSelectors, {
                visual: options.visual,
                keepBadges,
                containerId: options.containerId
            });

            html = snapshot.html;
            ariaTree = snapshot.ariaTree;
            screenshot = snapshot.screenshot;
            url = snapshot.url;

            if (isLastIteration) {
                break;
            }

            const iterationPrompt = `
You are an expert web accessibility evaluator. 
I have attached a screenshot of a web page that has been annotated with numbered red badges.
Are there any visually apparent interactive or semantic elements (like background images or headings) on the page that LACK a numbered red badge?
If so, provide a JSON array of precise CSS selectors for these elements.
If not, or if all important elements are already badged, return an empty array [].
Respond ONLY with the JSON array.
`;
            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: [
                    iterationPrompt,
                    {
                        inlineData: {
                            data: screenshot,
                            mimeType: 'image/jpeg'
                        }
                    }
                ],
            });

            const text = response.text || "[]";
            let newSelectors: string[] = [];
            try {
                // Strip markdown code block formatting if present
                let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                newSelectors = JSON.parse(cleanText);
            } catch (e) {
                console.warn("Failed to parse LLM selector suggestion. Raw text:", text);
            }

            if (newSelectors.length === 0) {
                // LLM found no missing elements
                break;
            }

            additionalSelectors.push(...newSelectors);
        }

        const ruleOptions: RuleOptions = {
            ai: this.ai,
            model: this.model,
            url,
            html,
            ariaTree,
            screenshot
        };

        const rulePromises = rules.map(rule => rule.evaluate(ruleOptions));
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
            } else {
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
