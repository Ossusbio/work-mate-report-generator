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

---

## 📁 Project Structure Quick Reference

```
work-mate-report-generator/
├── client/                    # React 19 + Vite frontend
│   └── src/
│       ├── main.jsx           # App entry point (mounts App.jsx into #root)
│       ├── App.jsx            # Top-level routing (home / wizard / editor)
│       ├── components/        # All React UI components
│       ├── services/
│       │   ├── api.js         # All backend HTTP calls (fetch-based)
│       │   └── firebase.js    # Firebase Auth SDK init
│       └── utils/
│           └── chartHelpers.js
│
├── server/                    # Node.js 20 + Express backend
│   └── src/
│       ├── index.js           # Server entry point (Express app, route mounting)
│       ├── routes/
│       │   ├── reports.js     # /api/reports — all report CRUD + upload routes
│       │   └── roles.js       # /api/roles — RBAC endpoints
│       ├── services/
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

| Layer | URL |
|---|---|
| Frontend (Firebase Hosting) | https://grafana-494005.web.app |
| Backend API (Cloud Run asia-south1) | https://report-generator-server-983390035273.asia-south1.run.app |

---

## 🏗️ Architecture Summary

- **Frontend → Backend**: All API calls use `fetch()` with `Authorization: Bearer <Firebase JWT>` header. In local dev, Vite proxies `/api/**` to `localhost:5000`. In production, Firebase Hosting rewrites `/api/**` to Cloud Run.
- **Auth flow**: Firebase Auth (Google OAuth / Email+Password) on the client → JWT verified by `firebase-admin` on the server.
- **Databases**:
  - **Firestore**: Report documents (`/reports/{reportId}`) and user roles (`/user_roles/{email}`).
  - **BigQuery**: Time-series telemetry (`grafana-494005.Datas` — UCS, SDR, SMP_3RX_SKID tables).
  - **GCS**: File storage (`ossusbio-workmate-reports` bucket).

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

## 🔑 Key Patterns

### canEdit Logic (do not change without review)
```js
const isDevAdmin = DEV_EMAILS.includes(currentUserEmail); // static fallback
const isOwner = !report?.createdBy || (report.createdBy.toLowerCase() === currentUserEmail);
const canEdit = isOwner || isDevAdmin; // also checked against Firestore /user_roles
```

### Adding a New API Endpoint
1. Add route handler in `server/src/routes/reports.js` or `roles.js`.
2. Add corresponding fetch call in `client/src/services/api.js`.
3. Protect with `verifyAuth` middleware if authentication is required.

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
