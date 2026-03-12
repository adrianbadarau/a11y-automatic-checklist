import { A11yRule } from './Rule.js';

export class MultimediaRule extends A11yRule {
    readonly id = 13;
    readonly description = 'Multimedia, Animations, and Motion';
    readonly selector = 'audio, video, [autoplay], [role="application"]';
    readonly promptText = '13. Multimedia/Motion: Prerecorded audio-only MUST have a transcript. Prerecorded video MUST have audio description and text alternative. Autoplaying media over 5 seconds MUST provide a method to pause/stop/hide. Content MUST NOT flash more than 3 times per second (WCAG 2.3.1).';
}
