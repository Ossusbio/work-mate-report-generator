# Antigravity Workspace Context — Operator Report Generator Console

> Last Updated: **2026-08-18** (Phase 8 — Strict View-Only Mode)

---

## 🌐 Live Global Production Deployment

The application is fully deployed globally on Google Cloud Infrastructure and runs 24/7/365 independent of local development machines:

* **Global Web App (CDN)**: https://grafana-494005.web.app (Firebase Hosting)
* **Backend API**: https://report-generator-server-983390035273.asia-south1.run.app (Cloud Run asia-south1 / Mumbai)
* **Cloud Run Revision**: report-generator-server-00022-5tk
* **Frontend Bundle**: index-C2C9UmQx.js / index-DI-QFPUQ.css
* **Database**: Google Firestore (reports) + BigQuery (grafana-494005.Datas)
* **File Storage**: Google Cloud Storage bucket ossusbio-monthly-reports
* **Secret Manager**: Secret firebase-service-account (injected into Cloud Run at runtime)
* **GCP Project**: grafana-494005 (Project Number: 983390035273)

---

## 🏗️ Project File Structure

`
report genrator v1/
├── PROGRESS.md                         # Feature/phase progress log (ALWAYS UPDATE)
├── CHAT_CONTEXT.md                     # This file - workspace context for AI sessions
├── TASK.md                             # Completed checklist of implemented features
├── IMPLEMENTATION_PLAN.md              # RBAC architecture reference doc
│
├── client/                             # React + Vite frontend
│   ├── dist/                           # Production build output
│   ├── firebase.json                   # Firebase Hosting proxy rules (/api/** -> Cloud Run)
│   ├── index.html                      # Entry HTML with mobile theme meta tags
│   └── src/
│       ├── index.css                   # Glassmorphism + @media print + mobile + .view-only-fieldset
│       ├── App.jsx                     # Top-level routing (home/wizard/editor views)
│       └── components/
│           ├── CameraCapture.jsx       # Multi-image capture/upload (max 3, disabled prop added)
│           ├── ConfirmModal.jsx        # Reusable confirmation dialog
│           ├── DataStreamSelector.jsx  # BigQuery column selector (disabled prop added)
│           ├── DeveloperPanel.jsx      # Developer mode health + user management panel
│           ├── DynamicSampleTable.jsx  # GC & Water sample tables (disabled prop added)
│           ├── EditableTable.jsx       # Report view - all params, charts, images, docs (docObj fix applied)
│           ├── ElectrodeDetails.jsx    # Electrode config step (disabled prop added)
│           ├── InvalidParametersModal.jsx  # Pre-generate validation modal with Fix→ quick-jump buttons
│           ├── LoginPage.jsx           # Google Auth login page
│           ├── Navbar.jsx              # Header bar with mode toggle
│           ├── OperatorForm.jsx        # 7-step wizard (fieldset disabled wrapper for view-only)
│           └── ReportHistory.jsx       # Past reports dashboard with search filters
│       ├── utils/
│       │   └── chartHelpers.js         # Unified chart data & options builder (BQ + sample overlay)
│       └── services/
│           ├── api.js                  # Axios API client (generateReport, uploadDocument, etc.)
│           └── firebase.js             # Firebase SDK client init
│
└── server/                             # Node.js + Express backend
    ├── Dockerfile                      # Cloud Run container definition
    ├── .dockerignore
    ├── firebase_service.json           # GCP credentials (local dev mode only)
    └── src/
        ├── index.js                    # Express server entry point
        ├── middleware/auth.js          # Auth check + Secret Manager JSON support
        ├── routes/
        │   ├── reports.js              # Report CRUD + GCS cleanup + logReportDeletion (safe try/catch)
        │   └── roles.js               # Dynamic RBAC endpoints (my-role, users, update, grant)
        └── services/
            ├── bigquery.js             # Strict timestamp queries (NO fallback) + logReportDeletion() export
            ├── firestore.js            # Firestore CRUD (saveReportDraft, getReportById, getAllReports, deleteReport)
            ├── excelGenerator.js       # Excel export with Reference Document + docNote section
            └── storage.js             # GCS (ossusbio-monthly-reports) + v4 signed URLs + extractGcsPath()
`

---

## 🔑 Key Architecture Decisions (Do Not Change Without Review)

### canEdit Logic
`js
const currentUserEmail = (user?.email || '').toLowerCase();
const isDevAdmin = DEV_EMAILS.includes(currentUserEmail);
const isOwner = !report?.createdBy || (report.createdBy.toLowerCase() === currentUserEmail);
const canEdit = isOwner || isDevAdmin;
`
- DEV_EMAILS is a static fallback array checked in addition to Firestore /user_roles/{email} dynamic check
- canEdit gates: all input fields (via fieldset), all action buttons, Save Draft, Generate Report

### View-Only Mode
- <fieldset disabled={!canEdit} className={!canEdit ? 'view-only-fieldset' : ''}>  wraps entire wizard content
- Child components accept disabled={!canEdit} prop: ElectrodeDetails, DataStreamSelector, DynamicSampleTable, CameraCapture
- Step 7 generate buttons conditionally rendered only when canEdit === true

### BigQuery Query — STRICT MODE (No Fallbacks)
- Queries **must** receive @startTs and @endTs parameters (IST timestamps converted to UTC)
- No "latest 500 records" fallback, no "latest 100 when 0 rows" fallback
- All required parameters enforced by InvalidParametersModal before any API call

### Report Deletion Flow
1. Confirm email match (frontend + backend)
2. logReportDeletion(runId, runName, email) — try/catch wrapped, never blocks deletion
3. Delete GCS reference images (uploads/images/)
4. Delete GCS uploaded document (uploads/documents/)
5. deleteReport(reportId) from Firestore

---

## 🛠️ Deployment & Maintenance Commands

### Redeploy Backend API to Cloud Run (if server/src/** changes)
`powershell
cd "C:\Users\sachi\Desktop\report genrator v1\server"
& "C:\Users\sachi\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" builds submit --tag gcr.io/grafana-494005/report-generator-server --project=grafana-494005
& "C:\Users\sachi\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" run deploy report-generator-server --image gcr.io/grafana-494005/report-generator-server:latest --region=asia-south1 --project=grafana-494005 --quiet
`

### Redeploy Frontend to Firebase Hosting (if client/src/** changes)
`powershell
cd "C:\Users\sachi\Desktop\report genrator v1\client"
npm run build
="C:\Users\sachi\Desktop\report genrator v1\server\firebase_service.json"
.\node_modules\.bin\firebase deploy --only hosting --project grafana-494005
`

---

## 📌 Session Notes for Next Developer

- **No Local Dev Server Required**: App is 100% cloud-hosted. Hard reload browser (Ctrl+Shift+R) after any frontend deploy to bust cache.
- **Service Account**: irebase-adminsdk-fbsvc@grafana-494005.iam.gserviceaccount.com — roles: BigQuery Data Editor, Storage Object Admin, Cloud Run Viewer, Firebase Admin
- **GCS Bucket**: ossusbio-monthly-reports → photos at uploads/images/, docs at uploads/documents/
- **Firestore Collections**: eports (13 docs), user_roles (dynamic RBAC)
- **BigQuery Dataset**: grafana-494005.Datas — tables: UCS, SDR, SMP_3RX_SKID, eport_deletions_log (audit)

---

## 🐛 Bug History (Resolved)

| Date | Bug | Root Cause | Fix |
|---|---|---|---|
| 2026-08-14 | Report view crash (doc is not defined) | Variable doc used instead of docObj in EditableTable.jsx | Renamed to docObj, used optional chaining |
| 2026-08-18 | Report deletion: logReportDeletion is not a function | Function not exported from bigquery.js | Implemented + exported function, wrapped call in try/catch |
| 2026-08-18 | InvalidParametersModal never appeared | Component imported but not rendered in JSX | Added <InvalidParametersModal /> to OperatorForm.jsx JSX |
| 2026-08-18 | Batch-Alpha-04 "Something went wrong" | doc.note / doc.description undefined reference in EditableTable.jsx | Replaced with docObj?.note || docObj?.description || p?.docNote |
