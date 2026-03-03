import { A11yRule } from './Rule.js';
export class FormLabelsRule extends A11yRule {
    id = 3;
    description = 'Form labels';
    selector = 'input, textarea, select';
    promptText = '3. Forms: Every form input must have a visible, programmatically associated `<label>` or `aria-label`/`aria-labelledby`. Group labels must be used for related inputs. Detect missing `aria-invalid` or error suggestions (WCAG 3.3.3), require error prevention for legal/financial/user data (WCAG 3.3.4), and check for Redundant Entry requirements (WCAG 3.3.7).';
}
