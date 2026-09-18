# AGENTS.md — AI Agent Workspace Rules & Context
# WORK MATE — Operator Report Generator Console

> This file is read by AI coding agents (Antigravity, Copilot, etc.) at the start of every session.
> Do not delete or modify without team lead approval.

---

## 🔒 Hard Rules — Never Break These

1. **Never commit `.env` files or `firebase_service.json`** to git. These are blocked by `.gitignore`.
2. **Never push directly to `main` branch.** All changes go through feature branches and Pull Requests.
3. **Never remove the `cleanReportForStorage()` call in `reports.js`** before saving to Firestore. Signed URLs must be stripped before DB writes.
4. **Never add fallback BigQuery queries.** BigQuery must strictly use `@startTs` and `@endTs` provided by the operator. No "latest 500 records" fallback. See `CHAT_CONTEXT.md` for details.
5. **Always test and verify locally first (`localhost:3000` / `localhost:5000`).**
6. **MANDATORY: Always ask for explicit user permission before uploading/deploying to Cloud Run or Firebase servers.** Never execute `firebase deploy`, `gcloud builds submit`, or `gcloud run deploy` automatically without asking and receiving user approval first.
7. **Metravi Hardware Bounds & Device Integrity**: When issuing power supply control commands, always validate/clamp voltage within 0.00–30.00 V and current within 0.000–5.000 A on both client and server. Only 'PSU1' and 'PSU2' device identifiers are permitted.

---

## 📁 Project Structure Quick Reference

```
work-mate-report-generator/
├── client/                    # React 19 + Vite frontend
│   └── src/
│       ├── main.jsx           # App entry point (mounts App.jsx into #root)
│       ├── App.jsx            # Top-level routing (home / wizard / editor / power-supply)
│       ├── components/        # All React UI components
│       │   ├── PowerSupplyControl.jsx # Dual Metravi PSU live control & telemetry
│       │   ├── PowerSupplyControl.css # Mobile-responsive layout & touch UX
│       │   └── ...
│       ├── services/
│       │   ├── api.js         # All backend HTTP calls (reports, roles, power-supply)
│       │   └── firebase.js    # Firebase Auth SDK init
│       └── utils/
│           └── chartHelpers.js
│
├── server/                    # Node.js 20 + Express backend
│   └── src/
│       ├── index.js           # Server entry point (Express app, route mounting)
│       ├── routes/
│       │   ├── reports.js     # /api/reports — all report CRUD + upload routes
│       │   ├── roles.js       # /api/roles — RBAC endpoints
│       │   └── powerSupply.js # /api/power-supply — latest, control & history routes
│       ├── services/
│       │   ├── pubsub.js      # Cloud Pub/Sub publisher for remote hardware commands
│       │   ├── bigquery.js    # BigQuery telemetry queries
│       │   ├── firestore.js   # Firestore CRUD
│       │   ├── storage.js     # GCS upload, signed URLs, delete
│       │   └── excelGenerator.js
│       └── middleware/
│           └── auth.js        # Firebase token verification (verifyAuth)
│
├── README.md                  # Developer onboarding guide
├── ARCHITECTURE.md            # Full technical architecture document
├── CHAT_CONTEXT.md            # AI session context & architecture guardrails
├── IMPLEMENTATION_PLAN.md     # RBAC feature design reference
├── TASK.md                    # Completed feature checklist
└── PROGRESS.md                # Phase-by-phase progress log (ALWAYS UPDATE)
```

---

## 🌐 Live Production Endpoints

| Layer | URL / Revision |
|---|---|
| Frontend (Firebase Hosting) | https://grafana-494005.web.app (Bundle: `index-mof5yieT.js` / `index-BJYYkER-.css`) |
| Backend API (Cloud Run asia-south1) | https://report-generator-server-983390035273.asia-south1.run.app (`report-generator-server-00026-54g`) |
| Pub/Sub Control Channel | Topic: `metravi-commands`, Subscription: `metravi-pi-sub` |
| BigQuery Telemetry Table | `grafana-494005.Datas.metravi_power_data` |

---

## 🏗️ Architecture Summary

- **Frontend → Backend**: All API calls use `fetch()` with `Authorization: Bearer <Firebase JWT>` header. In local dev, Vite proxies `/api/**` to `localhost:5000`. In production, Firebase Hosting rewrites `/api/**` to Cloud Run.
- **Auth flow**: Firebase Auth (Google OAuth / Email+Password) on the client → JWT verified by `firebase-admin` on the server.
- **Databases**:
  - **Firestore**: Report documents (`/reports/{reportId}`) and user roles (`/user_roles/{email}`).
  - **BigQuery**: Time-series telemetry (`grafana-494005.Datas` — UCS, SDR, SMP_3RX_SKID, metravi_power_data tables).
  - **GCS**: File storage (`ossusbio-workmate-reports` bucket).
- **Metravi Dual Power Supply Hardware & Cloud Pub/Sub Pipeline**:
  - **Edge Hardware**: Two Metravi 3005P DC bench power supplies connected via USB to Raspberry Pi (`192.168.1.150`). Fixed udev symlinks `/dev/metravi_PSU1` and `/dev/metravi_PSU2`.
  - **Pi Daemon**: `metravi_daemon.service` (`metravi_dual_daemon.py`) streams live voltage, current, and power telemetry to BigQuery table `grafana-494005.Datas.metravi_power_data` every second.
  - **Asynchronous Cloud Control**: Raspberry Pi daemon listens to Cloud Pub/Sub subscription `metravi-pi-sub`. Cloud Run backend (`/api/power-supply/control`) publishes control actions (`SET_VOLTAGE`, `SET_CURRENT`, `TURN_ON`, `TURN_OFF`, `EMERGENCY_STOP`) directly to topic `metravi-commands` with no firewall or public IP required on the Pi.

---

## 🗂️ GCS Storage Layout

### New (Phase 9+) — Run-scoped folders
```
ossusbio-workmate-reports/
└── runs/
    └── {runId}/
        ├── images/
        └── documents/
```

### Legacy (Phases 1–8) — Flat folders
```
ossusbio-workmate-reports/
├── uploads/images/
└── uploads/documents/
```
> Legacy paths remain readable via the `streamGCSFile` fuzzy fallback in `storage.js`. Do not remove this fallback.

---

## 🎨 Design System & Color Palette (Light Blue on Warm Cream)

| Token / Layer | Color Code | Description |
|---|---|---|
| Background Canvas | `#FAF6EE` | Warm Cashmere Canvas |
| Card / Container Glass | `#FFFDF9` | Ivory Glass Card Surface |
| Sticky Table / Header Tint | `#EBF3FC` | Soft Ice Blue Header |
| Subtle Borders | `rgba(37, 99, 235, 0.18)` | Soft Blue Sandstone Borders |
| Primary Text | `#2E2219` | Espresso Dark Charcoal / Solid Black |
| Secondary Text | `#64748B` | Slate Muted Slate |
| Primary Accent / CTAs | `#0284C7` → `#38BDF8` | Light Sky Blue (CTAs, Badges, PT Pills) |
| Secondary Accent | `#C4924F` | Caramel Amber (Break window, EPU pills) |
| Success / Environmental Accent | `#059669` | Emerald Sage (Site pills, Production columns, PDF CTAs) |
| Alert / Warning Accent | `#DC2626` | Crimson Alert (Diagnostic alerts) |

### 🖨️ PDF & Print Engine Guardrails (`@media print` in `index.css`)
- **Print Background**: Always `#FFFFFF` pure white with `#0F172A` high-resolution black text.
- **Card Alignment**: Side-by-side cards (`.print-row-grid`) stay 2-column flex; parameter grid stays 4-column.
- **Anti-Split Protection**: All cards and charts use `break-inside: avoid !important; page-break-inside: avoid !important;`.
- **Clean Document Title**: `EditableTable.jsx` sets `document.title = runName` before triggering `window.print()`.

### 📱 Mobile Responsiveness & Layout Guidelines (`PowerSupplyControl.css`)
- Support mobile viewports down to 360px screen width.
- On screens $\le$ 768px (`@media (max-width: 768px)`), collapse 2-column desktop grids into a single-column layout.
- Wrap quick-preset buttons, sliders, and action pills onto multiple lines with thumb-friendly touch targets ($\ge$ 44px height and width).
- Always wrap wide data tables in a dedicated `.table-scroll-container` with `overflow-x: auto` and `-webkit-overflow-scrolling: touch` to prevent table cells from overflowing or breaking the mobile page container.

---

## 🔑 Key Patterns

### canEdit Logic (do not change without review)
```js
const isDevAdmin = DEV_EMAILS.includes(currentUserEmail); // static fallback
const isOwner = !report?.createdBy || (report.createdBy.toLowerCase() === currentUserEmail);
const canEdit = isOwner || isDevAdmin; // also checked against Firestore /user_roles
```

### Adding a New API Endpoint
1. Add route handler in `server/src/routes/reports.js`, `roles.js`, or `powerSupply.js`.
2. Add corresponding fetch call in `client/src/services/api.js`.
3. Protect with `verifyAuth` middleware if authentication is required.

### Sending Power Supply Commands
```js
// POST /api/power-supply/control
// Body: { device: 'PSU1' | 'PSU2', action: 'SET_VOLTAGE' | 'SET_CURRENT' | 'TURN_ON' | 'TURN_OFF' | 'EMERGENCY_STOP', target_voltage?: number, target_current?: number }
// Authenticated via verifyAuth; publishes to Google Cloud Pub/Sub topic 'metravi-commands'.
```

### Uploading Files
- Images: `POST /api/reports/upload-image` — accepts `photo` (multipart) or `base64Image` (JSON).
- Documents: `POST /api/reports/upload-document` — accepts `document` (multipart).
- Both endpoints accept an optional `runId` field (Phase 9+) to scope into `runs/{runId}/` folder.

---

## 📋 Before Starting Any Task

1. Read `PROGRESS.md` to understand the current phase.
2. Read `CHAT_CONTEXT.md` for architectural guardrails.
3. Check `TASK.md` to see what has already been implemented.
4. Do not modify any file without stating which files you will change and getting confirmation.
5. After completing a task, update `PROGRESS.md` with the new phase and what was done.
