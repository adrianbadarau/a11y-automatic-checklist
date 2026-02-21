import { describe, it, expect, vi, beforeEach } from 'vitest';
import { A11yEvaluator } from '../src/evaluator.js';

const mockGenerateContent = vi.fn().mockResolvedValue({
    text: '## Evaluation Report\nEverything passed!\n\n```typescript\n// fake test\n```'
});

// Mock the GoogleGenAI sdk
vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            models = {
                generateContent: mockGenerateContent
            };
        }
    };
});

describe('A11yEvaluator', () => {
    beforeEach(() => {
        mockGenerateContent.mockClear();
    });

    it('should require an API key', () => {
        expect(() => {
            new A11yEvaluator();
        }).toThrow(/Missing GEMINI_API_KEY/);
    });

    it('should initialize when API key is provided', () => {
        const evaluator = new A11yEvaluator('fake-key');
        expect(evaluator).toBeDefined();
    });

    it('should evaluate page content and return the generated text without image', async () => {
        const evaluator = new A11yEvaluator('fake-key');
        const url = 'http://example.com';
        const html = '<html><body><h1>Test</h1></body></html>';
        const ariaTree = '{}';

        const result = await evaluator.evaluatePage(url, html, ariaTree);
        expect(result).toContain('Evaluation Report');
        expect(result).toContain('fake test');

        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const args = mockGenerateContent.mock.calls[0][0];
        // Before multimodal it was a string or an object with contents string
        expect(typeof args.contents === 'string' || Array.isArray(args.contents)).toBeTruthy();
    });

    it('should successfully pass image data to the model if provided', async () => {
        const evaluator = new A11yEvaluator('fake-key');
        const url = 'http://example.com';
        const html = '<html><body><h1>Test</h1></body></html>';
        const ariaTree = '{}';
        const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        await evaluator.evaluatePage(url, html, ariaTree, base64Image);

        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const args = mockGenerateContent.mock.calls[0][0];

        // After multimodal, contents should be an array
        expect(Array.isArray(args.contents)).toBe(true);
        expect(args.contents.length).toBe(2);

        // First part is text
        expect(typeof args.contents[0]).toBe('string');

        // Second part is the image inlineData
        expect(args.contents[1]).toEqual({
            inlineData: {
                data: base64Image,
                mimeType: "image/png"
            }
        });
    });
});
