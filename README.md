# WORK MATE — Operator Report Generator Console

> A production-grade operator run-report generation platform for OSSUS Bio, built on Google Cloud (Firebase Hosting + Cloud Run + BigQuery + GCS + Firestore).

---

## 🌐 Live Production Endpoints

| Layer | URL |
|---|---|
| **Frontend (Firebase Hosting CDN)** | https://grafana-494005.web.app |
| **Backend API (Cloud Run asia-south1)** | https://report-generator-server-983390035273.asia-south1.run.app |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Hosting (CDN)                       │
│                   React + Vite Frontend                         │
│           https://grafana-494005.web.app                        │
└────────────────────────┬────────────────────────────────────────┘
                          │ /api/** proxy
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               Cloud Run — asia-south1 (Mumbai)                  │
│               Node.js + Express Backend                         │
└──────────┬───────────────────────┬──────────────────────────────┘
           │                       │
     ┌─────▼──────┐       ┌────────▼──────────┐
     │  Firestore │       │     BigQuery      │
     │  (reports) │       │  (Datas dataset)  │
     │(user_roles)│       │  UCS/SDR/SMP_3RX  │
     └────────────┘       └───────────────────┘
           │
     ┌─────▼────────────────┐
     │ Google Cloud Storage │
     │  (ossusbio-monthly-  │
     │   reports bucket)    │
     └──────────────────────┘
```

---

## 📁 Project Structure

```
work-mate-report-generator/
├── client/                    # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/        # UI components (Wizard steps, Charts, Tables, Modals)
│   │   ├── services/          # API client (api.js) & Firebase Auth (firebase.js)
│   │   ├── utils/             # Chart & data helpers (chartHelpers.js)
│   │   └── index.css          # Global theme and print styles
│   ├── index.html
│   ├── firebase.json          # Hosting configuration + /api rewrite rule
│   ├── vite.config.js         # Vite proxy configuration for local dev
│   ├── .env.example           # Client environment template
│   └── package.json
│
├── server/                    # Node.js 20 + Express backend
│   ├── src/
│   │   ├── routes/            # Express routes (reports.js, roles.js)
│   │   ├── services/          # Services (bigquery.js, firestore.js, storage.js, roles.js, excelGenerator.js)
│   │   └── middleware/        # Authentication middleware (auth.js)
│   ├── Dockerfile             # Container image configuration
│   ├── cloudbuild.yaml        # GCP Cloud Build definition
│   ├── .env.example           # Server environment template
│   └── package.json
│
├── AGENTS.md                  # AI agent hard rules & workspace guidelines
├── ARCHITECTURE.md            # In-depth technical architecture
├── CHAT_CONTEXT.md            # AI session context & guardrails
├── IMPLEMENTATION_PLAN.md     # Feature design references
├── TASK.md                    # Feature checklist
├── PROGRESS.md                # Progress log & phase history
└── README.md                  # Developer onboarding guide
```

---

## 🗂️ Google Cloud Storage Layout

Uploaded reference photos and documents are organized into **run-scoped subfolders** inside the `ossusbio-monthly-reports` bucket:

```
ossusbio-monthly-reports/
└── runs/
    └── {runId}/
        ├── images/            # Photos uploaded / captured for this run
        └── documents/         # Reference PDFs / Excel / CSV files for this run
```

* **Automatic Cleanup**: Whenever an operator removes a photo from the gallery or deletes an attached document in Step 5 (Reference Doc), the file is automatically and permanently deleted from Cloud Storage.
* **Legacy Backward Compatibility**: Older reports with flat `uploads/images/` paths remain accessible via the fuzzy-match fallback in `storage.js`.

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- Access to `firebase_service.json` from team lead (DO NOT commit this file)

### Step 1: Clone the repository
```bash
git clone https://github.com/ossusbio/work-mate-report-generator.git
cd work-mate-report-generator
```

### Step 2: Setup the Backend (Server)
```bash
cd server
npm install

# Create .env and configure credentials
cp .env.example .env
# Place your firebase_service.json key in the server/ folder

# Start the backend locally on port 5000
npm run dev
```
**Backend API will run at**: `http://localhost:5000`

### Step 3: Setup the Frontend (Client)
```bash
# Open a new terminal tab
cd client
npm install

# Create .env and configure Firebase Web credentials
cp .env.example .env

# Start the frontend dev server
npm run dev
```
**Frontend will run at**: `http://localhost:3000`

> 💡 In local dev mode, the frontend automatically proxies all `/api/**` requests to `http://localhost:5000` via Vite proxy.

---

## 🔐 Required Secrets (DO NOT Commit)

| File | What it is | Where to put it |
|---|---|---|
| `firebase_service.json` | GCP Service Account Key (Private RSA JSON) | `server/firebase_service.json` |
| Firebase Web Config | Firebase API key, project ID, auth domain | `client/.env` |
| BigQuery & Server Config | Dataset IDs, port, environment variables | `server/.env` |

> **⚠️ NEVER commit `firebase_service.json` or `.env` files to git.** They are ignored by `.gitignore`.

---

## 🚀 Production Deployment

> **Important**: Always verify and test changes locally first (`localhost:3000` / `localhost:5000`) before deploying to production.

### Deploy Backend to Google Cloud Run (Mumbai — `asia-south1`)
```bash
cd server
gcloud builds submit --tag gcr.io/grafana-494005/report-generator-server --project=grafana-494005
gcloud run deploy report-generator-server --image gcr.io/grafana-494005/report-generator-server:latest --region=asia-south1 --project=grafana-494005 --quiet
```

### Deploy Frontend to Firebase Hosting CDN
```bash
cd client
npm run build
firebase deploy --only hosting --project grafana-494005
```

---

## 🌿 Git Collaboration Workflow

```text
main branch       → Always production-ready. Never push directly.
feature branches  → Create a branch for every new feature or fix.
```

### Typical Feature Workflow
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Make changes and test locally...
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature-name

# Open a Pull Request on GitHub → Review & Merge into main
```

### Commit Message Conventions
- `feat:` new user-facing features or backend capabilities
- `fix:` bug fixes
- `docs:` documentation updates
- `chore:` dependency maintenance or build tooling

---

## 👥 Team Contacts

| Role | Contact | Email |
|---|---|---|
| Tech Lead / Cloud Admin | Parth | parth@ossusbio.com |
| Operations Lead | Nagendra | nagendrak@ossusbio.com |

---

## 📄 License

Internal use only — OSSUS Bio Pvt. Ltd. All rights reserved.
