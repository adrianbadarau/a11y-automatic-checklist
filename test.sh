#!/bin/bash

# A script to run accessibility tests against a known bad and good site.

usage() {
  echo "Usage: ./test.sh {bad|good}"
  exit 1
}

if [ -z "$1" ]; then
  usage
fi

case "$1" in
  bad)
    echo "================================================="
    echo " Running with bad URL (Inaccessible Version)     "
    echo "================================================="
    echo "Generating Playwright tests..."
    npx tsx src/index.ts check --url https://www.w3.org/WAI/demos/bad/before/home.html --rule 1 --visual
    
    echo ""
    echo "Running generated Playwright tests..."
    npx playwright test generated-a11y.spec.ts
    ;;
  good)
    echo "================================================="
    echo " Running with good URL (Accessible Version)      "
    echo "================================================="
    
    if [ ! -f "generated-a11y.spec.ts" ]; then
      echo "Error: generated-a11y.spec.ts not found!"
      echo "Please run './test.sh bad' first to generate the tests."
      exit 1
    fi

    echo "Updating URL in the generated spec file to the accessible version..."
    # Using perl for reliable cross-platform inline replacement
    perl -pi -e 's|https://www.w3.org/WAI/demos/bad/before/home.html|https://www.w3.org/WAI/demos/bad/after/home.html|g' generated-a11y.spec.ts
    
    # Also handle the edge case where the file already has the after URL (if run multiple times)
    # The replacement above wouldn't do anything, which is fine, but just to be sure we're replacing any URL
    # that looks like the demo URL.
    perl -pi -e 's|await page\.goto\(["\047].*?["\047]\)|await page.goto("https://www.w3.org/WAI/demos/bad/after/home.html")|g' generated-a11y.spec.ts

    echo ""
    echo "Running Playwright tests against the good URL..."
    npx playwright test generated-a11y.spec.ts
    ;;
  *)
    echo "Unknown argument: $1"
    usage
    ;;
esac
