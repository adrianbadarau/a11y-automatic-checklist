---
name: wcag-compliance
description: Ensure that all generated UI code complies with WCAG 2.2 AA accessibility guidelines. Use when creating or modifying web interfaces, components, or HTML structures.
---

# WCAG 2.2 AA Compliance AgentSkill

When writing or modifying UI code (HTML, React, Vue, Svelte, etc.), you **must** strictly adhere to the WCAG 2.2 AA guidelines as outlined below. Produce semantic, accessible, and robust code by default.

## 1. Structure and Semantics

- **Real Semantic HTML:** Always use correct semantic HTML elements (`<nav>`, `<header>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- **Headings (h1-h6):** Maintain a logical heading hierarchy. Do not skip heading levels. There should usually be only one `<h1>` per page.
- **Lists:** Use `<ul>`, `<ol>`, and `<dl>` for list content. Never use `<div>` or `<br>` to simulate lists.
- **Tables:** Use `<th>` with appropriate `scope` (`col` or `row`) for data tables. Never use tables for visual layout.
- **Page Title:** Ensure dynamic pages update `<title>` appropriately.

## 2. Links, Buttons, and Navigation

- **Links vs Buttons:**
  - Use `<a>` (with an `href` attribute) **strictly for navigation** (changing URLs or anchor paths).
  - Use `<button>` **strictly for interactions** (form submission, opening modals, toggling state).
  - *Never* use click handlers on generic elements like `<div>` or `<span>` without providing `role="button"`, `tabindex="0"`, and keyboard support (Enter/Space to activate).
- **Discernible Text:** Every link and button must have meaningful, programmatically discernible text. If an icon is used alone, it must have an `aria-label` or visually hidden text.
- **Focus Indicators:** Ensure all interactive elements have a visible focus indicator (`:focus-visible`). Contrast ratio of the focus indicator against the background must be at least 3:1.
- **Skip Links:** Provide a "Skip to main content" link at the top of the page for keyboard users.

## 3. Forms and User Input

- **Labels:** Every input, textarea, and select element must have a programmatically associated label (e.g., `<label for="inputId">`).
  - *Do not* rely solely on the `placeholder` attribute for labels.
- **Error Feedback:** Validate forms and clearly associate error messages with their respective input fields using `aria-describedby` or `aria-errormessage`.
  - Use `aria-invalid="true"` when a field has an error.
- **Required Fields:** Mark required fields with `required` and/or `aria-required="true"`. Wait for form submission before showing validation errors if possible.

## 4. Images and Visuals

- **Informative Images:** Must include descriptive `alt` text. Wait, do not write 'image of' or 'picture of' in the alt text (screen readers do this automatically).
- **Decorative Images:** Must have empty `alt` text (`alt=""`) or `role="presentation"` to be ignored by screen readers. Alternatively, implement via CSS backgrounds.
- **Color Independence:** Do not convey information using color alone (e.g., error states must include icons or text).
- **Contrast Ratios:**
  - Regular Text (< 18pt or < 14pt bold): **4.5:1** minimum contrast against background.
  - Large Text: **3:1** minimum contrast.
  - UI Components (borders of inputs, buttons, etc.): **3:1** minimum contrast.

## 5. Dynamic Content and Custom Widgets (WAI-ARIA)

- **Status Updates:** Use `aria-live` regions (e.g., `role="status"` or `role="alert"`) to announce dynamic changes to the page (e.g., form success messages, updated shopping cart counts).
- **Custom Widgets:** If you must build custom widgets (dropdowns, accordions, modals), strictly follow the **WAI-ARIA Authoring Practices**:
  - Implement full keyboard navigation (Up/Down arrows, Home/End, Esc to close).
  - Manage focus dynamically. When a modal opens, trap focus within the modal. When it closes, return focus to the trigger element.
  - Use appropriate ARIA roles (`role="dialog"`, `role="combobox"`, etc.) and states (`aria-expanded`, `aria-hidden`, `aria-checked`).

## 6. Motion and Multimedia

- **Autoplay/Motion:** Provide a method to pause or stop animations/videos that last more than 5 seconds or start automatically.
- **No Flashing:** Ensure content does not flash more than 3 times per second.

---

## Examples

### ❌ Inaccessible Button
```html
<div class="submit-btn" onclick="submitForm()">Submit</div>
```

### ✅ Accessible Button
```html
<button type="submit" class="submit-btn" aria-disabled="false">Submit</button>
```

### ❌ Inaccessible Image Link
```html
<a href="/home"><img src="logo.png"></a>
```

### ✅ Accessible Image Link
```html
<a href="/home" aria-label="Go to Homepage"><img src="logo.png" alt=""></a>
```

---

## Verification

When writing code in this repository, you should verify that it works against the Playwright A11y checklist evaluator. Assuming the CLI tool is available, consider running the automated accessibility evaluator on newly modified pages to verify compliance.
