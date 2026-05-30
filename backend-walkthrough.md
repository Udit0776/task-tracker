# Backend Walkthrough - Changes & Implementation

## Overview
We have fully implemented the secure, production-grade **Multi-Tenant Task Tracker Backend** using **pure JavaScript (ES6+ CommonJS)**, Express.js, and a PostgreSQL database (interacted with using the `pg` node pool).

All aspects of the requested assignment are covered:
1. **Multi-Tenancy Support**: Implemented via a Shared Database + Tenant ID isolation model. Database queries are dynamically scoped by the current request's `tenantId` extracted from validated JWT payloads.
2. **Role-Based Access Control (RBAC)**: Supports roles `ADMIN`, `MANAGER`, and `MEMBER` with rigorous endpoint protections and business service permission checks.
3. **Advanced Workflows**:
   - `ADMIN` can view and edit everything within their tenant and adjust roles.
   - `MANAGER` can create and assign tasks.
   - `MEMBER` can only view tasks assigned to them and can **only** update their status.
4. **Central Error Handler Middleware**: Catches and formats all operational and critical exceptions into a consistent JSON response.
5. **Seeded Database**: Pre-configured database schema and automatic migration & seeding script generating mock tenants, users, tasks, and isolated comments.

---

## Files Created & Modified

### 1. Database Setup & Configurations
* **`backend/schema.sql`**: Defined the complete PostgreSQL relational schema with cascade deletions, constraints (`role` check, `priority` check, `status` check), and optimal indexes for multi-tenant querying.
* **`backend/config/db.js`**: Configured the PostgreSQL client connection pool using `pg` with dynamic fallback environment configurations.
* **`backend/scripts/initDb.js`**: Created an automated seed script. It runs `schema.sql` and populates the DB with isolated tenants (`Acme Corp`, `Stark Industries`), hashed passwords using `bcryptjs`, tasks, and comments.

### 2. Core Middlewares
* **`backend/middlewares/errorMiddleware.js`**: Centralized global Express error handler class `AppError` and handling middleware.
* **`backend/middlewares/authMiddleware.js`**: Decodes JWT authentication headers, queries current user details to double-check tenant safety, and mounts `req.user`.
* **`backend/middlewares/roleMiddleware.js`**: Generates whitelisted role authorization gates.

### 3. Data Access (Repositories)
* **`backend/repositories/tenantRepository.js`**: Client queries for tenants.
* **`backend/repositories/userRepository.js`**: Scoped queries for user registration and role updates.
* **`backend/repositories/taskRepository.js`**: Implemented full dynamic CRUD matching tenant isolation constraints.
* **`backend/repositories/commentRepository.js`**: Inserts and retrieves comments.

### 4. Services (Business Logic)
* **`backend/services/authService.js`**: Coordinates user signup (creating tenants dynamically or joining existing ones) and login (bcrypt verification and signing 24h JWTs).
* **`backend/services/taskService.js`**: Implements lifecycle validations, such as checking assignee tenant match and preventing Members from changing fields other than status.
* **`backend/services/userService.js`**: Restricts role modifications, preventing users from altering their own roles.
* **`backend/services/commentService.js`**: Restricts comments to assigned Members, Managers, or Admins.

### 5. HTTP Routing & Controller Integrations
* **`backend/controllers/authController.js`**: Validates registration fields, passwords, and email syntax.
* **`backend/controllers/taskController.js`**: Handles CRUD JSON mapping.
* **`backend/controllers/userController.js`**: Handles user list API requests.
* **`backend/routes.js`**: Assembled the central routing configuration.
* **`backend/index.js`**: Cleaned entry point loading standard parsers, mounting central endpoints, and registering error handling.
* **`backend/package.json`**: Updated scripts and added `pg`, `bcryptjs`, `jsonwebtoken` packages.
* **`README.md`**: Extensively documented structure, prerequisites, running scripts, and pre-seeded test user accounts.

---

## Verification & Manual Verification Plan

### How to Run & Verify

1. **Start database container**:
   ```bash
   docker-compose up -d
   ```
2. **Install node dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Execute database migrator & seeder**:
   ```bash
   node scripts/initDb.js
   ```
   *Expected Output:*
   ```text
   🚀 Starting Database Initialization...
   ⌛ Creating database tables and indices...
   ✅ Tables and indices created successfully.
   ⌛ Seeding Tenants...
   ✅ Seeded Tenants:
      - Acme Corp ID: <uuid-1>
      - Stark Industries ID: <uuid-2>
   ⌛ Seeding Users for Acme Corp...
   ...
   🎉 Database Initialized & Seeded Successfully!
   ```
4. **Launch development server**:
   ```bash
   npm run dev
   ```
   The backend server will run cleanly on `http://localhost:5000`.

### Manual Testing with Postman or Curl
- **Login**: Issue a `POST` request to `http://localhost:5000/api/auth/login` with `{"email": "member@acme.com", "password": "member123"}`. Copy the returned `token`.
- **Headers**: Include `Authorization: Bearer <token>` in your subsequent request headers.
- **Tenant Isolation Proof**: Access `GET http://localhost:5000/api/tasks`. Note that as a member of `Acme Corp`, you will only see your own tasks in `Acme Corp`. You will *never* see any tasks from `Stark Industries` (Tony Stark's suit armor upgrades), validating the tenant safety isolation layer!
