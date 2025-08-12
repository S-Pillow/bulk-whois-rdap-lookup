# Bulk WHOIS/RDAP Lookup

A full-stack tool for bulk domain WHOIS/RDAP lookups with real‑time streaming results. The frontend is a React app (Vite) and the backend is a FastAPI service that streams results via Server‑Sent Events (SSE).


## Key Features
- **Bulk input**: Paste domains (comma or newline‑separated) or upload a `.txt` file.
- **Live streaming results (SSE)**: Progressively displays results as they arrive.
- **Selectable fields**: Domain, Registrar, Registrant, Domain Status, Registration Date, Nexus Categories (.US), Nameservers.
- **RDAP or WHOIS**: User chooses protocol. RDAP first with WHOIS fallback (when enabled). WHOIS‑only mode also supported.
- **.US special handling**: Robust parsing and a direct whois.nic.us fallback.
- **CSV export**: Exports only visible/selected columns in the current UI order.
- **Resilient parsing**: Frontend SSE parsing handles CRLF/whitespace variations.


## Architecture Overview
- **Frontend** (`frontend/`)
  - React (Vite). Main page: `src/pages/tools/WhoisLookupPage.jsx`.
  - Streams from backend via fetch + ReadableStream, parses SSE events, updates reducer state, renders progress + table.
  - Env var: `VITE_API_BASE_URL`. In production, if not set, defaults to `window.location.origin`.
- **Backend** (`backend/`)
  - FastAPI with `sse_starlette` SSE responses.
  - Primary module: `whois_rdap_service.py` with `POST /whois-lookup`.
  - RDAP via IANA bootstrap → RDAP server → domain query; WHOIS via python‑whois and direct whois calls for .US when needed.
  - Streams JSON records per domain with `event: result`.
- **Server/Proxy**
  - Nginx proxies `/api/whois-lookup` to the FastAPI app and disables proxy buffering for SSE.


## API
Endpoint: `POST /api/whois-lookup`
- Content‑Type: `application/json`
- Response: `text/event-stream` (SSE)

Request body:
```json
{
  "domains": ["example.com", "example.org"],
  "fields": [
    "domain", "registrar", "registrant_name",
    "statuses", "creation_date", "nexus_categories", "nameservers"
  ],
  "use_rdap": true
}
```

Event stream:
- `event: total` → `{ "total": <int> }`
- `event: message` → informational messages
- `event: result` → one JSON result per domain, only with requested fields, e.g.:
```json
{
  "domain": "example.com",
  "registrar": "Registrar Inc.",
  "statuses": ["clientTransferProhibited", "serverDeleteProhibited"],
  "creation_date": "2001-01-01T00:00:00Z",
  "nameservers": ["ns1.example.com", "ns2.example.com"],
  "_method": "RDAP"  // or "WHOIS"
}
```

Notes:
- When `use_rdap` is true, backend uses RDAP first and falls back to WHOIS if needed.
- RDAP status normalization strips ICANN URLs and punctuation, returning plain EPP codes (e.g., `clientDeleteProhibited`).
- When RDAP is used, `registrant_name` and `nexus_categories` are returned as "Not available via RDAP".


## Frontend
- Dev server: Vite
- Main component: `frontend/src/pages/tools/WhoisLookupPage.jsx`
  - Checkbox logic: If "Use RDAP" is enabled, `Registrant` and `Nexus Categories` are auto‑unchecked/disabled and not requested.
  - SSE handling: Uses `fetch()` with `ReadableStream.getReader()`. Robust parsing of `event:` and `data:` lines, supports CRLF.
  - CSV export: Uses PapaParse and file‑saver.

Environment variables:
- Create `frontend/.env.development.local` for dev, `frontend/.env.production` for prod.
- `VITE_API_BASE_URL` options:
  - `/api` (recommended behind Nginx)
  - `https://yourdomain.example/api`
  - If not set, defaults to `window.location.origin` at runtime.


## Backend
- FastAPI app exposes `/whois-lookup` under the `/api` prefix via Nginx.
- Core code: `backend/whois_rdap_service.py`.
  - `LookupRequest` validation, input cleaning, domain limit enforcement.
  - `query_rdap()`: IANA bootstrap → RDAP server, registrar extraction from `entities` vCard. Status normalization → plain EPP codes; splits combined strings, strips URLs.
  - `query_whois()`: python‑whois; for .US, direct whois parsing. Normalizes statuses similar to RDAP.
  - `lookup_and_stream_generator()`: yields events per domain; includes `_method` used.
  - `build_sse_response()`: sets SSE headers and `ping=10` keep‑alives.

Python env:
- Recommended to use a virtualenv in `backend/venv/`.

Run backend (example):
```bash
cd backend
# activate your venv first
uvicorn main:app --host 0.0.0.0 --port 8000
```


## Local Development
- Frontend (Vite dev):
```bash
cd frontend
npm ci
npm run dev
```
- Backend (Uvicorn): see above
- Dev proxy: `vite.config.js` can proxy `/api` to the backend during development.


## Production Build & Deploy
- Frontend build:
```bash
cd frontend
npm ci
npm run build
# output in frontend/dist/
```
- Serve static files via Nginx from `frontend/dist/`.
- Proxy `/api/` to FastAPI. Important Nginx directives for SSE:
  - `proxy_http_version 1.1;`
  - `proxy_set_header Connection '';`
  - `proxy_buffering off;`
  - `chunked_transfer_encoding off;`
  - `proxy_read_timeout 3600;`


## Troubleshooting
- **No results on Start Lookup**
  - Ensure `VITE_API_BASE_URL` is correct or let it default to `window.location.origin`.
  - Check Network tab: Request URL `/api/whois-lookup` and response `Content-Type: text/event-stream`.
  - Confirm the response remains open and data arrives in chunks.
- **Console logs missing in prod**
  - `vite.config.js` is configured to not drop console logs for troubleshooting.
- **RDAP statuses show URLs**
  - Backend normalization in `query_rdap()` strips URLs; restart backend after updates.
- **.US registrant missing**
  - For .US, the direct WHOIS fallback parses registrant, purpose, nexus category from raw output.


## Security Notes
- Do not expose your backend without rate limiting or abuse controls if this will be public.
- Never commit secrets. `.env` files are git‑ignored by default.


## License
Choose a license and add `LICENSE` (MIT recommended for open‑source).
