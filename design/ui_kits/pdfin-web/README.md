# PDFin Web UI kit

Interactive recreation of the PDFin Web app defined in the PRD (no prior UI existed — this kit establishes the reference visuals).

- `index.html` — app shell: header (logo, nav, ID/EN switcher, theme toggle), footer, screen router.
- `HomeScreen.jsx` — hero with privacy pill on the soft brand gradient + 11-tool grid (Protect = "Segera hadir").
- `MergeScreen.jsx` — full shared tool flow: privacy pill → hero → dropzone → file cards → process → progress → success/download → related tools → FAQ. Click "Gabung PDF" tile on the homepage to open it; the dropzone's "Pilih file" loads sample files.
- `Chrome.jsx` — Header, Footer, logo lockup.

All screens are bilingual (switcher in header) and support dark mode (theme toggle).
