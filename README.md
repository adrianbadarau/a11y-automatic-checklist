# Playwright Accessibility Checklist

A Node.js tool that orchestrates Playwright, captures DOM and accessibility trees, and feeds them into Gemini to evaluate against Deque accessibility rules and generate custom tests.

## Features

- **CLI Commands**: An easy-to-use CLI built with `commander.js`. Use `npx tsx src/index.ts check --url <URL>` to run it.
- **Two Execution Modes**: 
  - Standard `--url <URL>` to launch a headless browser.
  - Remote Debugger `--debugger-url <URL>` to attach to an open Chrome browser and check the *exact page* the user is currently on! You can pass a simple HTTP endpoint (like `http://localhost:9222`) or a full websocket URL.
- **AI Accessibility Evaluator**: Extracts a stripped-down HTML snapshot and the Chromium Accessibility Tree, combined with Deque reference rules, feeding into `gemini-2.5-flash`.
- **Visual Playback Mode**: Use `--visual` to launch a headed browser and visually highlight elements matching the accessibility rules as they are evaluated.
- **Test Generation**: Automatically extracts and saves a valid Playwright test (`generated-a11y.spec.ts`) that asserts for accessibility regressions locally on your codebase.

## Prerequisites

To run the tool, you will need a Gemini API Key. Add a `.env` file to the root of the project with your API key, or export it in your terminal:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

## Example Usage

### 1. Checking an independent URL
```bash
# Add your API key
export GEMINI_API_KEY="AIza..."

# Run the CLI
npx tsx src/index.ts check --url https://dequeuniversity.com/demo/mars/ --output-test my-test.spec.ts
npx tsx src/index.ts check --url https://www.w3.org/WAI/demos/bad/before/home.html/ 
```

### 2. Visual Playback
To visually see what the accessibility evaluator is checking, pass the `--visual` flag. The browser will open and highlight elements on the page for each rule:
```bash
npx tsx src/index.ts check --url https://example.com --visual
```

### 2. Checking an active browser (attaching)
Start your Chrome browser with remote debugging enabled from your terminal:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```
Then run the tool attached to that browser to check whatever page you currently have open! (You can simply pass the localhost debugger URL):
```bash
npx tsx src/index.ts check --debugger-url http://localhost:9222
```

## Running Generated Tests

If you want to run the generated Playwright tests, standard Playwright setup commands will work out of the box:
```bash
npx playwright install
npx playwright test generated-a11y.spec.ts
```
