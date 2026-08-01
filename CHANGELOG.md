# Changelog

All notable changes to PDFin will be documented in this file.

The format is based on Keep a Changelog, with release entries grouped by date.

## 2026-08-01 - One PDF Editor

### Changed

- Merged `textedit` (Edit Teks PDF) into `edit` (Edit PDF). The workspace, home screen, and quick switcher now show a single editing tool instead of two that were easy to confuse.
- The Edit PDF tool opens in "Edit teks asli" mode, with the annotation tools (new text, image, highlight, box, ellipse, line, freehand) alongside it in the same tool picker. Both layers stay visible in the preview whichever mode is active, so the preview always matches the file you download.
- One processing run now applies both kinds of change: text edits are written into the page's content stream first, then the annotation objects are drawn on top (`PdfProcess.editDocument`).
- `/textedit/` keeps working and resolves to the Edit PDF tool; its SEO page was folded into `/edit/`.

### Added

- Type directly on the page: clicking existing PDF text turns it into a text field positioned over the words themselves, in the run's own font, size, and colour. Enter moves to the next text run, Shift+Tab/Tab step between runs, and Escape finishes. The inspector field mirrors the same value.
- New text boxes open straight into typing (click or drag, then type); double-clicking an existing text object re-opens it for typing, and a box left empty is discarded.
- Added a popular-font catalog (`engine/fontCatalog.js`) covering ~90 families used by office and web documents — Arial, Calibri, Segoe UI, Tahoma, Verdana, Times New Roman, Georgia, Garamond, Cambria, Roboto, Open Sans, Lato, Montserrat, Consolas, Courier New, and more — with weight, italic, and width parsing (`Calibri-Light`, `SegoeUI-Semibold`, `TimesNewRomanPS-BoldItalicMT`, `ArialNarrow-Bold`) and a CSS stack per family.
- `describeFont` now combines the catalog reading with the font descriptor's own flags and `/FontWeight`, so the inspector can name the typeface ("Helvetica · 9pt") and the substitute font picked for a redraw is a closer match.

### Performance

- Text runs are parsed only for pages near the viewport, and only for pages with edits when another tool is active.
- The read-only document used for extraction is now parsed once per file instead of once per page, and font contexts (including ToUnicode CMap parsing) are cached per font object across pages.
- The editor's preview key no longer serializes the whole option object on every keystroke.

### Verified

- `npm run lint` passed with existing warnings and no errors.
- `npm run typecheck` passed.
- `npx vitest run` passed with 24 test files and 233 tests (1 skipped), including new suites for the font catalog and the combined edit pass.
- `npm run build` passed and prerendered `/edit/`.
- Manual Playwright verification of the built app: typing over existing text on the page, Enter stepping to the next run, creating and typing into a new text box by click and by drag, applying both change kinds in one run, and the mobile settings sheet.

### Bundle Impact

- Release main JS bundle: `1,422.80 kB`, gzip `476.47 kB` (previous build `1,420.07 kB`, gzip `475.33 kB`).
- The font catalog ships in the lazily loaded `pdfFontWidths` chunk: `24.26 kB`, gzip `7.32 kB` (previously `9.98 kB`, gzip `3.57 kB`); it is fetched only when a page's text is parsed for editing.

## 2026-07-18 - Markdown to PDF Tool

### Added

- Added the `md2pdf` (Markdown ke PDF) workspace tool: write, paste, or open a Markdown/`.txt` file and download it as a PDF, with all processing in the browser.
- Added a live Markdown preview that mirrors the PDF output (headings, bold/italic, inline code, links, strikethrough, nested and task lists, tables, blockquotes, fenced code blocks, horizontal rules), with Write/Split/Preview layouts on desktop and a Write/Preview toggle on smaller screens.
- Added a formatting toolbar (bold, italic, heading, lists, quote, code, link, plus Ctrl+B/Ctrl+I), a bundled sample document, word/character counts, and drag-and-drop for `.md` files.
- Added PDF output settings: page size (A4/Letter/F4), margins, base text size, optional page numbers, and output file name. Generated PDFs keep selectable text and clickable links, and take their title metadata from the first heading.
- Added a local Markdown parser and pdf-lib layout engine (`markdownEngine.js`, `markdownPdf.js`) with unit tests; no new dependencies and no network requests.
- Added a `standalone` workspace tool mode for tools without file inputs, including continuation actions that carry the generated PDF into Compress/Split/Watermark.
- Added the tool to the home screen (conversion category), quick switcher, `/md2pdf/` route, and prerendered SEO page.
- Added a full-screen preview overlay with zoom controls (70-160%), reachable from the preview pane corner button or the editor footer, closable via button or Escape.

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
