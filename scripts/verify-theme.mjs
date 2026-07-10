import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PDFIN_VERIFY_URL || "http://127.0.0.1:5173/";
const outputDir = "output/playwright/theme";

function parseRgb(value) {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function luminance([r, g, b]) {
  const srgb = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function assertServer() {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    throw new Error(`Theme verification needs a running dev or preview server at ${baseUrl}. Start it with npm run dev or set PDFIN_VERIFY_URL. ${error.message}`, { cause: error });
  }
}

async function setTheme(page, theme) {
  await page.addInitScript((nextTheme) => {
    localStorage.setItem("pdfin-theme", nextTheme);
    localStorage.setItem("pdfin-ws-theme", nextTheme);
  }, theme);
}

async function assertThemeBasics(page, expectedTheme) {
  const basics = await page.evaluate(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return {
      theme: root.getAttribute("data-theme"),
      colorScheme: styles.colorScheme,
      heroGradient: styles.getPropertyValue("--gradient-hero"),
      uploadGradient: styles.getPropertyValue("--gradient-upload"),
      canvas: styles.getPropertyValue("--color-canvas"),
      pdfPage: styles.getPropertyValue("--color-pdf-page"),
    };
  });

  if (basics.theme !== expectedTheme) throw new Error(`Expected ${expectedTheme} theme, received ${basics.theme}`);
  if (!basics.colorScheme.includes(expectedTheme)) throw new Error(`Expected color-scheme ${expectedTheme}, received ${basics.colorScheme}`);
  if (expectedTheme === "dark" && /F3EFFC|E8FBFC|243,\s*239,\s*252|232,\s*251,\s*252/i.test(`${basics.heroGradient} ${basics.uploadGradient}`)) {
    throw new Error("Dark theme is still using a light hero/upload gradient.");
  }
  if (basics.pdfPage.trim().toUpperCase() !== "#FFFFFF") throw new Error(`PDF page token should stay white, received ${basics.pdfPage}`);
}

async function assertSolidContrast(page, checks) {
  const failures = [];
  for (const check of checks) {
    const result = await page.locator(check.selector).first().evaluate((element) => {
      const textColor = getComputedStyle(element).color;
      let current = element;
      let backgroundColor = "rgba(0, 0, 0, 0)";
      while (current) {
        const style = getComputedStyle(current);
        if (!style.backgroundColor.endsWith(", 0)") && style.backgroundColor !== "transparent") {
          backgroundColor = style.backgroundColor;
          break;
        }
        current = current.parentElement;
      }
      return { textColor, backgroundColor, text: element.textContent?.trim() || element.getAttribute("aria-label") || "" };
    });
    const fg = parseRgb(result.textColor);
    const bg = parseRgb(result.backgroundColor);
    if (!fg || !bg) {
      failures.push(`${check.name}: could not parse ${result.textColor} on ${result.backgroundColor}`);
      continue;
    }
    const ratio = contrastRatio(fg, bg);
    if (ratio < check.min) failures.push(`${check.name}: ${ratio.toFixed(2)} contrast for "${result.text}"`);
  }
  if (failures.length) throw new Error(failures.join("\n"));
}

async function capture(page, name) {
  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true });
}

await assertServer();
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
try {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await setTheme(page, theme);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await assertThemeBasics(page, theme);
    await assertSolidContrast(page, [
      { name: `${theme} home h1`, selector: "main h1", min: 3 },
      { name: `${theme} home body copy`, selector: "main p", min: 4.5 },
      { name: `${theme} theme toggle`, selector: "header button[aria-pressed]", min: 3 },
      { name: `${theme} first tool card`, selector: "#tool-categories a", min: 4.5 },
    ]);
    await capture(page, `home-${theme}`);

    await page.goto(`${baseUrl}#merge`, { waitUntil: "networkidle" });
    await assertThemeBasics(page, theme);
    await assertSolidContrast(page, [
      { name: `${theme} workspace heading`, selector: "main h1", min: 3 },
      { name: `${theme} upload helper`, selector: "main span", min: 3 },
      { name: `${theme} browse button`, selector: "main button", min: 3 },
    ]);
    await capture(page, `workspace-empty-${theme}`);

    await page.locator("#workspace-main").getByRole("button", { name: /file contoh|sample/i }).click();
    await page.waitForSelector("[data-page-card]", { timeout: 15000 }).catch(() => {});
    await capture(page, `workspace-loaded-${theme}`);
    await page.close();
  }

  const persisted = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await setTheme(persisted, "dark");
  await persisted.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const firstTheme = await persisted.evaluate(() => document.documentElement.getAttribute("data-theme"));
  if (firstTheme !== "dark") throw new Error(`Expected dark theme before app hydration, received ${firstTheme}`);
  await persisted.reload({ waitUntil: "networkidle" });
  await assertThemeBasics(persisted, "dark");
  await persisted.close();
} finally {
  await browser.close();
}

console.log(`Theme verification passed. Screenshots written to ${outputDir}`);
