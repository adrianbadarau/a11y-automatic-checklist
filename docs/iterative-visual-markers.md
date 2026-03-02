# Iterative Visual Markers

The Iterative Visual Markers feature enhances the Set-of-Mark (SoM) annotation technique used by `playwright-a11y-checklist` to reliably map visual elements on a web page to the underlying Accessibility Tree and HTML DOM.

## How it works

When taking a snapshot of a web page for evaluation:
1. The **`BrowserAdapter`** identifies a standard set of interactive and semantic elements (e.g., `img`, `a`, `button`, headings) and directly injects numbered red "badges" (spans) over these elements in the browser. It assigns a matching `data-playwright-a11y-id` attribute to the real HTML elements.
2. The page is then passed to the **`A11yEvaluator`**, which prompts Gemini (the AI) a configurable number of times in an iterative loop (default is 1).
3. In each iteration, Gemini is asked to identify any visually significant elements (like CSS background images, pseudo-elements, or custom components) that were **missed** by the initial query and lack a badge. Gemini responds with a list of precise Playwright-compatible CSS selectors.
4. If missing elements are found, the `BrowserAdapter` applies badges to the new selectors and takes another snapshot.
5. This loop repeats until Gemini says no important elements are un-badged, or the limit (configured by `--iterations`) is reached.
6. The final generated Playwright assertions can use any valid CSS selector, ARIA role, or text locator, guided by the precise visual map created during the iterations.

## Usage

This feature runs automatically during check commands. You can control the maximum number of times the tool prompts Gemini to look for missing visual elements by using the `-i` or `--iterations` flag:

```bash
npx tsx src/index.ts check --url https://example.com -i 3
``` 

If you want to debug or view the process in action, use the `--visual` flag:
```bash
npx tsx src/index.ts check --url https://example.com --visual
```
When using `--visual`, the browser will stay visible and pause for 2 seconds during each iterative loop, allowing you to clearly see the LLM adding new badges to elements it discovered dynamically.
