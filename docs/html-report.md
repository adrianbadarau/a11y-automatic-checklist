# HTML Accessibility Report Generation

This document details the HTML Accessibility Report feature, providing a standalone, visually rich format to analyze accessibility issues without executing Playwright tests.

## Feature Overview

The user can generate an HTML accessibility report instead of a Playwright test script. The report displays:
1. The accessibility issue description.
2. Actionable instructions on how to fix the issue.
3. Element identification (ID, CSS class, and precise DOM path).
4. A localized base64-encoded screenshot of the page with the specific violating element highlighted.

This is triggered via the `--html-report <filename>` CLI option.

---

## Implementation Plan

### CLI & Core Logic

1. **`src/index.ts`**
   - Added a new `--html-report <filename>` option to the CLI.
   - Handled the output differently based on whether `--html-report` is provided (writing the generated HTML report to the specified file and skipping Playwright test generation).

2. **`src/evaluator.ts`**
   - Updated the `evaluatePage` method signature to accept a `reportType` option (`'playwright' | 'html'`).
   - Parsed JSON responses when building an HTML report.
   - Asked the `BrowserAdapter` to generate highlighted screenshots for each identified issue based on its `badgeNumber`.
   - Compiled the JSON data and screenshots into a stylized HTML file `generateHtmlReport`.

3. **`src/rules/Rule.ts`**
   - Modified the `evaluate` method to branch the prompt based on `reportType`.
   - If `reportType` is `'html'`, prompted the LLM to return strictly a JSON array of issue objects:
     ```json
     [
       {
         "issue": "...",
         "fix": "...",
         "element": { "id": "...", "cssClass": "...", "path": "...", "badgeNumber": 123 }
       }
     ]
     ```

4. **`src/browser.ts`**
   - Added a new `highlightAndScreenshotIssue(badgeNumber: number)` method to `BrowserAdapter`.
   - This method finds an element by the `data-playwright-a11y-id`, highlights it with a colored dashed line, scrolls it into view, captures a screenshot, and restores the original styles.
   - Added robust `try...catch` handling to `querySelectorAll` so that invalid CSS pseudo-selectors (e.g. `:contains()`) outputted by the LLM are safely ignored instead of crashing the execution.

---

## Walkthrough & Validation Results

### What Was Accomplished
A new feature was successfully implemented to generate a standalone HTML evaluation report containing detailed accessibility violations. This provides users with an easy format to digest issues compared to reading terminal output or analyzing generated specs.

### Validation

Verified the implementation locally running the following command against an intentionally inaccessible demo page:

```bash
node dist/index.js check --url https://www.w3.org/WAI/demos/bad/before/home.html --html-report report.html
```

#### Visual Verification

The resulting `report.html` was generated successfully and contained:

1. **Clear Problem Descriptions:** E.g., "The link wrapping the GitHub logo image does not have discernible text."
2. **Actionable Fixes:** E.g., "Provide a meaningful accessible name for the link..."
3. **Element Information:** Displaying the ID, Class, and exact DOM Path of the offending element.
4. **Highlighted Screenshots:** Each issue card included an embedded base64 image showing the exact element on the page, highlighted with a vibrant magenta dashed border to easily identify its location contextually.

The logic successfully bypassed generating the Playwright test and instead effectively structured the Gemini LLM output into a polished developer deliverable, successfully running on complex, deep-nested pages with complex pseudo-selector combinations.
