import { A11yRule } from './Rule.js';
export class AriaRolesRule extends A11yRule {
    id = 5;
    description = 'ARIA roles and attributes';
    selector = '[aria-hidden], [role]';
    promptText = '5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents, and ARIA should only be used when native HTML elements fall short.';
}
