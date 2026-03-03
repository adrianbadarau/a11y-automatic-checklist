import { A11yRule } from './Rule.js';
export class PageTitleLangRule extends A11yRule {
    id = 7;
    description = 'Page Title & Language';
    selector = 'html, title';
    fullPageOnly = true;
    promptText = '7. Page Title & Language: The primary language of the page MUST be identified accurately on the `<html>` element. Elements with language changes must use inline `lang` attributes (WCAG 3.1.2). The page `<title>` must be accurate, unique, concise, and ideally match the main `<h1>` (WCAG 2.4.2).';
}
