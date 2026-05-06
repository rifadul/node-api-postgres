# node-api-postgres

A RESTful API built with **Node.js**, **Express 5**, and **PostgreSQL**. It provides user management with JWT-based authentication (access + refresh tokens), password recovery, soft-delete + restore, request validation, audit logging, rate limiting, and a global error handler.

## Tech Stack

- **Runtime:** Node.js (ESM — `"type": "module"`)
- **Framework:** Express 5
- **Database:** PostgreSQL via `pg`
- **Auth:** `jsonwebtoken` (access + refresh JWTs) + `bcrypt`
- **Validation:** `joi` & `zod`
- **Security/Infra:** `cors`, `express-rate-limit`, API-key middleware
- **Dev:** `nodemon`

## Project Structure

```
.
├── app.js                      # Express app entry point
├── constants/
│   ├── auditActions.js         # Audit-log action enum
│   └── errorCodes.js           # Centralized error codes
├── controllers/
│   ├── authController.js       # Register, login, logout, password & token flows
│   └── userController.js       # User CRUD + restore
├── db/
│   └── index.js                # PostgreSQL pool
├── middleware/
│   ├── apiKey.js               # x-api-key gate
│   ├── asyncHandler.js         # Async wrapper
│   ├── authMiddleware.js       # JWT Bearer auth
│   ├── authorizeSelf.js        # Owner-only guard
│   ├── errorHandler.js         # Global error handler
│   ├── validate.js             # Schema validator
│   └── validateId.js
├── models/
│   ├── auditLogModel.js        # Audit-log SQL queries
│   └── userModel.js            # User SQL queries (incl. refresh token)
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── services/
│   ├── auth/
│   │   └── authService.js      # Auth business logic
│   ├── auditLogService.js      # Fire-and-forget audit logger
│   └── userService.js
├── utils/
│   ├── AppError.js             # Custom error class
│   ├── formatZodError.js
│   ├── jwt.js                  # Access/refresh token sign & verify
│   ├── resetToken.js           # Reset-token generation
│   └── response.js             # Unified success response
├── validators/
│   ├── auth.validator.js
│   └── user.validator.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Yarn or npm

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd node-api-postgres
yarn install
# or: npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=crud_api
DB_PASSWORD=your_db_password
DB_PORT=5432

PORT=3000
API_KEY=your_api_key

# Separate secrets for access and refresh tokens
JWT_ACCESS_SECRET=your_long_random_access_secret
JWT_REFRESH_SECRET=your_long_random_refresh_secret
```

Access tokens expire in **5 minutes**; refresh tokens expire in **1 day**.

### 3. Database Schema

Create the database and tables:

```sql
CREATE DATABASE crud_api;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Run

```bash
yarn dev
# or: npm run dev
```

Server runs at `http://localhost:3000`.

## Global Middleware

Every request must pass through:

1. **`x-api-key`** header — must match `API_KEY` from `.env`.
2. **Rate limit** — 100 requests per 15 minutes per IP.
3. **JSON body parser** — limited to 10kb.
4. **CORS** — enabled for all origins.

Protected routes additionally require an `Authorization: Bearer <accessToken>` header.

## API Endpoints

### Auth — `/auth`

| Method | Path                | Auth | Description                                       |
| ------ | ------------------- | ---- | ------------------------------------------------- |
| POST   | `/register`         | —    | Register a new user                               |
| POST   | `/login`            | —    | Log in, returns access + refresh tokens           |
| POST   | `/refresh-token`    | —    | Exchange a refresh token for a new access token   |
| POST   | `/logout`           | JWT  | Invalidate the current refresh token              |
| POST   | `/change-password`  | JWT  | Change password (requires current password)       |
| POST   | `/forgot-password`  | —    | Generate password reset token (logged to console) |
| POST   | `/reset-password`   | —    | Reset password using token                        |

### Users — `/users`

| Method | Path             | Auth     | Description                       |
| ------ | ---------------- | -------- | --------------------------------- |
| GET    | `/`              | JWT      | Paginated list (`?page=&limit=`)  |
| GET    | `/:id`           | JWT      | Get user by id                    |
| PUT    | `/:id`           | JWT+Self | Replace user                      |
| PATCH  | `/:id`           | JWT+Self | Partial update                    |
| DELETE | `/:id`           | JWT+Self | Soft delete                       |
| PATCH  | `/:id/restore`   | JWT+Self | Restore a soft-deleted user       |

`Self` means the JWT subject (`req.user.id`) must match the route `:id`.

## Example Requests

**Register**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"name":"Siam","email":"siam@example.com","password":"Secret123!"}'
```

**Login** (returns `accessToken` + `refreshToken`)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"email":"siam@example.com","password":"Secret123!"}'
```

**Refresh access token**

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"refreshToken":"<refreshToken>"}'
```

**Logout**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer <accessToken>"
```

**List users**

```bash
curl http://localhost:3000/users?page=1&limit=10 \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer <accessToken>"
```

## Response Format

All successful responses follow:

```json
{
  "success": true,
  "message": "...",
  "data": { },
  "meta": { }
}
```

Errors are normalized through the global handler with `AppError`:

```json
{
  "success": false,
  "message": "Invalid credentials",
  "code": "UNAUTHORIZED"
}
```

## Authentication Flow

1. **Login** returns a short-lived `accessToken` (5 min) and a longer-lived `refreshToken` (1 day). The refresh token is also persisted on the user row.
2. Send `Authorization: Bearer <accessToken>` on protected routes.
3. When the access token expires, call `POST /auth/refresh-token` with the stored refresh token to receive a new access token.
4. **Logout** clears the refresh token in the database, invalidating future refreshes.

## Audit Logging

Sensitive actions are recorded in the `audit_logs` table via a fire-and-forget service (`services/auditLogService.js`). Failures are logged but never break the request. Tracked actions are defined in `constants/auditActions.js`:

- `LOGIN`
- `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`, `RESTORE_USER`
- `CHANGE_PASSWORD`, `RESET_PASSWORD`

Each entry stores the actor, action, entity type/id, and a JSON `metadata` blob.

## Security Notes

- Passwords are hashed with **bcrypt** (cost 10).
- Access and refresh tokens use **separate secrets** (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
- Refresh tokens are persisted server-side and cleared on logout, allowing revocation.
- Reset tokens are stored as a **SHA-256 hash**; only the raw token leaves the server.
- Reset tokens expire after **15 minutes**.
- `forgot-password` does **not** reveal whether an email exists.
- `.env` is git-ignored — never commit secrets.

## Scripts

| Script    | Description                  |
| --------- | ---------------------------- |
| `yarn dev` | Start dev server with nodemon |

## License

MIT
