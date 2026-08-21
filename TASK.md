# WORK MATE v3.0 — Task Checklist

## Component 1: Login & Branding
- [x] Update LoginPage.jsx — "WORK MATE" branding, remove Firebase badge
- [x] Update Navbar.jsx — "WORK MATE" header

## Component 2: Developer/User Mode Toggle
- [x] Add mode toggle to App.jsx + Navbar
- [x] Create DeveloperPanel.jsx
- [x] Create backend GET /api/health/detailed endpoint

## Component 3: Deletion Verification
- [x] Add confirmation modal for report delete in ReportHistory.jsx
- [x] Add confirmation popup for image/doc removal in CameraCapture.jsx & OperatorForm.jsx
- [x] Add GCS file cleanup in backend DELETE route
- [x] Add deleteFromGCS() helper to storage.js

## Component 4: Electrode Details Wizard Step
- [x] Create ElectrodeDetails.jsx component
- [x] Insert as Step 2 in OperatorForm.jsx TABS
- [x] Add electrode state variables + save to report payload

## Component 5: New Parameters
- [x] Add Run Owner, Effluent Volume (number), Inoculation to Step 1
- [x] Add Inference, Additional Notes, Total Mixed Gas Production, Total H2 Production to Generate step
- [x] Display all new fields in EditableTable.jsx preview

## Component 6: Report Ownership & Access Control
- [x] Save createdBy on report creation
- [x] Add read-only mode for non-owners in wizard/editor
- [x] Update ReportHistory.jsx buttons based on ownership
- [x] Add backend ownership check on PUT
- [x] Developer admin override for authorized emails

## Component 7: Run Name Deduplication
- [x] Backend duplicate check on POST (409 Conflict)
- [x] Frontend validation error display

## Component 8: Mobile Swipe-Back & Browser Back
- [x] Add pushState navigation in App.jsx
- [x] Listen to popstate event

## Component 9: Search Filters in Report History
- [x] Add Date range filter
- [x] Add Run Owner filter dropdown
- [x] Update filter logic

## Component 10: Time Format (AM/PM)
- [x] Fix time display in EditableTable.jsx & sample tables

## Component 11: EC Unit & User Values in Graph Dropdown
- [x] Change EC unit to mS/cm
- [x] Add user-entered sample values to Y-Axis dropdown

## Component 12: Cloud Deployments & GCS Signed URLs
- [x] Deploy backend to Cloud Run (report-generator-server-00022-5tk)
- [x] Deploy frontend to Firebase Hosting
- [x] Fix document signed URLs generation
- [x] Grant automated CI/CD IAM permissions to service account

## Component 13: Mobile UI Polish (2026-08-14)
- [x] Responsive CSS for mobile portrait layout (all form sections)
- [x] Wizard step pills: icons, labels, progress indicator visible on mobile
- [x] Horizontal scrollable wizard tab bar on mobile

## Component 14: UX Improvements (2026-08-14)
- [x] Datastream clear button surfaced inline (outside dropdown)
- [x] PDF download uses Run Name as filename (document.title before print)
- [x] InvalidParametersModal.jsx: pre-generate validation, Fix→ per-step quick-jump buttons
- [x] Document Note/Description field (Step 5 Reference Files)

## Component 15: Backend Query Hardening (2026-08-18)
- [x] Removed Latest-500-Records fallback from bigquery.js
- [x] Removed 0-row Latest-100 fallback from bigquery.js
- [x] BigQuery now strictly requires @startTs and @endTs (enforced by InvalidParametersModal)
- [x] Cloud Run: report-generator-server-00021-4rn

## Component 16: Critical Bug Fixes (2026-08-18)
- [x] logReportDeletion is not a function — implemented + exported from bigquery.js, safe try/catch in reports.js
- [x] InvalidParametersModal never shown — added <InvalidParametersModal /> to OperatorForm.jsx JSX
- [x] doc is not defined crash in EditableTable.jsx — all doc.note/doc.description → docObj?.note/docObj?.description
- [x] Cloud Run: report-generator-server-00022-5tk

## Component 17: Strict View-Only Mode (2026-08-18)
- [x] fieldset disabled={!canEdit} wraps entire wizard content panel
- [x] CSS class view-only-fieldset: cursor not-allowed, greyed inputs, reduced border opacity
- [x] disabled prop added to: ElectrodeDetails, DataStreamSelector, DynamicSampleTable, CameraCapture
- [x] Step 7 generate/save buttons replaced with view-only status indicator
- [x] Prominent amber header banner: Lock View-Only Mode All Fields Locked
- [x] Frontend redeployed: index-C2C9UmQx.js

## Component 18: Mandatory Sampling Frequency & Descending UI (2026-08-20)
- [x] Mandatory sampling frequency selection with default placeholder `-- Select Sampling Frequency --`
- [x] Validation modal integration blocking report generation when frequency is missing
- [x] "Fetch BigQuery Data" button disabled & amber warning banner displayed until frequency selected
- [x] Frequency options ordered in descending order (1 Hour → 30 Min → 15 Min → 5 Min → 1 Min → All Rows / 1 Sec)
- [x] Frontend bundle verified: `dist/assets/index-Bx5hg4dr.js`

## Component 19: Horizontal Wizard Stepper & Sticky Top Freezing (2026-08-20)
- [x] Full-width horizontal scrolling stepper bar replacing vertical left sidebar
- [x] Sticky top freezing (`top: 10px; z-index: 1000`) with dark glassmorphic blur and shadow
- [x] Fixed root clipping (`overflow-x: clip;` on `html, body`) for cross-browser sticky support
- [x] 220px reclaimed width for spacious electrode, datastream, and raw data tables
- [x] Production bundle deployed: `dist/assets/index-Bush9cYn.css` + `dist/assets/index--WCSHExU.js`

## Component 20: PDF Graph Alignment, Anti-Split Tables & Upload Resilience (2026-08-21)
- [x] Full-height chart canvas (340px) with bottom layout padding (16px) enclosing all graph lines and X/Y axes
- [x] Universal anti-split rules (`page-break-inside: avoid !important;`) across all cards, panels, and tables
- [x] Locked heading rules (`page-break-after: avoid !important;`) preventing orphaned table headers
- [x] Compact side-by-side flex layout (`.print-row-grid`) for GC & Water sample tables
- [x] Storage upload retry (1.5s) and safe local disk fallback in `uploadToGCS`
- [x] Production build deployed: `dist/assets/index-C5MnQhBp.css` + `dist/assets/index-D_22Ew6C.js`



