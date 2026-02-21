import { A11yRule } from './Rule.js';
export class KeyboardNavRule extends A11yRule {
    id = 8;
    description = 'Keyboard Navigation focus traps';
    selector = 'a, button, input, select, textarea, [tabindex="0"]';
    promptText = '8. Keyboard Navigation: Interactive elements must not trap focus and should have a visible focus indicator.';
}
