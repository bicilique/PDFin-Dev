# PDFin

PDFin is a browser-first PDF tools web app. Files are processed on the user's device; the production app does not upload files for the included tools.

## Product flow

PDFin uses one canonical workspace for actual PDF work. The home page is a tool catalog and trust entry point; selecting a tool opens the workspace with a deterministic hash route such as `/#merge`, `/#split`, `/#compress`, or `/#watermark`.

The workspace is where users add files, preview pages, configure tool-specific settings, process PDFs locally in the browser, download the result, and continue to compatible next actions. Compatibility entries such as `/workspace` or `/#workspace` should lead users back into the canonical workspace model rather than a separate processing flow.

## Local development

```bash
npm install
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173/`.

## Production build

```bash
npm run build
npm run preview
```

For GitHub Pages, verify the Pages asset base before release:

```bash
GITHUB_PAGES=true npm run build
```

The GitHub Pages build serves assets from `/PDFin-Dev/`.

The build also pre-renders SEO landing pages into `dist/`, including the home page, production tool pages, `sitemap.xml`, `robots.txt`, and a GitHub Pages `404.html` fallback. Prototype tools remain reachable for users but are marked `noindex` until their processing is final.

## Project layout

```text
src/        Production React app and PDF workspace modules
public/     Static assets copied into the built site
design/     Original design system, guidelines, templates, and UI-kit references
dist/       Generated build output, not committed
```

## GitHub Pages

Deployment is configured in `.github/workflows/deploy-pages.yml`. In the GitHub repository settings, set Pages source to **GitHub Actions**.

## Current tool status

Most workspace tools run client-side PDF processing. Protect PDF, Unlock PDF, and OCR remain visible as prototype simulations and are labeled as such in the UI. The app should not add uploads, telemetry, analytics, or remote PDF processing without an explicit product and privacy review.

## Release review

Before a UI/UX release, verify the canonical workspace flow from discovery through download:

- Run `npm test -- --run`, `npm run build`, and `GITHUB_PAGES=true npm run build`.
- Smoke test the production build with `npm run preview`.
- Check home, workspace empty, ready, processing, success, and error states.
- Check keyboard navigation, light and dark themes, reduced motion, and 390px, 768px, 1024px, and 1440px viewports.
- Capture final review screenshots in `output/playwright/`.
