# PDFin

PDFin is a browser-first PDF tools web app with a Self-hosted product page for customer-managed API deployments. For verified Browser Tools, documents are processed in the user's browser and are not sent to PDFin processing servers.

## Product flow

PDFin uses one canonical workspace for actual PDF work. The home page is a tool catalog and trust entry point; selecting a tool opens the workspace with a deterministic direct route such as `/merge/`, `/split/`, `/compress/`, or `/watermark/`. Legacy hash routes such as `/#merge` still work as compatibility aliases.

The workspace is where users add files, preview pages, configure tool-specific settings, process PDFs in the browser when the tool supports local processing, download the result, and continue to compatible next actions. Compatibility entries such as `/workspace` or `/#workspace` should lead users back into the canonical workspace model rather than a separate processing flow.

PDFin Self-hosted is a separate product line for customer-managed infrastructure and local network deployments. Its API is part of Self-hosted and must not be described as a PDFin hosted/cloud API. The current product definition lives in `design/product/self-hosted-product-definition.md`; it is a planning artifact, not a public availability promise.

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

The production GitHub Pages deployment uses the custom domain `https://www.pdfin.fun/`, so built assets are served from `/`.

The build also pre-renders static pages into `dist/`, including the home page, tool direct routes, `privacy-security/`, `self-hosted/`, `sitemap.xml`, `robots.txt`, and a GitHub Pages `404.html` fallback. Tool pages are `noindex` until public indexing is explicitly enabled; the homepage and Self-hosted page are included in the sitemap.

## Project layout

```text
src/        Production React app and PDF workspace modules
public/     Static assets copied into the built site
design/     Original design system, guidelines, templates, and UI-kit references
dist/       Generated build output, not committed
```

## GitHub Pages

Deployment is configured in `.github/workflows/deploy-pages.yml`. In the GitHub repository settings, set Pages source to **GitHub Actions** and the custom domain to `www.pdfin.fun`.

## Current tool status

Workspace tools run client-side PDF processing in the browser when implemented for local processing. Unlock PDF remains in development and must be labeled as unavailable until it performs real password-based unlocking. The app should not add uploads, telemetry, analytics, or remote PDF processing without an explicit product and privacy review.

## Release review

Before a UI/UX release, verify the canonical workspace flow from discovery through download:

- Run `npm test -- --run`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- Run `npm run dev` in one terminal and `npm run verify:privacy` in another to verify that browser-tool smoke flows do not create document upload requests.
- Smoke test the production build with `npm run preview`.
- Check home, workspace empty, ready, processing, success, and error states.
- Check keyboard navigation, light and dark themes, reduced motion, and 390px, 768px, 1024px, and 1440px viewports.
- Capture final review screenshots in `output/playwright/`.
