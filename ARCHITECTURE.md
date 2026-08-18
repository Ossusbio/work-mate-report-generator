# 🏛️ WORK MATE — System Architecture & Technical Design Document

> **Platform**: Operator Report Generator Console (OSSUS Bio)  
> **Version**: 1.0.0 (Production)  
> **Target Audience**: Software Engineers, DevOps, Data Engineers & Contributors  
> **Last Updated**: August 2026

---

## 1. Executive Summary & System Overview

**WORK MATE** is a specialized, cloud-native industrial telemetry and report generation platform developed for **OSSUS Bio**. It streamlines the process of capturing experimental, operational, and electrochemical parameters from bioreactor systems across multiple facility sites (**UCS**, **SDR**, **SMP_3RX_SKID**), reconciling real-time BigQuery telemetry with offline laboratory samples (GC and Water Quality), and producing exportable audit-compliant reports (PDF and Excel).

The entire system is deployed on Google Cloud Platform (GCP) with zero required local server infrastructure in production.

---

## 2. High-Level Architecture Diagram

`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER (User Browser)                        │
│   React 18 + Vite SPA | Glassmorphic Design System | Chart.js Data Engine   │
│   Hosted on Firebase Hosting CDN (https://grafana-494005.web.app)           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                        HTTPS Requests │ (Rewrite /api/**)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API & SERVER TIER                                 │
│   Google Cloud Run (asia-south1 / Mumbai) — Containerized Node.js Express   │
│   Auto-scaling 0 → N instances | Secret Manager Runtime Injection           │
└───────┬──────────────────────┬──────────────────────┬────────────────┬──────┘
        │                      │                      │                │
        │ Firestore SDK        │ BigQuery SDK         │ Storage SDK    │ Auth
        ▼                      ▼                      ▼                ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐ ┌─────────────┐
│  Google Cloud │      │  Google Cloud │      │  Google Cloud │ │  Firebase   │
│   Firestore   │      │   BigQuery    │      │    Storage    │ │    Auth     │
│───────────────│      │───────────────│      │───────────────│ │─────────────│
│ /reports      │      │ Dataset: Datas│      │ Bucket:       │ │ Identity &  │
│ (Run metadata,│      │ • UCS         │      │ ossusbio-     │ │ Session     │
│  drafts, rows)│      │ • SDR         │      │ monthly-      │ │ Management  │
│ /user_roles   │      │ • SMP_3RX_SKID│      │ reports       │ │ (@ossusbio) │
│ (Dynamic RBAC)│      │ • audit logs  │      │ (Images/Docs) │ └─────────────┘
└───────────────┘      └───────────────┘      └───────────────┘
`

---

## 3. Core Infrastructure Components

### 3.1. Frontend Tier (Client)
* **Framework**: React 18 with Vite build tool.
* **Design Philosophy**: Glassmorphism with dark-mode palette (#090d16 background, translucent #1e293b panels, #38bdf8 accent colors), CSS variables, and zero heavy UI library dependencies (Tailwind-free pure CSS).
* **Charting Engine**: Chart.js via eact-chartjs-2 with dynamic multi-axis scaling, IST time formatting, and sample point overlays.
* **Hosting**: **Firebase Hosting** with global edge CDN caching and atomic zero-downtime releases.

### 3.2. Backend API Tier (Server)
* **Runtime**: Node.js 20 on Alpine Linux inside a lightweight Docker container.
* **Orchestration**: **Google Cloud Run** in region sia-south1 (Mumbai).
* **Security & Auth**: Google Secret Manager (irebase-service-account), RBAC middleware (erifyAuth), and domain-level email authorization (@ossusbio.com).

### 3.3. Database & Storage Tier
* **Document Store (Google Firestore)**:
  * /reports/{reportId}: Stores all structured parameters, electrode configurations, sample entries, chart setups, inline edited telemetry, and edit logs.
  * /user_roles/{email}: Stores dynamic role assignments (developer vs user) managed live via the Developer Panel.
* **Time-Series Telemetry Warehouse (Google BigQuery)**:
  * Project: grafana-494005, Dataset: Datas.
  * Tables: UCS (121 columns), SDR (123 columns), SMP_3RX_SKID (312 columns).
  * Audit Table: eport_deletions_log (records all report deletion events with user attribution).
* **Binary Object Store (Google Cloud Storage)**:
  * Bucket: ossusbio-monthly-reports.
  * uploads/images/: Compressed camera captures and uploaded reference photos.
  * uploads/documents/: Analytical PDFs, SOPs, and reference documents.

---

## 4. End-to-End Functional Flows

### 4.1. Authentication & Role-Based Access Control (RBAC)
`mermaid
sequenceDiagram
    autonumber
    actor User as Operator / Developer
    participant UI as React Frontend
    participant Auth as Firebase Auth
    participant API as Cloud Run Server
    participant DB as Firestore (/user_roles)

    User->>UI: Logs in with @ossusbio.com Google Account
    UI->>Auth: Authenticates & obtains ID Token
    UI->>API: GET /api/roles/my-role (with Bearer Token / Session)
    API->>DB: Query /user_roles/{email}
    DB-->>API: Returns role ("developer" or "user")
    API-->>UI: Role metadata
    UI-->>User: Renders appropriate UI (User Mode vs Developer Mode Toggle)
`

### 4.2. Report Creation & Parameter Validation Flow
`mermaid
sequenceDiagram
    autonumber
    actor User as Operator
    participant UI as 7-Step Wizard
    participant Modal as InvalidParametersModal
    participant API as Cloud Run Backend
    participant BQ as BigQuery (Datas)
    participant FS as Firestore (/reports)

    User->>UI: Fills Step 1-6 parameters & clicks "Generate Full Report"
    UI->>UI: validateReportParameters()
    alt Missing required fields (Start/End time, Run Name, Datastreams)
        UI->>Modal: Open Alert Dialog with "Fix →" buttons
        User->>Modal: Clicks "Fix →" to jump directly to invalid step
    else Valid Parameters
        UI->>API: POST /api/reports/generate (with params & stream list)
        API->>BQ: Execute strict timestamp query (@startTs to @endTs)
        BQ-->>API: Returns time-series telemetry rows
        API->>FS: Save report document status="COMPLETED"
        FS-->>API: Stored successfully
        API-->>UI: Full report payload + BigQuery data
        UI-->>User: Navigate to Editable Report View
    end
`

### 4.3. Multi-Axis Graph Rendering & Laboratory Sample Overlay
The application features a **unified dual-layer graph engine** (chartHelpers.js):
1. **Continuous Telemetry Layer (BigQuery)**: Displays time-series data (e.g., PT02, RX_V1, TRIGGER_COUNT) plotted on line charts against chronological IST timestamps.
2. **Discrete Sample Overlay Layer (Lab GC / Water)**: Offline measurements (H2%, CO2%, pH, TDS, EC) taken at intervals (T1, T2, T3) are synchronized and mapped onto the timeline.
3. **Multi-Scale Axis Normalization**: Up to 3 distinct Y-axes are dynamically assigned independent scales (y_0, y_1, y_2) with color-coordinated axis titles and unit indicators.

---

## 5. Security Architecture & Rules

### 5.1. Strict View-Only Access for Non-Owners
* **Ownership Check**: isOwner = (report.createdBy === currentUserEmail) || isDeveloper.
* **Fieldset Level Disabling**: When a non-owner views a report in the wizard, the entire content tree is wrapped inside <fieldset disabled={!canEdit} className="view-only-fieldset">.
* **Sub-Component Defense**: All child components (ElectrodeDetails, DataStreamSelector, DynamicSampleTable, CameraCapture) receive explicit disabled={!canEdit} props.
* **Server-Side Verification**: PUT /api/reports/:id and DELETE /api/reports/:id verify user authorization on the backend before executing mutations.

### 5.2. Audit Logging & Safe Destruction
* When a report is deleted, the backend performs **three-phase atomic cleanup**:
  1. Records deletion event to BigQuery (eport_deletions_log) with timestamp, Run ID, Run Name, and operator email.
  2. Deletes all associated GCS artifacts (uploads/images/ and uploads/documents/).
  3. Deletes document from Firestore /reports/{id}.
* The audit log execution is isolated in a safe 	ry/catch block so logging warnings never lock report maintenance.

---

## 6. Frontend Component Hierarchy

`
App.jsx (Top-level view router: 'home' | 'wizard' | 'editor')
├── Navbar.jsx (Branding, user email, Developer mode switch)
│
├── ReportHistory.jsx (Dashboard view)
│   ├── Filter Bar (Date range, Owner dropdown, Search bar)
│   ├── Report Cards Grid (Status badge, duplicate, delete, view triggers)
│   └── ConfirmModal.jsx (Deletion safety check)
│
├── OperatorForm.jsx (7-Step Wizard view)
│   ├── Step Pills Navigation Bar (Scrollable on mobile)
│   ├── Step 1: BasicRunDetails (Site, Run Name, Owner, Timings)
│   ├── Step 2: ElectrodeDetails.jsx (11 electrochemical parameters)
│   ├── Step 3: DataStreamSelector.jsx (Site-specific column catalog)
│   ├── Step 4: DynamicSampleTable.jsx (GC & Water sample series)
│   ├── Step 5: CameraCapture.jsx & DocumentUpload (Photos, PDF notes)
│   ├── Step 6: TelemetryPreview (BigQuery preview & raw table)
│   ├── Step 7: GraphConfig & ReportGeneration (Multi-axis charts, inferences)
│   └── InvalidParametersModal.jsx (Interactive pre-flight validator)
│
├── EditableTable.jsx (Active Report View & Export)
│   ├── Operational Parameters Cards
│   ├── Multi-Chart Live Display (Line & Bar charts)
│   ├── GC & Water Sample Summary Tables
│   ├── Attached Documents (Signed GCS link & inline notes)
│   ├── Editable BigQuery Data Table (Inline cell modifications)
│   └── PDF / Excel Exporters (window.print() / excelGenerator.js)
│
└── DeveloperPanel.jsx (Developer Mode Dashboard)
    ├── System Health Matrix (Firestore, BigQuery, GCS, Auth latency)
    ├── Live HTTP Request Stream (Method, path, status, duration)
    └── Dynamic User Access Control Table (Toggle Developer / User roles)
`

---

## 7. Backend API Specification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/health | Public | Basic container health status |
| GET | /api/health/detailed | Developer | Deep connection test for Firestore, BigQuery, GCS |
| GET | /api/reports | Required | Fetches all report drafts & completed runs |
| GET | /api/reports/:id | Required | Fetches full report document by ID |
| POST | /api/reports/generate | Required | Fetches BigQuery telemetry & creates completed report |
| POST | /api/reports/preview-data | Required | Queries BigQuery telemetry preview for wizard Step 6 |
| POST | /api/reports/upload-image | Required | Uploads photo to GCS bucket (uploads/images/) |
| POST | /api/reports/upload-document| Required | Uploads PDF/doc to GCS bucket (uploads/documents/) |
| GET | /api/reports/:id/document | Public | Streams or redirects to signed URL for attached doc |
| GET | /api/reports/:id/export | Public | Generates and downloads styled Excel .xlsx workbook |
| PUT | /api/reports/:id | Owner/Dev | Updates an existing draft or completed report |
| DELETE| /api/reports/:id | Owner/Dev | Audit-logs and permanently purges report & GCS files |
| GET | /api/roles/my-role | Required | Checks active user's dynamic role (developer/user) |
| GET | /api/roles/users | Developer | Lists all registered operators and their roles |
| POST | /api/roles/update | Developer | Grants or revokes Developer status for an email |

---

## 8. Development & Deployment Guide for Colleagues

### 8.1. Local Development Setup
1. **Clone repository**:
   `ash
   git clone https://github.com/Ossusbio/work-mate-report-generator.git
   cd work-mate-report-generator
   `
2. **Configure Server**:
   `ash
   cd server
   npm install
   cp .env.example .env
   # Place firebase_service.json in server/ directory (obtain securely from Team Lead)
   npm run dev
   `
   *Server starts at http://localhost:5000.*

3. **Configure Client**:
   `ash
   cd ../client
   npm install
   cp .env.example .env
   npm run dev
   `
   *Frontend starts at http://localhost:3000 (proxies /api calls to port 5000).*

### 8.2. Production Deployment (Tested & Verified)

`powershell
# 1. Deploy Cloud Run Backend
cd server
gcloud builds submit --tag gcr.io/grafana-494005/report-generator-server --project=grafana-494005
gcloud run deploy report-generator-server --image gcr.io/grafana-494005/report-generator-server:latest --region=asia-south1 --project=grafana-494005 --quiet

# 2. Deploy Firebase Hosting Frontend
cd ../client
npm run build
="C:\path\to\firebase_service.json"
firebase deploy --only hosting --project grafana-494005
`

---

## 9. Key Contacts & Support

* **Project Owner & Lead Developer**: Parth (parth@ossusbio.com)
* **Operations Lead**: Nagendra K (
agendrak@ossusbio.com)
* **Company**: OSSUS Biorenewables Pvt. Ltd.
