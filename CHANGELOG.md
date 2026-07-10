# Changelog

All notable changes to PDFin will be documented in this file.

The format is based on Keep a Changelog, with release entries grouped by date.

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
