# WORK MATE — Operator Report Generator Console

> A production-grade operator run-report generation platform for OSSUS Bio, built on Google Cloud (Firebase Hosting + Cloud Run + BigQuery + GCS).

---

## 🌐 Live Production

| | URL |
|---|---|
| **Web App** | https://grafana-494005.web.app |
| **Backend API** | https://report-generator-server-983390035273.asia-south1.run.app |

---

## 🏗️ Architecture Overview

`
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Hosting (CDN)                        │
│                   React + Vite Frontend                          │
│           https://grafana-494005.web.app                         │
└────────────────────────┬────────────────────────────────────────┘
                          │ /api/** proxy
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               Cloud Run — asia-south1 (Mumbai)                   │
│               Node.js + Express Backend                          │
└──────────┬───────────────────────┬──────────────────────────────┘
           │                       │
     ┌─────▼──────┐       ┌────────▼──────────┐
     │  Firestore  │       │     BigQuery       │
     │  (reports)  │       │  (Datas dataset)  │
     │  (user_roles)│       │  UCS/SDR/SMP_3RX  │
     └─────────────┘       └───────────────────┘
           │
     ┌─────▼────────────────┐
     │  Google Cloud Storage │
     │  (ossusbio-monthly-   │
     │   reports bucket)     │
     └───────────────────────┘
`

---

## 📁 Project Structure

`
report-generator/
├── client/               # React + Vite frontend
│   ├── src/
│   │   ├── components/   # All React components
│   │   ├── services/     # API & Firebase client
│   │   ├── utils/        # Chart helpers
│   │   └── index.css     # Global styles
│   ├── index.html
│   ├── firebase.json     # Hosting config + /api proxy rule
│   ├── .env.example      # Copy to .env and fill values
│   └── package.json
│
├── server/               # Node.js + Express backend
│   ├── src/
│   │   ├── routes/       # API endpoints (reports, roles)
│   │   ├── services/     # BigQuery, Firestore, GCS, Excel
│   │   └── middleware/   # Auth verification
│   ├── Dockerfile
│   ├── .env.example      # Copy to .env and fill values
│   └── package.json
│
├── .gitignore
├── PROGRESS.md           # Feature progress log
├── CHAT_CONTEXT.md       # Architecture & dev session notes
└── README.md             # This file
`

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- Access to irebase_service.json from team lead (DO NOT commit this file)

### Step 1: Clone the repository
`ash
git clone https://github.com/ossusbio/work-mate-report-generator.git
cd work-mate-report-generator
`

### Step 2: Setup the Backend (Server)
`ash
cd server
npm install

# Copy the example env file and fill in your values
cp .env.example .env
# (ask team lead for firebase_service.json and place it in server/)

# Start the backend locally on port 5000
npm run dev
`

**Backend will run at**: http://localhost:5000

### Step 3: Setup the Frontend (Client)
`ash
# Open a new terminal tab
cd client
npm install

# Copy the example env file and fill in your values
cp .env.example .env
# (ask team lead for the Firebase credentials to fill in .env)

# Start the frontend dev server
npm run dev
`

**Frontend will run at**: http://localhost:3000

> ⚠️ In local dev mode, the frontend proxies /api/** requests to http://localhost:5000 via Vite proxy (see ite.config.js).

---

## 🔐 Required Secrets (Ask Team Lead)

| File | What it is | Where to put it |
|---|---|---|
| irebase_service.json | GCP Service Account JSON (private key) | server/firebase_service.json |
| Firebase API key values | Firebase client config (from Firebase Console) | client/.env |
| BigQuery dataset info | Project/dataset/table names | server/.env |

> **NEVER commit irebase_service.json or any .env file to git.** They are blocked by .gitignore.

---

## 🚀 Deployment (Production — Team Lead Only)

### Deploy Backend to Cloud Run
`powershell
cd server
gcloud builds submit --tag gcr.io/grafana-494005/report-generator-server --project=grafana-494005
gcloud run deploy report-generator-server --image gcr.io/grafana-494005/report-generator-server:latest --region=asia-south1 --project=grafana-494005 --quiet
`

### Deploy Frontend to Firebase Hosting
`ash
cd client
npm run build
firebase deploy --only hosting --project grafana-494005
`

---

## 🌿 Git Workflow for Team Collaboration

`
main branch       → Always production-ready. Never push directly.
feature branches  → Create a branch for every new feature or fix.
`

### Start a new feature
`ash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# make your changes...
git add .
git commit -m "feat: describe what you did"
git push origin feature/your-feature-name
# Open a Pull Request on GitHub → ask team lead to review and merge
`

### Commit message format
- eat: add new feature
- ix: fix broken thing
- chore: update dependencies
- docs: update README

---

## 👥 Team Contacts

| Role | Email |
|---|---|
| Tech Lead | parth@ossusbio.com |
| Operations | nagendrak@ossusbio.com |

---

## 📄 License

Internal use only — OSSUS Bio Pvt. Ltd. All rights reserved.
