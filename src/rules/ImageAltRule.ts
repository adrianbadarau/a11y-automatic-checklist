import { A11yRule } from './Rule.js';

export class ImageAltRule extends A11yRule {
    readonly id = 1;
    readonly description = 'Images missing alt attributes';
    readonly selector = 'img';
    protected readonly promptText = '1. Images: All `<img>` elements must have an `alt` attribute. Decorative images should have empty `alt=""`.';
}
