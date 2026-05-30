# Frontend Walkthrough - Changes & Implementation

## Overview
We have fully built and integrated a premium, high-fidelity **React Frontend** inside the `/frontend` directory!

The frontend perfectly connects with your running Express.js API, honoring multi-tenant contexts and role-based actions.

---

## Files Created & Configured

### 1. Global Setup & Configurations
* **`frontend/package.json`**: Scaffolded the Vite React template and installed production dependencies (`axios`, `react-router-dom` v6).
* **`frontend/src/api.js`**: Built a central Axios client pointing to `http://localhost:5000/api`. Built automatic request interceptors to inject `Authorization: Bearer <token>` dynamically and response interceptors to automatically clean sessions and redirect on `401 Unauthorized` token expirations.
* **`frontend/src/index.css`**: Created a state-of-the-art global design stylesheet based on Google Font 'Outfit'. Fully configured custom dark Slate themes, premium glassmorphism card templates (`.glass-card`), glowing input selectors (`.input-control`), rounded role pills (`.pill`), custom scrollbars, and smooth modal fade-in keyframes.
* **`frontend/index.html`**: Updated the document head with professional workspace branding and title metadata.

### 2. Global State & Route Guards
* **`frontend/src/context/AuthContext.jsx`**: Integrated a global Auth Provider context tracking token sessions, user role profiles, and exposing `login()`, `signup()`, and `logout()` helpers. Automatically loads active sessions from `localStorage` on boot.
* **`frontend/src/components/ProtectedRoute.jsx`**: Designed route gatekeeping guards. Authenticates incoming routes, prevents access from unauthenticated sessions, and dynamically filters role paths (e.g., blocking non-Admins from visiting the Team administration paths). Includes a smooth glowing loader card.

### 3. Core Page Views
* **`frontend/src/pages/Login.jsx`**: A card login view styled with linear gradients, custom text labels, and operational error alert cards.
* **`frontend/src/pages/Signup.jsx`**: An interactive register panel featuring a tab selector toggle to switch between:
  1. *Creating a brand new organization* (which registers the user as the initial `ADMIN`).
  2. *Joining an existing organization* (which takes a Tenant ID code and registers the user as a `MEMBER`).
* **`frontend/src/components/Navbar.jsx`**: A top sticky glassmorphic navigation bar displaying active Tenant info, logged-in user profile, role pill indicators (`ADMIN` in purple, `MANAGER` in blue, `MEMBER` in white), and logout buttons.
* **`frontend/src/pages/Dashboard.jsx`**: Home view displaying active organization details, copyable Tenant Codes (for Admins to share), task stats counters (Todo, In Progress, Done), and a dynamic Role Action list summarizing specific user permissions.
* **`frontend/src/pages/UserManagement.jsx`**: Admin-only user directory displaying team details and incorporating active **Role Selection Dropdowns** allowing administrators to seamlessly elevate/demote user permissions inside the tenant.
* **`frontend/src/pages/TaskBoard.jsx`**: Interactive task management center incorporating search bars, status tabs (All, Todo, In Progress, Done), priority filters, and dynamic assignee cards.
* **`frontend/src/components/TaskModal.jsx`**: A flexible modal overlay that adapts to three states:
  * *Create Mode*: Form inputs and dynamic assignee select elements.
  * *Edit Mode*: Populated form updates (restricted to Admin/Manager).
  * *Detail / Comments Mode*: Static text views, status-only editing (for assigned Members), and a **full interactive comments section** to let team members discuss tasks in real-time.

---

## Verification & Testing Procedure

### How to Run & Verify

1. **Verify Backend & Database are running**:
   Ensure `docker-compose up -d` and `npm run dev` are active in your `backend/` directory.

2. **Navigate and Install Frontend Dependencies**:
   From your root directory, run:
   ```bash
   cd frontend
   npm install
   ```

3. **Launch Frontend Development Server**:
   Start the Vite local development server:
   ```bash
   npm run dev
   ```
   *The React app will launch cleanly on **`http://localhost:5173`**!*

4. **Verify features locally**:
   - Open your browser to `http://localhost:5173`.
   - Log in using a seeded user:
     - **Email:** `admin@acme.com`
     - **Password:** `admin123`
   - Copy the Tenant ID from the dashboard header.
   - Click **Sign Out** and go to **Signup** tab. Select **Join Organization**, paste the Tenant ID code, and register a new user `John Doe` (`john@acme.com`).
   - Log in as `John Doe`. Open **Tasks** and click on the "Design Database Architecture" task. Try to modify its title (you will be blocked since members can only modify statuses on tasks assigned to them). Post a comment: *"I have initialized the frontend scaffolding"*—and see it save instantly!
