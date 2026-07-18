# Changelog

All notable changes to PDFin will be documented in this file.

The format is based on Keep a Changelog, with release entries grouped by date.

## 2026-07-18 - Markdown to PDF Tool

### Added

- Added the `md2pdf` (Markdown ke PDF) workspace tool: write, paste, or open a Markdown/`.txt` file and download it as a PDF, with all processing in the browser.
- Added a live Markdown preview that mirrors the PDF output (headings, bold/italic, inline code, links, strikethrough, nested and task lists, tables, blockquotes, fenced code blocks, horizontal rules), with Write/Split/Preview layouts on desktop and a Write/Preview toggle on smaller screens.
- Added a formatting toolbar (bold, italic, heading, lists, quote, code, link, plus Ctrl+B/Ctrl+I), a bundled sample document, word/character counts, and drag-and-drop for `.md` files.
- Added PDF output settings: page size (A4/Letter/F4), margins, base text size, optional page numbers, and output file name. Generated PDFs keep selectable text and clickable links, and take their title metadata from the first heading.
- Added a local Markdown parser and pdf-lib layout engine (`markdownEngine.js`, `markdownPdf.js`) with unit tests; no new dependencies and no network requests.
- Added a `standalone` workspace tool mode for tools without file inputs, including continuation actions that carry the generated PDF into Compress/Split/Watermark.
- Added the tool to the home screen (conversion category), quick switcher, `/md2pdf/` route, and prerendered SEO page.

### Verified

- `npm run lint` passed with existing warnings and no errors.
- `npm run typecheck` passed.
- `npx vitest run` passed with 11 test files and 113 tests.
- `npm run build` passed and prerendered `/md2pdf/`.
- `verify-network-privacy` passed against a local dev server; the Markdown tool makes no network requests and linked images are intentionally not fetched.
- Manual Playwright verification of the built app: desktop split editor/preview, mobile toggle and sheets, dark mode, PDF download bytes, and pdf.js rendering of the generated document.

### Bundle Impact

- Release main JS bundle: `1,326.18 kB`, gzip `446.49 kB` (previous release `1,266.41 kB`, gzip `429.55 kB`; includes the Markdown engine and editor UI).

## 2026-07-10 - Tabler Icon System Migration

### Added

- Added `@tabler/icons-react@3.44.0` as the application icon package.
- Added a shared Tabler icon registry for PDFin UI icons, tool icons, status icons, and common controls.
- Added dedicated release documentation under `docs/releases/`.

### Changed

- Migrated general UI, tool, navigation, action, status, and form-control icons from inline SVG markup to named Tabler React icon imports.
- Standardized decorative icon behavior through shared defaults for `currentColor`, stroke width, sizing, and `aria-hidden`.
- Kept the PDFin logo assets unchanged as brand assets.
- Preserved existing PDF tool behavior, routes, copy, privacy model, and browser-local processing.

### Verified

- `npm run lint` passed with existing warnings and no errors.
- `npm run typecheck` passed.
- `npm run test -- --run` passed with 7 test files and 73 tests.
- `npm run build` passed.
- `PDFIN_VERIFY_URL=http://127.0.0.1:4173/ npm run verify:theme` passed against a local preview server.
- Final icon audit found no raw UI SVG markup, emoji icons, or old icon-library imports in `src`, `public`, or `package.json`.

### Bundle Impact

- Baseline main JS bundle: `1,259.39 kB`, gzip `428.29 kB`.
- Release main JS bundle: `1,266.41 kB`, gzip `429.55 kB`.
- Net impact: approximately `+7.02 kB` minified and `+1.26 kB` gzip.
