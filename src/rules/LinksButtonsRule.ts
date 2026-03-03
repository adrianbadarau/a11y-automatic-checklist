import { A11yRule } from './Rule.js';

export class LinksButtonsRule extends A11yRule {
    readonly id = 4;
    readonly description = 'Links and Buttons';
    readonly selector = 'a, button, [role="button"], [role="link"]';
    protected readonly promptText = '4. Links and Buttons: Must be focusable, operable via Keyboard (Enter/Space), and have discernible text that separates its purpose from other links. Links and buttons must have a Target Size of at least 24x24 CSS pixels (WCAG 2.5.8), show a visual focus indicator, and a visual hover cursor.';
}
