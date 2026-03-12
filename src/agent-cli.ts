#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AgentA11yEvaluator } from './agent-evaluator.js';
import { allRules } from './rules/index.js';

dotenv.config();

const program = new Command();

program
    .name('playwright-a11y-checklist-agent')
    .description('Evaluate a web page against Deque accessibility rules using Gemini AI CLI SDK via MCP.')
    .version('1.0.0');

program
    .command('check')
    .description('Run an accessibility check on a specific URL using the Gemini CLI Agent and MCP tools.')
    .option('-u, --url <url>', 'URL of the page to evaluate')
    .option('-r, --rule <id>', 'Run only a specific rule by its ID')
    .option('-m, --model <name>', 'The Gemini model to use', 'gemini-3-flash-preview')
    .action(async (options) => {
        if (!options.url) {
            console.error('Error: You must provide a --url');
            process.exit(1);
        }

        try {
            console.log(`Starting agent evaluation for ${options.url} using model ${options.model}...`);
            
            let rulesToRun = allRules;
            if (options.rule) {
                const ruleId = parseInt(options.rule, 10);
                rulesToRun = allRules.filter(r => r.id === ruleId);
                if (rulesToRun.length === 0) {
                    console.error(`Error: Rule with ID ${options.rule} not found.`);
                    process.exit(1);
                }
            }
            
            const evaluator = new AgentA11yEvaluator(options.model);
            const report = await evaluator.evaluatePage(options.url, rulesToRun);
            
            console.log('\n========================================');
            console.log('          EVALUATION REPORT             ');
            console.log('========================================\n');
            console.log(report);
            
        } catch (err: any) {
            console.error('\nError during execution:', err.message);
        }
    });

program.parse();
