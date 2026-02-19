#!/usr/bin/env node

import { Command } from 'commander';
import { BrowserAdapter } from './browser.js';
import { A11yEvaluator } from './evaluator.js';
import { rules } from './rules.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

dotenv.config();

const program = new Command();

program
    .name('playwright-a11y-checklist')
    .description('Evaluate a web page against Deque accessibility rules using Gemini AI and generate a Playwright test.')
    .version('1.0.0');

program
    .command('check')
    .description('Run an accessibility check on a specific URL or an attached browser')
    .option('-u, --url <url>', 'URL of the page to evaluate')
    .option('-d, --debugger-url <url>', 'URL of an open Chrome CDP interface (e.g. http://localhost:9222)')
    .option('-o, --output-test <filename>', 'Where to save the generated Playwright test script', 'generated-a11y.spec.ts')
    .option('-v, --visual', 'Visually highlight elements matching current checking rules in browser')
    .action(async (options) => {
        if (!options.url && !options.debuggerUrl) {
            console.error('Error: You must provide either --url or --debugger-url');
            process.exit(1);
        }

        const browserAdapter = new BrowserAdapter();
        const evaluator = new A11yEvaluator(process.env.GEMINI_API_KEY);

        try {
            if (options.debuggerUrl) {
                console.log(`Attaching to existing browser at ${options.debuggerUrl}...`);
                await browserAdapter.attachToDebugger(options.debuggerUrl);
            } else if (options.url) {
                console.log(`Launching ${options.visual ? 'headed' : 'headless'} browser and navigating to ${options.url}...`);
                await browserAdapter.init(options.url, options.visual);
            }

            if (options.visual) {
                console.log('Running visual playback of accessibility rules...');
                await browserAdapter.visualizeRules(rules);
            }

            console.log('Capturing DOM and Accessibility tree...');
            const snapshot = await browserAdapter.getPageSnapshot();

            console.log('Sending snapshot to Gemini for evaluation against Deque rules...');
            const resultText = await evaluator.evaluatePage(snapshot.url, snapshot.html, snapshot.ariaTree);

            // Print the full evaluation report
            console.log('\n========================================');
            console.log('          EVALUATION REPORT             ');
            console.log('========================================\n');
            console.log(resultText);

            // Extract the Playwright test code block
            const tsMatch = resultText.match(/```typescript\n([\s\S]*?)```/);
            if (tsMatch && tsMatch[1]) {
                const testCode = tsMatch[1];
                const outPath = path.resolve(process.cwd(), options.outputTest);
                await fs.writeFile(outPath, testCode, 'utf-8');
                console.log(`\n✅ Successfully generated Playwright test script at: ${outPath}`);
            } else {
                console.log(`\n⚠️ No typescript block found in Gemini's response. Test script not generated.`);
            }

        } catch (err: any) {
            console.error('\nError during execution:', err.message);
        } finally {
            if (!options.url) {
                console.log('Evaluation finished. Detaching CDP...');
            }
            await browserAdapter.close();
        }
    });

program.parse();
