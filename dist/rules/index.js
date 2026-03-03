import { ImageAltRule } from './ImageAltRule.js';
import { HeadingStructureRule } from './HeadingStructureRule.js';
import { FormLabelsRule } from './FormLabelsRule.js';
import { LinksButtonsRule } from './LinksButtonsRule.js';
import { AriaRolesRule } from './AriaRolesRule.js';
import { ColorContrastRule } from './ColorContrastRule.js';
import { PageTitleLangRule } from './PageTitleLangRule.js';
import { KeyboardNavRule } from './KeyboardNavRule.js';
import { LandmarksRule } from './LandmarksRule.js';
import { TablesRule } from './TablesRule.js';
import { ListsRule } from './ListsRule.js';
import { IframesRule } from './IframesRule.js';
import { MultimediaRule } from './MultimediaRule.js';
import { VisualCuesRule } from './VisualCuesRule.js';
export const allRules = [
    new ImageAltRule(),
    new HeadingStructureRule(),
    new FormLabelsRule(),
    new LinksButtonsRule(),
    new AriaRolesRule(),
    new ColorContrastRule(),
    new PageTitleLangRule(),
    new KeyboardNavRule(),
    new LandmarksRule(),
    new TablesRule(),
    new ListsRule(),
    new IframesRule(),
    new MultimediaRule(),
    new VisualCuesRule()
];
export { ImageAltRule, HeadingStructureRule, FormLabelsRule, LinksButtonsRule, AriaRolesRule, ColorContrastRule, PageTitleLangRule, KeyboardNavRule, LandmarksRule, TablesRule, ListsRule, IframesRule, MultimediaRule, VisualCuesRule };
export { A11yRule } from './Rule.js';
