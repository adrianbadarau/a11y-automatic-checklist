export const rules = [
    {
        id: 1,
        description: 'Images missing alt attributes',
        selector: 'img',
        promptText: '1. Images: All `<img>` elements must have an `alt` attribute. Decorative images should have empty `alt=""`.'
    },
    {
        id: 2,
        description: 'Logical heading structure',
        selector: 'h1, h2, h3, h4, h5, h6',
        promptText: '2. Headings: The page must have a logical heading structure (H1 -> H2 -> H3) without skipping levels.'
    },
    {
        id: 3,
        description: 'Form labels',
        selector: 'input, textarea, select',
        promptText: '3. Forms: Every form input must have an associated `<label>` or `aria-label`/`aria-labelledby`.'
    },
    {
        id: 4,
        description: 'Links and Buttons',
        selector: 'a, button, [role="button"], [role="link"]',
        promptText: '4. Links and Buttons: Must be focusable, operable via Keyboard (Enter/Space), and have discernible text.'
    },
    {
        id: 5,
        description: 'ARIA roles and attributes',
        selector: '[aria-hidden], [role]',
        promptText: '5. ARIA: ARIA attributes must be valid, elements with ARIA roles must have required children/parents, and ARIA should only be used when native HTML elements fall short.'
    },
    {
        id: 6,
        description: 'Color Contrast',
        selector: 'body, p, span, div',
        promptText: '6. Color Contrast: Text must have sufficient contrast (at least 4.5:1 for normal text). *Note: Approximate this based on your knowledge if exact computed styles are not fully provided, but point it out.*'
    },
    {
        id: 7,
        description: 'Page Title & Language',
        selector: 'html, title',
        promptText: '7. Page Title & Language: The document must have a descriptive `<title>` and a valid `<html lang="en">` attribute.'
    },
    {
        id: 8,
        description: 'Keyboard Navigation focus traps',
        selector: 'a, button, input, select, textarea, [tabindex="0"]',
        promptText: '8. Keyboard Navigation: Interactive elements must not trap focus and should have a visible focus indicator.'
    }
];
export const dequeA11yRuleset = `
You are an expert accessibility evaluator using the Deque Accessibility Checklists as your primary reference.
Evaluate the provided web page representation against the following key Deque checklist categories:

${rules.map(r => r.promptText).join('\n')}

Please review the provided DOM/accessibility tree and summarize any violations of these rules. Keep it concise but specific to the elements found.
`;
