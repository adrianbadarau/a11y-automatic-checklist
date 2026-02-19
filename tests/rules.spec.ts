import { describe, it, expect } from 'vitest';
import { dequeA11yRuleset, rules } from '../src/rules.js';

describe('A11y Ruleset', () => {
    it('should be a string that contains the ruleset prompt', () => {
        expect(typeof dequeA11yRuleset).toBe('string');
        expect(dequeA11yRuleset.length).toBeGreaterThan(0);
    });

    it('should include key rule categories in the prompt string', () => {
        expect(dequeA11yRuleset).toContain('Images:');
        expect(dequeA11yRuleset).toContain('Headings:');
        expect(dequeA11yRuleset).toContain('Forms:');
    });

    it('should export a structured array of rules for visualization', () => {
        expect(Array.isArray(rules)).toBe(true);
        expect(rules.length).toBeGreaterThan(0);

        // Assert structure of the first rule
        const firstRule = rules[0];
        expect(firstRule).toHaveProperty('id');
        expect(firstRule).toHaveProperty('description');
        expect(firstRule).toHaveProperty('selector');
    });
});
