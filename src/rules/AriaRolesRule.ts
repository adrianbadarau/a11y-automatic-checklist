import { A11yRule } from './Rule.js';

export class AriaRolesRule extends A11yRule {
    readonly id = 5;
    readonly description = 'ARIA roles and attributes';
    readonly selector = '[aria-hidden], [role]';
    readonly promptText = '5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents. HTML elements must be preferred over ARIA equivalent roles. Initial ARIA states (e.g., `aria-expanded="false"`) must be defined and accurately represent the current visual/functional state (WCAG 4.1.2).';
}
