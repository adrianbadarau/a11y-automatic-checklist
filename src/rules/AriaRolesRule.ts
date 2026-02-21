import { A11yRule } from './Rule.js';

export class AriaRolesRule extends A11yRule {
    readonly id = 5;
    readonly description = 'ARIA roles and attributes';
    readonly selector = '[aria-hidden], [role]';
    protected readonly promptText = '5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents, and ARIA should only be used when native HTML elements fall short.';
}
