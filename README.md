# ⚡ TaskPulse: Multi-Tenant Task Tracker

Welcome to **TaskPulse**! TaskPulse is a premium SaaS-grade task management platform featuring user authentication, strict database-level Multi-Tenancy isolation, and robust Role-Based Access Control (RBAC). 

This project uses a modern two-tier monorepo architecture:
- 🚀 **Backend REST API**: Node.js & Express.js with custom middlewares, scoped repositories, and PostgreSQL database isolation.
- 🎨 **Frontend SPA**: React 19, Vite, Tailwind CSS, Google HSL Theme System, dynamic priority task queue carousel, and workspace tracking dashboards.

---

## 📂 Project Structure

```text
task-tracker-assignment/
├── backend/                  # Express/Node.js backend service
│   ├── config/
│   │   └── db.js            # PostgreSQL connection pool using 'pg'
│   ├── controllers/
│   │   ├── authController.js # Registration & login handlers
│   │   ├── taskController.js # Task CRUD & status updates
│   │   └── userController.js # User query & role mutation
│   ├── middlewares/
│   │   ├── authMiddleware.js # Decodes JWT & attaches tenant context
│   │   ├── errorMiddleware.js# Centered JSON error mapping
│   │   └── roleMiddleware.js # Dynamic route RBAC verification
│   ├── repositories/
│   │   ├── commentRepository.js # Comment DB queries
│   │   ├── taskRepository.js # Scoped query isolation for tasks
│   │   ├── tenantRepository.js  # Tenant lookup/creation
│   │   └── userRepository.js   # User lookup/mutation
│   ├── scripts/
│   │   └── initDb.js        # DB migrator and automatic seeder
│   ├── services/
│   │   ├── authService.js   # Password hashing & JWT signing
│   │   ├── commentService.js# Thread comments business checks
│   │   ├── taskService.js   # Scoped operations orchestrator
│   │   └── userService.js   # Workspace user administrative actions
│   ├── .env                 # Environment secrets template
│   ├── index.js             # API Gateway Server entrance
│   ├── package.json         # Backend manifest & commands
│   ├── routes.js            # REST endpoint mapper
│   └── schema.sql           # Core database schema
├── frontend/                 # React SPA Client service
│   ├── src/
│   │   ├── components/      # Shared components (TaskModal, ProtectedRoute)
│   │   ├── context/         # AuthContext state provider
│   │   ├── pages/           # Views (Dashboard, TaskBoard, Login, Signup)
│   │   ├── api.js           # Configured Axios instance with JWT interceptor
│   │   ├── index.css        # Tailwind directives and HSL custom theme design
│   │   └── main.jsx         # Client mount point
│   ├── package.json         # Frontend manifest & scripts
│   └── vite.config.js       # Vite configuration
├── docker-compose.yml        # PostgreSQL service recipe
└── README.md                 # Complete project setup documentation
```

---

## 🛠️ Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **Docker Desktop** (for spinning up the PostgreSQL database)

---

## 🚀 Step-by-Step Setup Guide

Follow these steps sequentially to get your local environment running smoothly.

### 1. Database Provisioning (Docker)
TaskPulse uses a containerized PostgreSQL database to guarantee environment parity.

1. Locate `docker-compose.yml` in the project root directory.
2. Spin up the Postgres container in detached background mode:
   ```bash
   docker-compose up -d
   ```
3. Verify that the database is running:
   ```bash
   docker ps
   ```
   *The container `task-tracker-postgres` should be running on port `5432`.*

#### 🗄️ Database Credentials
* **User**: `postgres`
* **Password**: `password123`
* **Port**: `5432`
* **Database Name**: `task_tracker_db`

---

### 2. Backend Service Setup

Navigate to the `backend` directory, configure your environment variables, install libraries, and run the seeder script.

#### A. Configure Environment Variables
Create a file named `.env` in the `backend/` directory:
```bash
cd backend
```
Add the following content (already configured to match the Docker container settings):
```ini
PORT=5000
JWT_SECRET=my_ultra_secure_task_tracker_jwt_secret_key_123

# Database Connection Fields
DB_USER=postgres
DB_PASSWORD=password123
DB_DATABASE=task_tracker_db
DB_HOST=localhost
DB_PORT=5432

# Or unified connection string
DATABASE_URL=postgresql://postgres:password123@localhost:5432/task_tracker_db
```

#### B. Install Core Packages
Install all backend dependencies:
```bash
npm install
```

| Dependency | Purpose |
| :--- | :--- |
| **express** | Lightweight REST routing framework |
| **pg** | Non-blocking PostgreSQL client pool |
| **bcryptjs** | Secure password salting and hashing |
| **jsonwebtoken** | Stateless JWT generation and verification |
| **cors** | Configures Cross-Origin Resource Sharing for frontend |
| **dotenv** | Loads environment variables from the `.env` file |
| **nodemon** *(dev)* | Hot-reloads backend server upon code saves |

#### C. Run DB Migration & Seeder Script
Run the automated schema build and data seeder:
```bash
node scripts/initDb.js
```
*This reads `schema.sql` to construct the tables (`tenants`, `users`, `tasks`, `comments`) and seeds test accounts for two isolated tenant organizations.*

#### D. Start the API Server
Start the server in hot-reload development mode:
```bash
npm run dev
```
*The server will start listening at: **`http://localhost:5000`***

---

### 3. Frontend Client Setup

Navigate to the `frontend` directory, install frontend UI frameworks, and boot the client.

#### A. Navigate & Install Dependencies
Open a new terminal window, change directory to `frontend/`, and install packages:
```bash
cd frontend
npm install
```

| Dependency | Purpose |
| :--- | :--- |
| **react** / **react-dom** | Declarative components UI rendering |
| **react-router-dom** | Browser routing and RBAC route gates |
| **axios** | HTTP client with global interceptor to inject JWT headers |
| **tailwindcss** | Utility-first responsive CSS styling |
| **vite** *(dev)* | Hyper-fast module bundler and dev server |

#### B. Launch Vite Development Server
Start the React application:
```bash
npm run dev
```
*The React web app will launch at: **`http://localhost:5174`** (or fallback to `5173`).*

---

## 🏢 Multi-Tenancy & Security Model

TaskPulse implements a shared-database multi-tenancy model with deep query-level isolation filters:
1. **Isolation Guard**: Every data table is assigned a `tenant_id`. 
2. **Context Enrichment**: Upon registration or login, the user's signature is encoded in a JWT.
3. **Repository Gates**: Every database query in the repository layer automatically enforces `WHERE tenant_id = $1` parsed straight from the request's authenticated payload. Users from `Acme Corp` can never access or modify data belonging to `Stark Industries`.

---

## 🔑 Pre-Seeded Accounts for Instant Testing

Test multi-tenancy and Role-Based Access Control right away! Use the pre-seeded accounts to experience what Admins, Managers, and Team Members can see and do.

*Password for **all** accounts is their respective role name:*
- **Admin**: `admin123`
- **Manager**: `manager123`
- **Member**: `member123`

### 🏢 Space A: Acme Corp
| Name | Email | Password | Role | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Acme Admin** | `admin@acme.com` | `admin123` | **ADMIN** | Full control: Invite users, assign/change roles, view and edit all workspace tasks. |
| **Acme Manager** | `manager@acme.com` | `manager123` | **MANAGER** | Management control: Create and assign tasks, view team tasks, post comments. |
| **Acme Member** | `member@acme.com` | `member123` | **MEMBER** | Scoped view: Only view tasks assigned to them, **edit status only** on those tasks, post comments. |

### 🏢 Space B: Stark Industries (Completely Isolated Space)
| Name | Email | Password | Role | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Tony Stark** | `admin@stark.com` | `admin123` | **ADMIN** | High-level administrative controls, completely isolated from Acme Corp. |
| **Peter Parker** | `member@stark.com` | `member123` | **MEMBER** | Scoped view of Stark Industries tasks only. |

---

## 💡 Troubleshooting & Common Issues

### ❌ Database Connection Error: `AggregateError [ECONNREFUSED]`
This happens when the Node backend tries to connect to PostgreSQL on port `5432` but can't reach it.
1. **Check Docker Status**: Ensure your Docker Desktop application is running.
2. **Restart DB**: Stop and spin up the docker containers again:
   ```bash
   docker-compose down
   docker-compose up -d
   ```
3. **Check Container Logs**:
   ```bash
   docker logs task-tracker-postgres
   ```

### ❌ Database tables not found or seeding errors
If you have connection issues or database schema changes, you can completely rebuild and re-seed the tables at any time:
```bash
cd backend
node scripts/initDb.js
```
*Caution: Re-running `initDb.js` drops existing tables and seeds a clean copy of the database.*

### ❌ Ports Already in Use (Vite / Express)
- If port `5000` is blocked, update `PORT` inside `backend/.env`.
- If Vite runs on `5174` instead of `5173`, it's completely fine. Vite handles port collision automatically and starts on the next available port. Our Axios client automatically coordinates with the backend API address.

---

## 🛡️ Key REST API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new space (creates a Tenant as Admin) or join a space using a Space ID (registers as Member).
- `POST /api/auth/login` - Authenticates and returns a secure JWT bearer token.

### User Management (Admin Only)
- `GET /api/users` - Fetch all workspace users.
- `PUT /api/users/:id/role` - Update a workspace user's role.

### Tasks (RBAC Scoped)
- `POST /api/tasks` - Create task *(Admin & Manager Only)*.
- `GET /api/tasks` - List tasks *(Admins/Managers see all; Members see assigned only)*.
- `GET /api/tasks/:id` - Fetch details for a specific task.
- `PUT /api/tasks/:id` - Update task details *(Admins/Managers edit all; Members edit `status` only on assigned tasks)*.
- `DELETE /api/tasks/:id` - Remove a task *(Admin & Manager Only)*.

### Threaded Comments
- `GET /api/tasks/:id/comments` - Retrieve a task's activity log and discussion comments.
- `POST /api/tasks/:id/comments` - Post a new comment on a task.
