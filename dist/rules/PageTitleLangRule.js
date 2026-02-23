import { A11yRule } from './Rule.js';
export class PageTitleLangRule extends A11yRule {
    id = 7;
    description = 'Page Title & Language';
    selector = 'html, title';
    fullPageOnly = true;
    promptText = '7. Page Title & Language: The document must have a descriptive `<title>` and a valid `<html lang="en">` attribute.';
}
