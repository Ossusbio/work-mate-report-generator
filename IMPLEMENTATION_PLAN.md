# Dynamic Role-Based Access Control (RBAC) & User Management in Developer Mode

## Overview
Currently, developer access is hardcoded in a static array (`DEV_EMAILS = ['parth@ossusbio.com', ...]`). The user wants to manage developer/user permissions directly from the UI within **Developer Mode**, seeing a list of users and toggling their access (`User Mode` / `Developer Mode`) dynamically without having to change code.

---

## Architecture & Proposed Changes

### 1. Database Model (Firestore)
- **Collection**: `/user_roles/{email}`
  - Document fields:
    - `email`: string (e.g. `parth@ossusbio.com`)
    - `role`: `'developer'` | `'user'`
    - `updatedBy`: string (who granted the role)
    - `updatedAt`: ISO timestamp
- **Default Seeding**:
  - `parth@ossusbio.com` -> `developer`
  - `nagendra@ossusbio.com` -> `developer`
  - `thamunna@ossusbio.com` -> `developer`
  - Any new logged-in `@ossusbio.com` user defaults to `user`.

---

### 2. Backend Endpoints (`server/src/routes/roles.js` & `server/src/routes/reports.js`)
- `GET /api/roles/my-role`: Returns the role (`developer` or `user`) of the authenticated session.
- `GET /api/roles/users`: (Developer-only) Returns the list of all known users with their current roles and metadata.
- `POST /api/roles/update`: (Developer-only) Sets the role for a specific email (`{ email, role: 'developer' | 'user' }`).
- `POST /api/roles/grant`: (Developer-only) Quick-add any new email and assign a role.

---

### 3. Frontend Component (`DeveloperPanel.jsx` & `Navbar.jsx`)
- **DeveloperPanel.jsx**:
  - Add **"User & Developer Access Management"** card.
  - Table of all operators with Search bar.
  - Interactive Toggle Switch (`User` ↔ `Developer`) next to each person.
  - **"Grant Developer Access"** input box to type any new `@ossusbio.com` email.
  - Immediate optimistic UI update + server sync.
- **Navbar.jsx & App.jsx**:
  - Check dynamic role from backend on login instead of static array.
  - If role === `'developer'`, Developer mode toggle is enabled; otherwise disabled with tooltip.

---

## Verification Plan
1. **Automated / Unit Testing**:
   - Verify `GET /api/roles/my-role` returns `'developer'` for initial admins.
   - Verify `POST /api/roles/update` updates role in Firestore and reflects in subsequent queries.
2. **End-to-End Verification**:
   - Log in as `parth@ossusbio.com`, open Developer Mode.
   - View the user list, add a new email (e.g. `test@ossusbio.com`), and toggle their role.
   - Verify non-developers cannot access Developer Mode.
3. **Deployment**:
   - Build and deploy backend to Cloud Run.
   - Deploy frontend to Firebase Hosting.
