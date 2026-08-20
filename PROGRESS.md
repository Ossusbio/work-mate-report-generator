# Project Progress Log — WORK MATE Operator Report Generator

> Last Updated: **2026-08-19** (GCS Run-Scoped Folder Upload — Phase 9 Planned)

---

## ✅ Completed Features

### Phase 1 — Core Report Wizard
- [x] **7-Step Report Wizard**: Basic Details → Electrode Details → Datastreams → Samples → Reference → Raw Data → Report Generation
- [x] **BigQuery Telemetry Integration**: IST timezone conversion, UCS/SMP_3RX_SKID/SDR tables
- [x] **Firestore Draft Storage**: /reports/{reportId} with merge-on-update strategy
- [x] **Firebase Auth**: @ossusbio.com email restriction
- [x] **Editable Raw Data Table**: Inline BigQuery row editing before finalizing
- [x] **Print-to-PDF Export**: Clean print styling

### Phase 2 — Graph Configuration Upgrades
- [x] Bar Chart for Date X-Axis, Daily Average Aggregation
- [x] Multi-Y-Axis Checkbox Selector (max 3 datastreams, independent scales)
- [x] User-Entered Sample Values in Graphs (H2%, CO2%, pH, TDS, EC sample columns)

### Phase 3 — Deletion Audit Logging & GCS File Cleanup
- [x] BigQuery audit table for deletions
- [x] Automatic GCS file deletion on report delete
- [x] ConfirmModal dialogs for all destructive operations

### Phase 4 — WORK MATE v3.0 & Dynamic RBAC (up to 2026-08-17)
- [x] Brand Refresh to WORK MATE
- [x] Developer vs User Mode toggle
- [x] Dynamic User Access Control (Firestore /user_roles/{email})
- [x] Developer Dashboard with real-time health monitoring
- [x] Electrode Details wizard step (11 parameters)
- [x] Run Owner, Effluent Volume, Inoculation, Inference, Additional Notes, Gas Production fields
- [x] Report Ownership & Access Control (canEdit logic)
- [x] Global Run Name Deduplication (409 Conflict)
- [x] History Search Filters (Date, Owner, Name)
- [x] AM/PM 12-Hour Time Format throughout
- [x] Browser Back & Mobile Swipe Navigation (pushState/popstate)
- [x] Document Signed URLs (GCS v4 signed URLs)

### Phase 5 — Mobile UI & UX Improvements (2026-08-14)
- [x] Mobile portrait layout - responsive CSS for all sections
- [x] Wizard Step pills with icons, labels, visible progress on mobile
- [x] Datastream clear button surfaced inline (outside dropdown)
- [x] PDF named by Run Name (document.title = runName before print)
- [x] InvalidParametersModal.jsx - pre-generate validation with Fix→ quick-jump buttons
- [x] Document Note/Description field on Step 5 (Reference Files)
- [x] Fixed ReferenceError: doc→docObj in EditableTable.jsx
- [x] mobile-web-app-capable meta tag in index.html

### Phase 6 — Backend Query Hardening (2026-08-18 AM)
- [x] **Removed "Latest 500 Records" fallback query**: BigQuery now strictly uses operator-provided @startTs/@endTs
- [x] **Removed 0-row fallback query**: No second auto-query when main query returns 0 rows
- [x] **Validation Modal enforces required fields**: Start Time, End Time, Run Name, Datastreams all required before any BigQuery call
- [x] Cloud Run Revision: report-generator-server-00021-4rn deployed

### Phase 7 — Critical Bug Fixes (2026-08-18 PM)
- [x] **Report Deletion Error Fixed**: logReportDeletion was called in routes/reports.js but never exported from services/bigquery.js. Implemented + exported the function. Wrapped call in try/catch so audit logging never blocks actual deletion. Cloud Run: report-generator-server-00022-5tk
- [x] **InvalidParametersModal Actually Rendered**: Modal was imported but never inserted into JSX tree. Added <InvalidParametersModal /> to OperatorForm.jsx return, wired to showValidationModal state and goToTab() navigation callback.
- [x] **Batch-Alpha-04 (RUN-20260818-3120) Crash Fixed**: Report was crashing on open due to doc.note/doc.description references inside EditableTable.jsx document note rendering. Variable doc was referencing undefined outer scope instead of docObj. All instances replaced with docObj?.note || docObj?.description || p?.docNote using optional chaining.

### Phase 8 — Strict View-Only Mode (2026-08-18 PM)
- [x] **fieldset disabled wrapper**: When !canEdit, entire wizard content wrapped in <fieldset disabled={!canEdit} className="view-only-fieldset">. Natively disables all inputs, selects, textareas across all 7 steps
- [x] **disabled prop added to child components**:
  - ElectrodeDetails.jsx: disabled prop blocks handleChange
  - DataStreamSelector.jsx: disabled prop blocks handleAdd/handleRemove/handleClearCategory; <select disabled>
  - DynamicSampleTable.jsx: disabled prop blocks mutations; Add Sample and Delete Row hidden
  - CameraCapture.jsx: disabled prop accepted
- [x] **Generate buttons hidden in view-only**: Step 7 buttons replaced with status: "Report Generation is disabled in View-Only mode"
- [x] **Enhanced amber banner**: Prominent header "Lock View-Only Mode (All Fields Locked)" with creator email shown
- [x] **CSS .view-only-fieldset**: cursor:not-allowed, reduced border opacity, greyed text (#94a3b8) for all disabled inputs
- [x] Frontend redeployed: bundle index-C2C9UmQx.js + index-DI-QFPUQ.css

---

## 🚀 Current Live Deployment

| Layer | Revision / Bundle |
|---|---|
### Phase 9 — GCS Run-Scoped Folder Upload (2026-08-19)
- [x] **Run-Scoped GCS Subfolders**: `runs/{runId}/images/` and `runs/{runId}/documents/`
- [x] **Backend Support**: `saveReferenceImage` & `saveReferenceDocument` in `storage.js`, `runId` handling in `reports.js`
- [x] **Frontend Integration**: `runId` passed from `OperatorForm.jsx` and `CameraCapture.jsx` via `api.js`
- [x] **Production Deployment**: Cloud Run revision `report-generator-server-00023-w6b` + Firebase Hosting deployed

### Phase 10 — Automatic GCS File Deletion on Photo/Doc Removal (2026-08-19)
- [x] **Backend GCS Deletion Endpoint**: `POST /api/reports/delete-file` with `extractGcsPath()` and `deleteFromGCS()`
- [x] **Frontend API**: `deleteStorageFile()` in `client/src/services/api.js`
- [x] **Photo Removal Cleanup**: `CameraCapture.jsx` triggers GCS deletion on photo removal confirmation
- [x] **Document Removal Cleanup**: `OperatorForm.jsx` triggers GCS deletion on attached document removal confirmation
- [x] **Local Verification**: 100% automated test pass verifying live object removal from bucket

### Phase 11 — GCS Bucket Migration to ossusbio-workmate-reports (2026-08-20)
- [x] **New GCS Bucket Created**: `ossusbio-workmate-reports` created in region `asia-south1` (Mumbai)
- [x] **Data Migration**: All 68 existing run files and historical reports copied from `ossusbio-monthly-reports` to `ossusbio-workmate-reports`
- [x] **Code & Config Updated**: Default bucket configured to `process.env.GCS_BUCKET_NAME || 'ossusbio-workmate-reports'` in `storage.js` and `index.js`
- [x] **Local Verification**: Local backend running and verified against new bucket `ossusbio-workmate-reports`

### Phase 12 — Mandatory Sampling Frequency & Descending UI Order (2026-08-20)
- [x] **Enforced Sampling Frequency Selection**: Dropdown defaults to `-- Select Sampling Frequency --` placeholder to require explicit operator selection
- [x] **Pre-Generate Validation Modal Integration**: Validation blocks report generation on unselected frequency with step-specific message and `Fix →` button
- [x] **Dynamic Button & Warning State**: "Fetch BigQuery Data" button is disabled and amber guide banner is shown until frequency is chosen
- [x] **Descending Interval Ordering**: Frequency options arranged in descending order from Every 1 Hour down to All Rows (No Sampling / Every 1 Sec)
- [x] **Local Verification & Build**: Verified via automated browser end-to-end test and Vite production build (`dist/assets/index-Bx5hg4dr.js`)

---

## 🚀 Current Production Deployment Status

| Layer | URL / Version |
|---|---|
| Frontend (Firebase Hosting) | https://grafana-494005.web.app |
| Backend (Cloud Run asia-south1) | report-generator-server-00025-zpq |
| Database | Firestore - `/reports` collection & `/user_roles` |

- **Web App**: https://grafana-494005.web.app
- **Backend API**: https://report-generator-server-983390035273.asia-south1.run.app

---

## 📋 Known Technical Debt & Notes
- DeveloperPanel.jsx dynamic import of firebase.js causes Vite warning (cosmetic only, does not break functionality)
- Bundle size ~645kB / 193kB gzipped — consider lazy-loading DeveloperPanel in future
- multer@1.4.5-lts.2 has known vulnerabilities — plan upgrade to multer@2.x in maintenance window


