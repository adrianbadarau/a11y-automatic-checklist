import { A11yRule } from './Rule.js';
export class FormLabelsRule extends A11yRule {
    id = 3;
    description = 'Form labels';
    selector = 'input, textarea, select';
    promptText = '3. Forms: Every form input must have an associated `<label>` or `aria-label`/`aria-labelledby`.';
}
