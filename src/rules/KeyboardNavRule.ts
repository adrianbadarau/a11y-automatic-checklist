import { A11yRule } from './Rule.js';

export class KeyboardNavRule extends A11yRule {
    readonly id = 8;
    readonly description = 'Keyboard Navigation focus traps';
    readonly selector = 'a, button, input, select, textarea, [tabindex="0"]';
    protected readonly promptText = '8. Keyboard Navigation: Interactive elements must not trap focus and should have a visible focus indicator.';
}
