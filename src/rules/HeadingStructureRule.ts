import { A11yRule } from './Rule.js';

export class HeadingStructureRule extends A11yRule {
    readonly id = 2;
    readonly description = 'Logical heading structure';
    readonly selector = 'h1, h2, h3, h4, h5, h6';
    protected readonly promptText = '2. Headings: The page must have a logical heading structure (H1 -> H2 -> H3) without skipping hierarchical levels. Headings must be accurate, informative, and concise. Ideally, there is only one `<h1>` in the document, starting the main content (WCAG 1.3.1, 2.4.6).';
}
