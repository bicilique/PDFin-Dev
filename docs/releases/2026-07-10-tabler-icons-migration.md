# PDFin Release - Tabler Icon System Migration

Release date: 2026-07-10

## Summary

This release migrates PDFin's application icon system to Tabler Icons for a more consistent, modern, lightweight visual language across the browser-first PDF tools app.

The release preserves PDFin's existing product behavior and privacy model. PDF processing remains local in the browser, and the PDFin logo remains unchanged as a brand asset.

## User-Facing Changes

- Tool cards, workspace controls, navigation controls, upload areas, page actions, dialogs, toasts, alerts, and footer links now use a consistent Tabler icon style.
- Light mode and dark mode icon rendering continues to use `currentColor`, so icon color follows existing theme tokens and interaction states.
- Icon-only controls retain accessible labels and tooltips, including menu, close, remove, move, page navigation, theme, zoom, and inspector controls.
- Mobile menu and workspace controls retain touch-friendly targets and readable icon sizing.

## Technical Changes

- Added `@tabler/icons-react@3.44.0`.
- Added a shared icon registry in `src/components/icons/PdfinIcons.jsx`.
- Replaced inline UI SVGs with named Tabler React component imports.
- Kept icon imports tree-shakeable by using named imports only.
- Centralized default icon behavior:
  - `size` defaults to `18`.
  - `stroke` defaults to `2`.
  - decorative icons default to `aria-hidden="true"`.
  - icons inherit `currentColor`.

## Key Icon Mappings

- Gabung PDF: `IconFiles`
- Pisah PDF: `IconFileScissors`
- Atur Halaman: `IconLayoutGrid`
- Putar PDF: `IconRotateClockwise2`
- Kompres PDF: `IconArrowsMinimize`
- Watermark PDF: `IconDroplet`
- Gambar ke PDF: `IconPhoto`
- PDF ke Gambar: `IconFileExport`
- Nomor Halaman: `IconListNumbers`
- Ratakan PDF: `IconLayersSubtract`
- Kunci PDF: `IconLock`
- Buka PDF terkunci: `IconLockOpen`
- Metadata PDF: `IconFileInfo`
- Tanda tangan visual PDF: `IconSignature`
- OCR PDF: `IconTextScan2`
- GitHub: `IconBrandGithub`
- Status: `IconInfoCircle`, `IconAlertTriangle`, `IconCircleCheck`, `IconCircleX`

## Dependency And License Notes

- Added dependency: `@tabler/icons-react@3.44.0`.
- Transitive package: `@tabler/icons@3.44.0`.
- License: MIT.
- Removed icon dependencies: none. PDFin did not previously use an external icon-library dependency.

## Accessibility Notes

- Decorative icons are hidden from assistive technology through the shared icon wrapper.
- Text labels remain the source of meaning for destructive actions, errors, upload status, and security/privacy information.
- Existing keyboard focus behavior and accessible button labels are preserved.

## Bundle Impact

Compared with the baseline build captured before migration:

| Asset | Before | After | Change |
| --- | ---: | ---: | ---: |
| Main JS | `1,259.39 kB` | `1,266.41 kB` | `+7.02 kB` |
| Main JS gzip | `428.29 kB` | `429.55 kB` | `+1.26 kB` |
| CSS gzip | `4.90 kB` | `4.90 kB` | `0 kB` |

The existing large-chunk warning remains driven by PDF processing dependencies, not the icon migration.

## Verification

- `npm run lint` passed with existing warnings and no errors.
- `npm run typecheck` passed.
- `npm run test -- --run` passed.
- `npm run build` passed.
- `PDFIN_VERIFY_URL=http://127.0.0.1:4173/ npm run verify:theme` passed.
- Final repository icon audit found no raw UI SVG markup, emoji icons, or old icon-library imports in `src`, `public`, or `package.json`.

## Release Scope

This release includes the validated Tabler icon migration and the current responsive/mobile shell state present in the working tree at release time. It does not introduce uploads, telemetry, remote PDF processing, route changes, or PDF workflow behavior changes.
