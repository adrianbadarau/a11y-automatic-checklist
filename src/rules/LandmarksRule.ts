import { A11yRule } from './Rule.js';

export class LandmarksRule extends A11yRule {
    readonly id = 9;
    readonly description = 'Semantic Landmarks and Regions';
    readonly selector = 'header, main, footer, nav, aside, form, search, [role="banner"], [role="main"], [role="contentinfo"], [role="navigation"], [role="search"], [role="region"]';
    readonly fullPageOnly = true;
    protected readonly promptText = '9. Landmarks: The page layout MUST be organized using semantic landmarks (header, main, footer, nav). All text should be contained within a landmark region. A page must not contain more than one instance of header/banner, main, and footer/contentinfo unless in scoped sections. Multiple identical landmarks (e.g., two navs) must have distinct `aria-label` names to differentiate them.';
}
