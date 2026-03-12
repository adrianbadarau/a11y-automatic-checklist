import { A11yRule } from './Rule.js';

export class KeyboardNavRule extends A11yRule {
    readonly id = 8;
    readonly description = 'Keyboard Navigation focus traps';
    readonly selector = 'a, button, input, select, textarea, [tabindex="0"]';
    readonly promptText = '8. Keyboard Navigation: Interactive elements must not trap focus (WCAG 2.1.2). Positive `tabindex` values must not be used. Ensure no elements are obscured when receiving focus (WCAG 2.4.11 Focus Not Obscured). Visual focus indicators must be highly visible and enhanced.';
}
