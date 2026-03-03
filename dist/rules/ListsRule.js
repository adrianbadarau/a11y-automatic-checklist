import { A11yRule } from './Rule.js';
export class ListsRule extends A11yRule {
    id = 11;
    description = 'Semantic Lists';
    selector = 'ul, ol, dl, li, dt, dd, [role="list"], [role="listitem"]';
    promptText = '11. Lists: Lists MUST be constructed using appropriate semantic markup (e.g., `<ul>` or `<ol>` with `<li>` children, or `<dl>` with `<dt>` and `<dd>` children, or ARIA equivalent roles). Content that visually appears as a list must use semantic list markup.';
}
