import { A11yRule } from './Rule.js';
export class ImageAltRule extends A11yRule {
    id = 1;
    description = 'Images missing alt attributes';
    selector = 'img';
    promptText = '1. Images: All `<img>` elements must have an `alt` attribute. Decorative images should have empty `alt=""`.';
}
