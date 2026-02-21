import { A11yRule } from './Rule.js';

export class FormLabelsRule extends A11yRule {
    readonly id = 3;
    readonly description = 'Form labels';
    readonly selector = 'input, textarea, select';
    protected readonly promptText = '3. Forms: Every form input must have an associated `<label>` or `aria-label`/`aria-labelledby`.';
}
