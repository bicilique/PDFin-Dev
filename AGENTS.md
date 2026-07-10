# Repository Guidelines

## Project Structure & Module Organization

PDFin is a browser-first React/Vite PDF tools app. Production code lives in `src/`: `src/app/` contains the app shell, `src/features/` contains flows, `src/components/` contains reusable UI, and `src/styles/` holds global CSS plus design tokens. Static assets live in `public/`, including fonts, logos, and copied PDF.js files. `design/` stores design-system references, screenshots, templates, and original assets. `scripts/` contains utilities such as `copy-pdfjs-assets.mjs`. `dist/` is generated build output; do not edit it directly.

## Build, Test, and Development Commands

- `npm install`: install dependencies and run `postinstall`, which copies PDF.js assets.
- `npm run dev`: start the Vite development server, usually at `http://localhost:5173/`.
- `npm run build`: create a production build in `dist/`.
- `GITHUB_PAGES=true npm run build`: build with the GitHub Pages asset base used by CI.
- `npm run preview`: serve the production build locally for final smoke testing.

Use Node 22 for the GitHub Pages workflow.

## Coding Style & Naming Conventions

Use ES modules and React function components. Follow the existing JSX style: 2-space indentation, double quotes, semicolons, and named exports for shared components. Name components in `PascalCase` (`WorkspaceShell.jsx`, `IconButton.jsx`) and helpers or state functions in `camelCase`. Keep feature-specific code under its feature directory; move only genuinely reusable UI into `src/components/`. Prefer existing CSS variables from `src/styles/tokens/` over hard-coded colors, spacing, or typography.

## Testing Guidelines

There is no dedicated test runner configured yet. Before submitting changes, run `npm run build` and, for UI or PDF workflow changes, manually verify the affected flow with `npm run dev` or `npm run preview`. If adding tests later, colocate them near the code they cover using `*.test.jsx` or `*.spec.jsx`, and add the corresponding `npm test` script to `package.json`.

## Commit & Pull Request Guidelines

Current history only contains an initial commit, so no strict commit convention is established. Use short, imperative commit messages such as `Add merge workspace toolbar` or `Fix PDF.js asset path`. Pull requests should include a summary, verification steps, linked issues when relevant, and screenshots for visual changes. Mention impacts to GitHub Pages deployment, static assets, or client-side PDF privacy behavior.

## Security & Configuration Tips

The app is intended to process files locally in the browser. Do not introduce uploads, telemetry, or remote PDF processing without making the privacy impact explicit in code review and user-facing copy. Keep `.env*`, `node_modules/`, `.serena/`, `.codex/`, and generated `dist/` artifacts out of commits.
