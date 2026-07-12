# PDFin Self-hosted Product Definition

Status: Tahap 1 design draft. This is not a public availability promise.

PDFin Self-hosted is the product line for organizations that need PDF processing inside infrastructure they manage. The API is part of PDFin Self-hosted, not a separate hosted cloud product.

## Target Users

- Internal application teams integrating PDF operations into business systems.
- Workflow automation teams handling document-heavy processes.
- Organizations that do not want documents sent to third-party SaaS processing.
- Private cloud, VPC, and on-premise environments that need assisted deployment.

## Product Boundary

PDFin Self-hosted may include a processing service, versioned API, container package, configuration reference, health/readiness endpoints, deployment documentation, security documentation, and temporary-storage cleanup behavior.

PDFin Self-hosted does not automatically include PDFin-managed hosted processing, self-service deployment, public cloud API, 24/7 support, SLA, compliance certification, unlimited file size/page count/concurrency/OCR throughput, air-gapped support, high availability, Kubernetes, or Helm unless those capabilities are built, tested, and documented.

## Initial Capability Matrix

| Operation | Browser Tools | Self-hosted API candidate | Tahap 2 target | Processing engine | Limitations |
| --- | --- | --- | --- | --- | --- |
| Merge PDF | Available | Candidate | Stable candidate | pdf-lib | File/page limits must be explicit. |
| Split PDF | Available | Candidate | Stable candidate | pdf-lib | Range validation and output count limits required. |
| Watermark PDF | Available | Candidate | Beta candidate | pdf-lib | Image watermark handling requires temp storage rules. |
| Protect PDF | Available | Candidate | Beta candidate | qpdf-wasm or server qpdf | Password must never be logged. |
| Flatten PDF | Available with limitations | Candidate | Beta candidate | pdf-lib or server engine | Generic annotation flattening is limited today. |
| Image to PDF | Available | Candidate | Beta candidate | pdf-lib | Input formats and image size limits required. |
| OCR PDF | Available in browser | Heavy-workload candidate | Experimental/Beta only after resource model approval | Tesseract runtime | CPU, memory, language packs, queueing, and timeout rules required. |
| Metadata | Available | Later candidate | Not selected by default | pdf-lib | Metadata fields must be schema-limited. |
| PDF to Image | Available | Later candidate | Not selected by default | PDF renderer | Output count and image size can grow quickly. |

This matrix is a planning artifact. Do not market an operation as Self-hosted API-supported until the service, API contract, tests, and deployment documentation exist.

## Recommended Tahap 2 API Direction

Use an asynchronous job model for all MVP operations:

- `GET /api/v1/capabilities`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs/{jobId}`
- `GET /api/v1/jobs/{jobId}/result`
- `DELETE /api/v1/jobs/{jobId}`
- `GET /health/live`
- `GET /health/ready`

Rationale: OCR and large PDF operations need timeout, cancellation, queue, and temporary-storage management. A single job contract is easier to document and support during assisted deployment.

## Security Defaults

- API key authentication for MVP.
- No telemetry to PDFin by default.
- No filename, password, OCR text, document metadata, authorization header, or multipart body in logs.
- Generated internal job identifiers; original filenames are not filesystem paths.
- Per-job temporary directories with restrictive permissions.
- Cleanup on success, failure, cancellation, startup stale-job scan, and TTL expiry.
- Resource limits for file size, page count, concurrent jobs, queue size, processing duration, temp disk, OCR worker count, CPU, and memory guidance.

## Assisted Deployment Notes

Initial distribution should be assisted. Each pilot must define supported operations, deployment environment, installation and rollback procedure, known limitations, data handling statement, support channel, and success criteria.

Do not accept sensitive production documents in pilots until data flow, storage behavior, logging sanitization, access control, and cleanup are verified.
