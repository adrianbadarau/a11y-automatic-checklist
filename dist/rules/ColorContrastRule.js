import { A11yRule } from './Rule.js';
export class ColorContrastRule extends A11yRule {
    id = 6;
    description = 'Color Contrast';
    selector = 'body, p, span, div';
    promptText = '6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text, 3:1 for large text). UI control boundaries and visual focus indicators must also have at least a 3:1 contrast against adjacent colors (WCAG 1.4.11). *Note: Approximate this based on visual cues if exact computed styles are limited.*';
}
