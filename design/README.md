# PDFin Design System

Design system for **PDFin Web** — a bilingual (Indonesian-first), privacy-first, client-side PDF tools web app. All PDF processing happens in the user's browser; files are never uploaded. Target users: Indonesian office workers, students, SMEs, freelancers, and government-adjacent users.

**Brand promise**
- EN: "PDF tools that keep your files on your device."
- ID: "Alat PDF mudah, cepat, dan privat. File tetap di perangkat Anda."

**Privacy statement (verbatim, used on every tool page)**
- EN: "Your files are processed in your browser. PDFin does not upload your files for this tool."
- ID: "File Anda diproses di browser. PDFin tidak mengunggah file Anda untuk alat ini."

Never use exaggerated claims: no "100% secure", "military-grade", "guaranteed safe".

## Sources

- PRD: `PDFin_Web_PRD_v1_0.md` (attached in project brief) — source of truth for product scope, copy, routes, and glossary.
- GitHub repo: https://github.com/bicilique/PDFin-dev — early-stage repo ("PDF Tools with Security Concern and Client Side First"); contained only README/LICENSE at time of authoring, no code or design tokens. Explore it for future updates.
- Local mounted folder `PDFin-Dev/` — same content as the repo (README + LICENSE only).
- Logo uploads: `uploads/LOGO_PDFin_*.png` → copied to `assets/logo/`.

Because no prior design tokens or UI code existed, this design system was authored from scratch around the PDFin logo mark (violet gradient "P" with cyan bowl) and the PRD's product requirements.

## Products represented

One product: **PDFin Web** — static SPA with a homepage tool grid and per-tool workspaces (Merge, Split, Organize, Rotate, Images→PDF, PDF→Image, Compress, Watermark, Page Numbers, Flatten). Localized routes `/id/*` and `/en/*`.

## CONTENT FUNDAMENTALS

- **Bilingual, Indonesian-first.** Every string exists in ID and EN. Indonesian is simple and operational ("bahasa kantor"), not formal ("Anda", never "kamu"; no slang).
- **Voice**: product speaks as "PDFin" (third person) in privacy claims; addresses the user as "you"/"Anda". No "we/kami" fluff.
- **Sentence case** everywhere — headings, buttons, labels. Tool names are title-cased proper nouns ("Gabung PDF", "Merge PDF").
- **Short, verb-first CTAs**: "Gabung PDF", "Unduh", "Proses", "Mulai ulang" / "Merge PDF", "Download", "Process", "Start over".
- **Honest, calm tone.** State capability limits plainly ("This file may already be optimized"). No hype, no exclamation marks, no urgency.
- **No emoji.** Ever.
- **Glossary (canonical, do not re-translate)**: Merge=Gabung, Split=Pisah, Compress=Kompres, Organize=Atur Halaman, Rotate=Putar, Images to PDF=Gambar ke PDF, PDF to Image=PDF ke Gambar, Page Numbers=Nomor Halaman, Sign=Tanda Tangan, Download=Unduh, Process=Proses, Choose file=Pilih file, Drop files here=Letakkan file di sini, Processing=Memproses, Completed=Selesai, Error=Terjadi kesalahan, "Your file stays on your device"="File tetap di perangkat Anda".
- Example copy: "Gabungkan beberapa file PDF menjadi satu. File diproses langsung di browser Anda dan tidak diunggah ke server PDFin."

## VISUAL FOUNDATIONS

- **Color**: violet primary (`--violet-600 #5518B4`, deep `#370C7C`) + cyan accent (`--cyan-400 #23CDD8`) straight from the logo. Cool violet-cast neutrals ("ink"). Cyan is reserved for the **privacy/trust accent** (privacy pills, local-processing notices) and small accents — never a competing CTA color. One primary CTA per screen, always violet.
- **Gradient**: `--gradient-brand` (deep violet → violet → cyan, 135deg) mirrors the logo. Use sparingly: hero backdrops, brand moments. Never on buttons or body surfaces.
- **Type**: Plus Jakarta Sans (variable, 200–800) for everything; JetBrains Mono for file names, sizes, page ranges, and technical values. Headings bold/extrabold with tight tracking (-0.02em). Body 15px/1.55.
- **Spacing**: 4px base scale (`--space-1..20`). Page container max 1120px.
- **Corners**: 6/10/14/20px + pill. Cards 14px, buttons 10px, inputs 10px, chips pill.
- **Cards**: white (`--surface-card`) on `--ink-050` page, 1px `--border-default`, `--shadow-card` (soft, violet-tinted, two-layer). No colored left borders.
- **Backgrounds**: flat solid surfaces; the only texture is the brand gradient or `--gradient-brand-soft` (violet-050→cyan-050) on heroes and empty states. No images, no patterns, no grain.
- **Dark mode**: full token remap via `[data-theme="dark"]` on any ancestor. Deep ink surfaces, violet-300 links, muted status colors.
- **Borders/shadows**: hairline 1px borders + soft shadows together (belt-and-braces card style). Focus = 3px violet glow ring (`--shadow-focus`).
- **Hover states**: darker fill for solid buttons (`--action-primary-hover`), tinted surface (`--ink-100`) for ghost/quiet controls. Links darken + underline.
- **Press states**: darker still (`--action-primary-active`); no shrink transforms.
- **Motion**: quiet and quick — 120–320ms, ease-out (`cubic-bezier(0.16,1,0.3,1)`). Fades and small translates only; no bounces, no infinite loops. Progress bars animate width linearly.
- **Dashed borders** signal drop zones (2px dashed `--border-strong`, violet on dragover) — the one place dashed is allowed.
- **Transparency/blur**: none, except optional header `backdrop-filter` when sticky.
- **Imagery**: no photography. The product's "imagery" is document thumbnails rendered by PDF.js.

## ICONOGRAPHY

- **Icon set: Lucide** (stroke icons, 1.5–2px stroke, 20/24px) — linked from CDN in cards/kits here; in production PDFin bundles `lucide-react` locally (no runtime CDN per PRD). This is a **substitution/choice by this design system** — the source repo defined no icon set. Flagging for confirmation.
- Icons always paired with a text label or `aria-label`. No emoji, no unicode-char icons.
- **Logo**: the PDFin "P" mark (`assets/logo/pdfin-mark-*.png`, 32–1000px). Wordmark is the mark + "PDFin" set in Plus Jakarta Sans ExtraBold; "PDF" ink-900 + "in" violet-600 is acceptable, or solid heading color. Don't redraw the mark.
- Tool identity icons (merge/split/etc.) use Lucide glyphs on `--surface-brand-subtle` rounded-12px tiles.

## Index

- `styles.css` — global entry (imports everything under `tokens/`).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `layout.css`, `base.css`.
- `assets/logo/` — PDFin mark PNGs (32–1000px). `assets/fonts/` — Plus Jakarta Sans + JetBrains Mono variable TTFs.
- `guidelines/` — foundation specimen cards (@dsCard-tagged).
- `components/core/` — Button, IconButton, Badge, PrivacyPill, Input, Select, Card, ToolTile, ProgressBar, Alert, Dropzone, FileCard, Switch, LangSwitcher.
- `components/workspace/` — Toolbar (+ToolbarDivider), ZoomControl, PageNavigator, PageCard, Modal, Toast, ContextMenu, DownloadCard — primitives for the tool workspace (page grids, viewers, result states).
- `ui_kits/pdfin-web/` — homepage + Merge tool workspace recreation (`index.html`).
- `ui_kits/pdfin-web/workspace/` — **Tool Workspace prototype** (`Tool Workspace.html`): one shell for all 15 tools (merge, split, organize, rotate, compress, watermark, images↔PDF, page numbers, flatten, protect, unlock, metadata, sign, OCR) with real client-side rendering (pdf.js, lazy thumbnails, `intent:"print"` for sandboxed iframes) and real processing (pdf-lib). Ctrl+K switcher, bilingual ID/EN, dark mode, undo + toasts. Protect/Unlock/OCR outputs are labeled prototype simulations.
- `templates/tool-workspace/` — static tool-page shell template (top nav + sidebar + workspace + inspector) for starting new tool designs.
- `templates/pdfin-web-app/` — homepage + Merge workspace app template (interactive React, bilingual, dark mode).
- `SKILL.md` — agent skill entry point.

## Intentional additions

- **Lucide icon set** — no icon system existed in sources; chosen for clean stroke style matching the geometric logo.
- **PrivacyPill / Dropzone / FileCard / ToolTile / ProgressBar** — product-specific primitives mandated by the PRD's shared tool UX flow, not by any prior component library (none existed).
- **Plus Jakarta Sans + JetBrains Mono** — no fonts were provided; chosen from Google Fonts (Jakarta-designed geometric sans fits the Indonesian-first positioning). **Flag: replace with official brand fonts if they exist.**
