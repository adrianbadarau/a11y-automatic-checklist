import { ImageAltRule } from './ImageAltRule.js';
import { HeadingStructureRule } from './HeadingStructureRule.js';
import { FormLabelsRule } from './FormLabelsRule.js';
import { LinksButtonsRule } from './LinksButtonsRule.js';
import { AriaRolesRule } from './AriaRolesRule.js';
import { ColorContrastRule } from './ColorContrastRule.js';
import { PageTitleLangRule } from './PageTitleLangRule.js';
import { KeyboardNavRule } from './KeyboardNavRule.js';
export const allRules = [
    new ImageAltRule(),
    new HeadingStructureRule(),
    new FormLabelsRule(),
    new LinksButtonsRule(),
    new AriaRolesRule(),
    new ColorContrastRule(),
    new PageTitleLangRule(),
    new KeyboardNavRule()
];
export { ImageAltRule, HeadingStructureRule, FormLabelsRule, LinksButtonsRule, AriaRolesRule, ColorContrastRule, PageTitleLangRule, KeyboardNavRule };
export { A11yRule } from './Rule.js';
