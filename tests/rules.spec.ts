import { describe, it, expect, vi } from 'vitest';
import { allRules, ImageAltRule } from '../src/rules/index.js';

describe('Modular A11y Rules', () => {
    it('should export all 8 rules in the allRules array', () => {
        expect(allRules.length).toBe(8);
    });

    it('each rule should have an id, description, and selector', () => {
        for (const rule of allRules) {
            expect(rule.id).toBeDefined();
            expect(typeof rule.description).toBe('string');
            expect(typeof rule.selector).toBe('string');
        }
    });

    it('should instantiate individual rules correctly', () => {
        const imgRule = new ImageAltRule();
        expect(imgRule.id).toBe(1);
        expect(imgRule.selector).toBe('img');
        expect(imgRule.description).toContain('Images missing alt');
    });

    it('should format evaluate prompt correctly for a rule', async () => {
        const mockAi = {
            models: {
                generateContent: vi.fn().mockResolvedValue({ text: 'mock AI response' })
            }
        };
        const rule = new ImageAltRule();
        const res = await rule.evaluate({
            ai: mockAi as any,
            model: 'test-model',
            url: 'http://test.com',
            html: '<img src="a.png" />',
            ariaTree: '{}'
        });

        expect(res).toBe('mock AI response');
        expect(mockAi.models.generateContent).toHaveBeenCalled();

        const callArgs = mockAi.models.generateContent.mock.calls[0][0];
        expect(callArgs.model).toBe('test-model');
        expect(callArgs.contents).toContain('Images: All `<img>` elements must have an `alt` attribute');
    });
});

