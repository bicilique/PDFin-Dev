export const MEASUREMENT_ID = "G-Q5ELEHBGW4";

const GTAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
const SAFE_EVENT_PARAMS = new Set([
  "tool",
  "file_count",
  "page_count",
  "output_count",
  "duration_ms",
  "error_category",
  "file_type",
  "file_size_bucket",
]);

function sanitizeParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([key, value]) => SAFE_EVENT_PARAMS.has(key) && value !== undefined && value !== null)
      .map(([key, value]) => [key, typeof value === "number" ? Math.round(value) : value])
  );
}

export function createAnalytics({
  isProd = false,
  documentRef = typeof document !== "undefined" ? document : null,
  windowRef = typeof window !== "undefined" ? window : null,
  now = () => new Date(),
} = {}) {
  let initialized = false;

  function enabled() {
    return Boolean(isProd && documentRef && windowRef);
  }

  function initAnalytics() {
    if (!enabled() || initialized) return;
    initialized = true;

    windowRef.dataLayer = windowRef.dataLayer || [];
    windowRef.gtag = windowRef.gtag || function gtag() {
      windowRef.dataLayer.push(arguments);
    };

    const script = documentRef.createElement("script");
    script.async = true;
    script.src = GTAG_SRC;
    documentRef.head.appendChild(script);

    windowRef.gtag("js", now());
    windowRef.gtag("config", MEASUREMENT_ID);
  }

  function trackPdfEvent(eventName, params = {}) {
    if (!enabled()) return;
    initAnalytics();
    windowRef.gtag("event", eventName, sanitizeParams(params));
  }

  return { initAnalytics, trackPdfEvent };
}

const analytics = createAnalytics({ isProd: import.meta.env.PROD });

export const initAnalytics = analytics.initAnalytics;
export const trackPdfEvent = analytics.trackPdfEvent;
