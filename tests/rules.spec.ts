import { describe, it, expect } from 'vitest';
import { dequeA11yRuleset } from '../src/rules.js';

describe('A11y Ruleset', () => {
    it('should be a string that contains the ruleset prompt', () => {
        expect(typeof dequeA11yRuleset).toBe('string');
        expect(dequeA11yRuleset.length).toBeGreaterThan(0);
    });

    it('should include key rule categories', () => {
        expect(dequeA11yRuleset).toContain('Images');
        expect(dequeA11yRuleset).toContain('Headings');
        expect(dequeA11yRuleset).toContain('Forms');
        expect(dequeA11yRuleset).toContain('Links and Buttons');
        expect(dequeA11yRuleset).toContain('ARIA');
        expect(dequeA11yRuleset).toContain('Color Contrast');
        expect(dequeA11yRuleset).toContain('Page Title & Language');
        expect(dequeA11yRuleset).toContain('Keyboard Navigation');
    });
});
