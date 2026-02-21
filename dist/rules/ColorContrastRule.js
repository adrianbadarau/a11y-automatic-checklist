import { A11yRule } from './Rule.js';
export class ColorContrastRule extends A11yRule {
    id = 6;
    description = 'Color Contrast';
    selector = 'body, p, span, div';
    promptText = '6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text). *Note: Approximate this based on your knowledge if exact computed styles are not fully provided, but point it out.*';
}
