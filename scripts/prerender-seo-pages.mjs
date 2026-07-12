import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  getIndexableSeoPages,
  homeSeoPage,
  seoPages,
  selfHostedSeoPage,
  SITE_BASE_PATH,
  SITE_URL,
} from "../src/seo/seoPages.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, "dist");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeBasePath(basePath) {
  if (!basePath || basePath === "/") return "/";
  return `/${basePath.replace(/^\/|\/$/g, "")}/`;
}

function getBuildBasePath() {
  return normalizeBasePath(process.env.VITE_BASE_PATH || SITE_BASE_PATH);
}

function joinUrlPath(basePath, path = "") {
  const normalizedBase = normalizeBasePath(basePath);
  const normalizedPath = path.replace(/^\/|\/$/g, "");
  if (!normalizedPath) return normalizedBase;
  return `${normalizedBase}${normalizedPath}/`;
}

function getCanonicalUrl(page) {
  if (!page.slug) return `${SITE_URL}/`;
  return `${SITE_URL}/${page.slug}/`;
}

function stripClientScripts(html) {
  return html.replace(/\s*<script\b[^>]*type="module"[^>]*><\/script>/g, "");
}

function replaceHeadSeo(html, page) {
  const robots = page.indexable ? "index,follow" : "noindex,follow";
  const canonicalUrl = getCanonicalUrl(page);
  const seoHead = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="PDFin" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ].join("\n    ");

  return html
    .replace(/<title>[\s\S]*?<\/title>/, seoHead)
    .replace(/<meta\s+name="description"[\s\S]*?\/>\n?/i, "");
}

function renderHomePage(basePath) {
  const toolLinks = seoPages
    .map((page) => `
          <a class="seo-tool-card" href="${joinUrlPath(basePath, page.slug)}">
            <span>${escapeHtml(page.h1)}</span>
            <small>${escapeHtml(page.description)}</small>
          </a>`)
    .join("");

  return `
      <main class="seo-page">
        <section class="seo-hero">
          <p class="seo-pill">PDFin Browser Tools</p>
          <h1>${escapeHtml(homeSeoPage.h1)}</h1>
          <p>${escapeHtml(homeSeoPage.intro)}</p>
          <a class="seo-primary" href="${joinUrlPath(basePath, "merge")}">Mulai dengan Gabung PDF</a>
        </section>
        <section class="seo-section" aria-labelledby="tools-heading">
          <h2 id="tools-heading">Pilih alat PDF</h2>
          <div class="seo-tool-grid">${toolLinks}
          </div>
        </section>
      </main>`;
}

function renderToolPage(page, basePath) {
  const appHref = joinUrlPath(basePath, page.slug);
  const relatedTools = seoPages
    .filter((relatedPage) => relatedPage.toolId !== page.toolId)
    .slice(0, 4)
    .map((relatedPage) => `<a href="${joinUrlPath(basePath, relatedPage.slug)}">${escapeHtml(relatedPage.h1)}</a>`)
    .join("");
  const steps = page.howItWorks.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  const faq = page.faq
    .map(([question, answer]) => `
          <details>
            <summary>${escapeHtml(question)}</summary>
            <p>${escapeHtml(answer)}</p>
          </details>`)
    .join("");
  const prototypeNotice = page.indexable
    ? ""
    : `<p class="seo-notice">Fitur ini masih prototipe, jadi halaman ini tidak dimasukkan ke indeks mesin pencari.</p>`;

  return `
      <main class="seo-page">
        <nav class="seo-breadcrumb" aria-label="Breadcrumb">
          <a href="${joinUrlPath(basePath)}">PDFin</a>
          <span aria-hidden="true">/</span>
          <span>${escapeHtml(page.h1)}</span>
        </nav>
        <section class="seo-hero">
          <p class="seo-pill">PDFin Browser Tools</p>
          <h1>${escapeHtml(page.h1)}</h1>
          <p>${escapeHtml(page.intro)}</p>
          ${prototypeNotice}
          <a class="seo-primary" href="${appHref}">Buka alat ini</a>
        </section>
        <section class="seo-section" aria-labelledby="how-heading">
          <h2 id="how-heading">Cara kerja</h2>
          <ol class="seo-steps">${steps}</ol>
        </section>
        <section class="seo-section" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading">Privasi file</h2>
          <p>Untuk alat browser yang telah diverifikasi, dokumen diproses di perangkat Anda dan tidak dikirim ke server pemrosesan PDFin. Browser tetap dapat mengunduh runtime asset seperti JavaScript, WASM, PDF.js worker, dan OCR language asset.</p>
        </section>
        <section class="seo-section" aria-labelledby="faq-heading">
          <h2 id="faq-heading">Pertanyaan umum</h2>
          <div class="seo-faq">${faq}
          </div>
        </section>
        <section class="seo-section" aria-labelledby="related-heading">
          <h2 id="related-heading">Alat terkait</h2>
          <div class="seo-related">${relatedTools}</div>
        </section>
      </main>`;
}

const privacySeoPage = {
  slug: "privacy-security",
  title: "Privasi & keamanan | PDFin",
  h1: "Privasi & keamanan",
  description: "Penjelasan faktual tentang lokasi pemrosesan, dependency, storage, network request, dan batasan PDFin Browser Tools.",
  intro: "PDFin membedakan Browser Tools dari Self-hosted agar lokasi pemrosesan dokumen jelas.",
  indexable: false,
};

function renderPrivacyPage(basePath) {
  return `
      <main class="seo-page">
        <nav class="seo-breadcrumb" aria-label="Breadcrumb">
          <a href="${joinUrlPath(basePath)}">PDFin</a>
          <span aria-hidden="true">/</span>
          <span>Privasi & keamanan</span>
        </nav>
        <section class="seo-hero">
          <p class="seo-pill">Privacy & Security</p>
          <h1>Privasi & keamanan</h1>
          <p>Untuk alat browser yang telah diverifikasi, dokumen diproses di perangkat Anda dan tidak dikirim ke server pemrosesan PDFin. Browser tetap dapat mengunduh runtime asset yang dibutuhkan.</p>
          <a class="seo-primary" href="${joinUrlPath(basePath, "merge")}">Pilih alat PDF</a>
        </section>
      </main>`;
}

function renderSelfHostedPage(basePath) {
  return `
      <main class="seo-page">
        <nav class="seo-breadcrumb" aria-label="Breadcrumb">
          <a href="${joinUrlPath(basePath)}">PDFin</a>
          <span aria-hidden="true">/</span>
          <span>Self-hosted</span>
        </nav>
        <section class="seo-hero">
          <p class="seo-pill">Self-hosted API</p>
          <h1>${escapeHtml(selfHostedSeoPage.h1)}</h1>
          <p>${escapeHtml(selfHostedSeoPage.intro)}</p>
          <a class="seo-primary" href="mailto:afiffaizianur@gmail.com?subject=PDFin%20Self-hosted%20deployment%20discussion">Diskusikan deployment</a>
        </section>
        <section class="seo-section" aria-labelledby="self-hosted-how">
          <h2 id="self-hosted-how">Cara kerja</h2>
          <p>Aplikasi pelanggan mengirim request ke PDFin Self-hosted API melalui local network. Processing service berjalan di infrastruktur pelanggan, memakai temporary storage yang dikelola pelanggan, lalu mengembalikan hasil ke aplikasi.</p>
        </section>
        <section class="seo-section" aria-labelledby="self-hosted-api">
          <h2 id="self-hosted-api">API sebagai bagian dari Self-hosted</h2>
          <p>API bukan produk cloud terpisah. Capability mengikuti operasi yang benar-benar dibangun, diuji, dan disepakati dalam scope deployment.</p>
        </section>
      </main>`;
}

function renderStructuredData(page) {
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "PDFin",
      url: `${SITE_URL}/`,
      inLanguage: "id-ID",
    },
    {
      "@type": "WebPage",
      "@id": `${getCanonicalUrl(page)}#webpage`,
      url: getCanonicalUrl(page),
      name: page.title,
      description: page.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "id-ID",
    },
  ];

  if (page.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: page.faq.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    });
  }

  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}

function renderSeoStyles() {
  return `<style>
    .seo-page{min-height:100vh;background:var(--surface-page);color:var(--text-body);font-family:var(--font-sans);line-height:1.6}
    .seo-hero{padding:64px 24px 56px;text-align:center;background:var(--gradient-brand-soft);border-bottom:1px solid var(--border-default)}
    .seo-hero>*{max-width:760px;margin-left:auto;margin-right:auto}
    .seo-pill{display:inline-flex;width:max-content;padding:6px 12px;border:1px solid var(--border-default);border-radius:999px;background:var(--surface-card);color:var(--text-muted);font:var(--type-caption)}
    .seo-hero h1{margin:16px auto 14px;font:var(--type-display);letter-spacing:0}
    .seo-hero p{margin-top:0;color:var(--text-muted);font:var(--type-body)}
    .seo-primary{display:inline-flex;align-items:center;justify-content:center;min-height:44px;margin-top:12px;padding:0 18px;border-radius:8px;background:var(--action-primary);color:white;text-decoration:none;font-weight:700}
    .seo-primary:focus-visible,.seo-page a:focus-visible,.seo-page summary:focus-visible{outline:3px solid var(--border-focus);outline-offset:3px}
    .seo-breadcrumb{max-width:var(--container-max);margin:0 auto;padding:20px 24px 0;display:flex;gap:8px;color:var(--text-muted);font:var(--type-caption)}
    .seo-breadcrumb a,.seo-related a{color:var(--text-link);text-decoration:none}
    .seo-section{max-width:var(--container-max);margin:0 auto;padding:40px 24px}
    .seo-section h2{margin:0 0 16px;font:var(--type-h2);letter-spacing:0}
    .seo-tool-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
    .seo-tool-card{display:flex;min-height:132px;flex-direction:column;gap:8px;padding:18px;border:1px solid var(--border-default);border-radius:8px;background:var(--surface-card);color:var(--text-body);text-decoration:none}
    .seo-tool-card span{font-weight:800}.seo-tool-card small{color:var(--text-muted);font:var(--type-caption)}
    .seo-steps{display:grid;gap:12px;padding-left:24px}.seo-faq{display:grid;gap:12px}
    .seo-faq details{padding:16px;border:1px solid var(--border-default);border-radius:8px;background:var(--surface-card)}
    .seo-faq summary{cursor:pointer;font-weight:800}.seo-faq p{margin-bottom:0;color:var(--text-muted)}
    .seo-related{display:flex;flex-wrap:wrap;gap:12px}.seo-related a{min-height:44px;padding:10px 14px;border:1px solid var(--border-default);border-radius:8px;background:var(--surface-card)}
    .seo-notice{padding:12px 14px;border:1px solid var(--privacy-border);border-radius:8px;background:var(--privacy-bg);color:var(--text-body)}
    @media (max-width:640px){.seo-hero{padding:48px 20px 40px}.seo-section{padding:32px 20px}.seo-hero h1{font:var(--type-h1)}}
  </style>`;
}

function injectRoot(html, rootHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${rootHtml}\n    </div>`);
}

function injectBeforeHeadClose(html, content) {
  return html.replace("</head>", `    ${content}\n  </head>`);
}

function renderPageHtml(templateHtml, page, rootHtml, { includeClientScript }) {
  const htmlWithSeo = replaceHeadSeo(templateHtml, page);
  const htmlWithRoot = injectRoot(htmlWithSeo, rootHtml);
  const htmlWithAssets = injectBeforeHeadClose(htmlWithRoot, `${renderSeoStyles()}\n    ${renderStructuredData(page)}`);
  return includeClientScript ? htmlWithAssets : stripClientScripts(htmlWithAssets);
}

function renderSitemap() {
  const urls = [homeSeoPage, selfHostedSeoPage, ...getIndexableSeoPages()]
    .map((page) => `  <url><loc>${getCanonicalUrl(page)}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderRobots() {
  return `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

export async function prerenderSeoPages() {
  const basePath = getBuildBasePath();
  const templateHtml = await readFile(join(distDir, "index.html"), "utf8");

  await writeFile(join(distDir, "404.html"), templateHtml);

  const homeHtml = renderPageHtml(templateHtml, homeSeoPage, renderHomePage(basePath), { includeClientScript: true });
  await writeFile(join(distDir, "index.html"), homeHtml);

  for (const page of seoPages) {
    const pageDir = join(distDir, page.slug);
    await mkdir(pageDir, { recursive: true });
    const pageHtml = renderPageHtml(templateHtml, page, renderToolPage(page, basePath), { includeClientScript: true });
    await writeFile(join(pageDir, "index.html"), pageHtml);
  }

  const privacyDir = join(distDir, privacySeoPage.slug);
  await mkdir(privacyDir, { recursive: true });
  const privacyHtml = renderPageHtml(templateHtml, privacySeoPage, renderPrivacyPage(basePath), { includeClientScript: true });
  await writeFile(join(privacyDir, "index.html"), privacyHtml);

  const selfHostedDir = join(distDir, selfHostedSeoPage.slug);
  await mkdir(selfHostedDir, { recursive: true });
  const selfHostedHtml = renderPageHtml(templateHtml, selfHostedSeoPage, renderSelfHostedPage(basePath), { includeClientScript: true });
  await writeFile(join(selfHostedDir, "index.html"), selfHostedHtml);

  await writeFile(join(distDir, "sitemap.xml"), renderSitemap());
  await writeFile(join(distDir, "robots.txt"), renderRobots());
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await prerenderSeoPages();
}
