import { A11yRule } from './Rule.js';
export class HeadingStructureRule extends A11yRule {
    id = 2;
    description = 'Logical heading structure';
    selector = 'h1, h2, h3, h4, h5, h6';
    promptText = '2. Headings: The page must have a logical heading structure (H1 -> H2 -> H3) without skipping levels.';
}
