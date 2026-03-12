import { A11yRule } from './Rule.js';

export class VisualCuesRule extends A11yRule {
    readonly id = 14;
    readonly description = 'Sensory Characteristics and Visual Cues';
    readonly selector = 'body';
    readonly fullPageOnly = true;
    readonly promptText = '14. Visual Cues: Content MUST NOT rely solely on visual characteristics such as shape, size, visual location, or orientation to convey meaning (WCAG 1.3.3). Any information conveyed by color MUST be accompanied by a programmatically discernible text alternative or visual pattern.';
}
