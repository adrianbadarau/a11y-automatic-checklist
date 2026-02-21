import { describe, it, expect, vi } from 'vitest';
import { A11yEvaluator } from '../src/evaluator.js';

// Mock the GoogleGenAI sdk
vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            models = {
                generateContent: vi.fn().mockResolvedValue({
                    text: '## Evaluation Report\nEverything passed!\n\n```typescript\n// fake test\n```'
                })
            };
        }
    };
});

describe('A11yEvaluator', () => {
    it('should require an API key', () => {
        expect(() => {
            new A11yEvaluator();
        }).toThrow(/Missing GEMINI_API_KEY/);
    });

    it('should initialize when API key is provided', () => {
        const evaluator = new A11yEvaluator('fake-key');
        expect(evaluator).toBeDefined();
    });

    it('should evaluate page content and return the generated text', async () => {
        const evaluator = new A11yEvaluator('fake-key');
        const url = 'http://example.com';
        const html = '<html><body><h1>Test</h1></body></html>';
        const ariaTree = '{}';

        const mockRule = {
            id: 1,
            description: 'Mock',
            evaluate: vi.fn().mockResolvedValue('## Evaluation Report\nEverything passed!\n\n```typescript\ntest("mock", async ({ page }) => {});\n```')
        } as any;

        const result = await evaluator.evaluatePage(url, html, ariaTree, [mockRule]);
        expect(result).toContain('Evaluation Report');
        expect(result).toContain('test("mock"');
    });
});
