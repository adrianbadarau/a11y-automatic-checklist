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
    async evaluatePage(initialUrl, browserAdapter, rules, options = {}) {
        let additionalSelectors = [];
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
            let newSelectors = [];
            try {
                // Strip markdown code block formatting if present
                let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                newSelectors = JSON.parse(cleanText);
            }
            catch (e) {
                console.warn("Failed to parse LLM selector suggestion. Raw text:", text);
            }
            if (newSelectors.length === 0) {
                // LLM found no missing elements
                break;
            }
            additionalSelectors.push(...newSelectors);
        }
        const ruleOptions = {
            ai: this.ai,
            model: this.model,
            url,
            html,
            ariaTree,
            screenshot,
            reportType: options.reportType
        };
        const rulePromises = rules.map(rule => rule.evaluate(ruleOptions));
        const results = await Promise.all(rulePromises);
        if (options.reportType === 'html') {
            const allIssues = [];
            for (let i = 0; i < rules.length; i++) {
                const result = results[i];
                try {
                    // Extract JSON block
                    const jsonMatch = result.match(/```json\n([\s\S]*?)```/);
                    const jsonText = jsonMatch ? jsonMatch[1] : result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    const issues = JSON.parse(jsonText);
                    if (Array.isArray(issues)) {
                        allIssues.push(...issues);
                    }
                }
                catch (e) {
                    console.warn(`Failed to parse HTML report JSON for Rule ${rules[i].id}:`, e);
                }
            }
            // Gather screenshots for issues
            for (const issue of allIssues) {
                if (issue.element && issue.element.badgeNumber) {
                    try {
                        issue.element.screenshot = await browserAdapter.highlightAndScreenshotIssue(issue.element.badgeNumber);
                    }
                    catch (e) {
                        console.warn(`Failed to highlight/screenshot badge ${issue.element.badgeNumber}:`, e.message);
                    }
                }
            }
            // Generate HTML
            return this.generateHtmlReport(url, allIssues);
        }
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
    generateHtmlReport(url, issues) {
        const issuesHtml = issues.map((issue, index) => {
            const imgHtml = issue.element?.screenshot ? `<img src="data:image/jpeg;base64,${issue.element.screenshot}" alt="Issue Element highlighted" class="issue-screenshot" />` : '';
            return `
            <div class="card">
                <h3>Issue ${index + 1}: ${this.escapeHtml(issue.issue)}</h3>
                <div class="fix-section">
                    <strong>How to fix:</strong>
                    <p>${this.escapeHtml(issue.fix)}</p>
                </div>
                <div class="element-info">
                    <strong>Element Info:</strong>
                    <ul>
                        <li>ID: <code>${this.escapeHtml(issue.element?.id || 'N/A')}</code></li>
                        <li>Class: <code>${this.escapeHtml(issue.element?.cssClass || 'N/A')}</code></li>
                        <li>DOM Path: <code>${this.escapeHtml(issue.element?.path || 'N/A')}</code></li>
                    </ul>
                </div>
                ${imgHtml}
            </div>
            `;
        }).join('');
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Report for ${this.escapeHtml(url)}</title>
    <style>
        :root {
            --bg: #1a1a1a;
            --surface: #2d2d2d;
            --primary: #bb86fc;
            --text-main: #e0e0e0;
            --text-muted: #a0a0a0;
            --border: #404040;
            --danger: #cf6679;
        }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: var(--bg); 
            color: var(--text-main); 
            line-height: 1.6;
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
        }
        h1 { color: var(--primary); text-align: center; margin-bottom: 40px; }
        .card { 
            background: var(--surface); 
            border: 1px solid var(--border); 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 24px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-2px); }
        h3 { color: var(--danger); margin-top: 0; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
        .fix-section { background: rgba(187, 134, 252, 0.1); padding: 12px; border-radius: 4px; margin: 15px 0; border-left: 4px solid var(--primary); }
        .element-info ul { list-style: none; padding: 0; margin: 10px 0; }
        .element-info li { margin-bottom: 5px; color: var(--text-muted); }
        code { background: #111; padding: 2px 6px; border-radius: 4px; color: #ffb74d; }
        .issue-screenshot { max-width: 100%; height: auto; border: 2px solid var(--border); border-radius: 4px; margin-top: 15px; display: block; }
        .empty-state { text-align: center; padding: 40px; color: var(--text-muted); background: var(--surface); border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Accessibility Report</h1>
        <p style="text-align:center; color: var(--text-muted); margin-bottom: 40px;">URL: <a href="${url}" style="color:var(--primary)">${this.escapeHtml(url)}</a></p>
        
        ${issues.length > 0 ? issuesHtml : '<div class="empty-state"><h3>🎉 No accessibility issues found!</h3><p>Your page looks great according to the evaluated rules.</p></div>'}
        
    </div>
</body>
</html>`;
    }
    escapeHtml(unsafe) {
        if (!unsafe)
            return '';
        return unsafe.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
