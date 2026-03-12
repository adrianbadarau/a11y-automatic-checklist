import { A11yRule } from './Rule.js';

export class IframesRule extends A11yRule {
    readonly id = 12;
    readonly description = 'Iframes explicitly titled';
    readonly selector = 'iframe';
    readonly promptText = '12. Iframes: Every `<iframe>` MUST have a unique, accurate, and descriptive `title` attribute. If an iframe conveys no content to users (e.g. tracking scripts), it must be hidden using `aria-hidden="true"`.';
}
