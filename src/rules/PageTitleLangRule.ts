import { A11yRule } from './Rule.js';

export class PageTitleLangRule extends A11yRule {
    readonly id = 7;
    readonly description = 'Page Title & Language';
    readonly selector = 'html, title';
    protected readonly promptText = '7. Page Title & Language: The document must have a descriptive `<title>` and a valid `<html lang="en">` attribute.';
}
