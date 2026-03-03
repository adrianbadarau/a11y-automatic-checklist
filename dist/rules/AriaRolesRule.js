import { A11yRule } from './Rule.js';
export class AriaRolesRule extends A11yRule {
    id = 5;
    description = 'ARIA roles and attributes';
    selector = '[aria-hidden], [role]';
    promptText = '5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents. HTML elements must be preferred over ARIA equivalent roles. Initial ARIA states (e.g., `aria-expanded="false"`) must be defined and accurately represent the current visual/functional state (WCAG 4.1.2).';
}
