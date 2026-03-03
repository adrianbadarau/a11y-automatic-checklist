import { A11yRule } from './Rule.js';

export class FormLabelsRule extends A11yRule {
    readonly id = 3;
    readonly description = 'Form labels';
    readonly selector = 'input, textarea, select';
    protected readonly promptText = '3. Forms: Every form input must have a visible, programmatically associated `<label>` or `aria-label`/`aria-labelledby`. Group labels must be used for related inputs. Detect missing `aria-invalid` or error suggestions (WCAG 3.3.3), require error prevention for legal/financial/user data (WCAG 3.3.4), and check for Redundant Entry requirements (WCAG 3.3.7).';
}
