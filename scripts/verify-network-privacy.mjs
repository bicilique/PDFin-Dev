import { chromium } from "playwright";

const baseUrl = process.env.PDFIN_VERIFY_URL || "http://127.0.0.1:5173";
const sensitiveMarkers = [
  "contoh-laporan-tahunan.pdf",
  "contoh-lampiran.pdf",
  "dummy-secret-password",
  "ocr-private-text",
];

function assertNoSensitiveRequests(requests) {
  const nonLocal = requests.filter((request) => !request.url.startsWith(baseUrl));
  if (nonLocal.length) {
    throw new Error(`Unexpected non-local requests:\n${nonLocal.map((request) => request.url).join("\n")}`);
  }

  const nonGet = requests.filter((request) => request.method !== "GET");
  if (nonGet.length) {
    throw new Error(`Unexpected non-GET requests:\n${nonGet.map((request) => `${request.method} ${request.url}`).join("\n")}`);
  }

  const payloadHits = requests.filter((request) =>
    sensitiveMarkers.some((marker) => request.postData?.includes(marker) || request.url.includes(marker))
  );
  if (payloadHits.length) {
    throw new Error(`Sensitive marker appeared in network request:\n${payloadHits.map((request) => request.url).join("\n")}`);
  }
}

async function collectPageRequests(browser, path, interact) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const requests = [];
  page.on("request", (request) => {
    requests.push({
      method: request.method(),
      url: request.url(),
      postData: request.postData() || "",
    });
  });

  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  if (interact) await interact(page);
  await page.close();
  return requests;
}

async function main() {
  const browser = await chromium.launch();
  try {
    const homeRequests = await collectPageRequests(browser, "/", null);
    assertNoSensitiveRequests(homeRequests);

    const directToolRequests = await collectPageRequests(browser, "/ocr/", null);
    assertNoSensitiveRequests(directToolRequests);

    const mergeRequests = await collectPageRequests(browser, "/merge/", async (page) => {
      await page.locator("#workspace-main").getByRole("button", { name: /coba dengan file contoh/i }).click();
      await page.getByRole("button", { name: "Gabung PDF" }).last().click();
      await page.getByRole("heading", { name: /selesai/i }).waitFor({ timeout: 30000 });
    });
    assertNoSensitiveRequests(mergeRequests);
  } finally {
    await browser.close();
  }

  console.log("Network privacy verification passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
