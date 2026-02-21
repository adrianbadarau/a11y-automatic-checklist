import { A11yRule } from './Rule.js';

export class ColorContrastRule extends A11yRule {
    readonly id = 6;
    readonly description = 'Color Contrast';
    readonly selector = 'body, p, span, div';
    protected readonly promptText = '6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text). *Note: Approximate this based on your knowledge if exact computed styles are not fully provided, but point it out.*';
}
