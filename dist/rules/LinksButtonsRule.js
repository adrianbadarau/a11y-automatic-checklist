import { A11yRule } from './Rule.js';
export class LinksButtonsRule extends A11yRule {
    id = 4;
    description = 'Links and Buttons';
    selector = 'a, button, [role="button"], [role="link"]';
    promptText = '4. Links and Buttons: Must be focusable, operable via Keyboard (Enter/Space), and have discernible text.';
}
