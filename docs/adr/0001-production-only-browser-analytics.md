# 0001. Production-only browser analytics

## Status

Accepted

## Context

PDFin Browser Tools process supported documents in the user's browser. The product needs basic funnel visibility for tool usage, file selection, processing outcomes, and downloads, while preserving the promise that document content is not sent to PDFin processing servers.

## Decision

PDFin uses Google Analytics 4 only in production builds for aggregate Browser Tool funnel events.

The allowed event payload is limited to aggregate fields: `tool`, `file_count`, `page_count`, `output_count`, `duration_ms`, and `error_category`. Events must not include filenames, document content, passwords, OCR text, search text, raw file sizes, or document-identifying metadata.

## Consequences

Production analytics can show funnel drop-off without polluting reports with local development traffic. Developers cannot validate GA collection from normal local dev unless they run or deploy a production build.

Privacy-facing copy must distinguish aggregate analytics events from document processing: analytics may leave the browser, but document contents and sensitive PDF inputs must not be sent as analytics parameters.
