import { describe, it, expect, vi } from 'vitest';
import { A11yEvaluator } from '../src/evaluator.js';

// Mock the GoogleGenAI sdk
vi.mock('@google/genai', () => {
    let callCount = 0;
    return {
        GoogleGenAI: class {
            models = {
                generateContent: vi.fn().mockImplementation(async () => {
                    callCount++;
                    if (callCount === 1) {
                        return { text: '```json\n[".missed-bg-image"]\n```' };
                    } else if (callCount === 2) {
                        return { text: '```json\n[]\n```' };
                    } else {
                        // Reset for subsequent tests
                        callCount = 0;
                        return { text: '## Evaluation Report\nEverything passed!\n\n```typescript\ntest("mock", async ({ page }) => {});\n```' };
                    }
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

    it('should evaluate page content and return the generated text, going through the iterative loop', async () => {
        const evaluator = new A11yEvaluator('fake-key');
        const url = 'http://example.com';

        let applyBadgesCalled = 0;
        const mockBrowserAdapter = {
            applyBadges: vi.fn().mockImplementation(async (selectors) => {
                applyBadgesCalled++;
                return {
                    url,
                    html: '<html><body><h1 data-playwright-a11y-id="1">Test</h1></body></html>',
                    ariaTree: '{}',
                    screenshot: 'fake-base64-string'
                };
            })
        } as any;

        const mockRule = {
            id: 1,
            description: 'Mock',
            evaluate: vi.fn().mockResolvedValue('## Evaluation Report\nEverything passed!\n\n```typescript\ntest("mock", async ({ page }) => {});\n```')
        } as any;

        const result = await evaluator.evaluatePage(url, mockBrowserAdapter, [mockRule], { visual: false });

        expect(result).toContain('Evaluation Report');
        expect(result).toContain('test("mock"');
        expect(applyBadgesCalled).toBe(2); // Initial call + 1 LLM iteration that returned []
    });
});
