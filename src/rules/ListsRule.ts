import { A11yRule } from './Rule.js';

export class ListsRule extends A11yRule {
    readonly id = 11;
    readonly description = 'Semantic Lists';
    readonly selector = 'ul, ol, dl, li, dt, dd, [role="list"], [role="listitem"]';
    protected readonly promptText = '11. Lists: Lists MUST be constructed using appropriate semantic markup (e.g., `<ul>` or `<ol>` with `<li>` children, or `<dl>` with `<dt>` and `<dd>` children, or ARIA equivalent roles). Content that visually appears as a list must use semantic list markup.';
}
