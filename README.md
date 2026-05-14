# node-api-postgres

A RESTful API built with **Node.js**, **Express 5**, and **PostgreSQL**. It provides user management with JWT-based authentication delivered through **httpOnly cookies**, **CSRF protection**, refresh-token rotation with SHA-256 hashing and reuse detection, password recovery, soft-delete + restore, request validation, audit logging, rate limiting, security headers, request logging, **Swagger/OpenAPI docs**, and a global error handler.

## Tech Stack

- **Runtime:** Node.js (ESM — `"type": "module"`)
- **Framework:** Express 5
- **Database:** PostgreSQL via `pg`
- **Auth:** `jsonwebtoken` (access + refresh JWTs in httpOnly cookies) + `bcrypt`
- **Cookies/CSRF:** `cookie-parser`, `csurf`
- **Validation:** `joi` & `zod`
- **Security/Infra:** `cors` (origin allowlist + credentials), `helmet`, `express-rate-limit`
- **Logging:** `morgan` (dev only)
- **API Docs:** `swagger-jsdoc`, `swagger-ui-express`
- **Dev:** `nodemon`

## Project Structure

```
.
├── app.js                      # Express app entry point
├── config/
│   └── swagger.js              # Swagger / OpenAPI spec
├── constants/
│   ├── allowedOrigins.js       # CORS origin allowlist
│   ├── auditActions.js         # Audit-log action enum
│   └── errorCodes.js           # Centralized error codes
├── controllers/
│   ├── authController.js       # Register, login, logout, password & token flows
│   └── userController.js       # User CRUD + restore
├── db/
│   └── index.js                # PostgreSQL pool
├── middleware/
│   ├── asyncHandler.js         # Async wrapper
│   ├── authMiddleware.js       # JWT auth from accessToken cookie
│   ├── authorizeSelf.js        # Owner-only guard
│   ├── errorHandler.js         # Global error handler
│   ├── validate.js             # Schema validator
│   └── validateId.js
├── models/
│   ├── auditLogModel.js        # Audit-log SQL queries
│   └── userModel.js            # User SQL queries (incl. hashed refresh token)
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
│   ├── cookies.js              # Shared cookie options (access/refresh)
│   ├── formatZodError.js
│   ├── hash.js                 # SHA-256 token hashing
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
# Single PostgreSQL connection string (SSL is enabled automatically when NODE_ENV=production)
DATABASE_URL=postgres://user:password@localhost:5432/crud_api

PORT=3000

# Separate secrets for access and refresh tokens
JWT_ACCESS_SECRET=your_long_random_access_secret
JWT_REFRESH_SECRET=your_long_random_refresh_secret

# "development" enables morgan request logging; "production" marks cookies as Secure and enables DB SSL
NODE_ENV=development
```

JWTs expire in **5 minutes** (access) and **1 day** (refresh). The cookies that carry them have `maxAge` of **15 minutes** and **7 days** respectively, so the JWT lifetime is the binding limit.

### 3. Database Schema

Create the database and tables:

```sql
CREATE DATABASE node_api;

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

Server runs at `http://localhost:3000`. Interactive API docs are available at `http://localhost:3000/api-docs`.

## Global Middleware

Every request flows through (in order):

1. **CORS** — origin allowlist from [constants/allowedOrigins.js](constants/allowedOrigins.js); `credentials: true` so cookies are sent cross-origin.
2. **`cookie-parser`** — parses `accessToken`, `refreshToken`, and the CSRF cookie.
3. **JSON / urlencoded body parsers** — JSON limited to 10kb.
4. **CSRF (`csurf`)** — applied to all non-`GET/HEAD/OPTIONS` requests, except `GET /auth/csrf-token`. Clients must send the token (default header `X-CSRF-Token` / `csrf-token`) on every state-changing call.
5. **Rate limit** — 100 requests per 15 minutes per IP.
6. **`helmet`** — sets a hardened set of HTTP security headers (CSP, HSTS-ready, frameguard, etc.). `x-powered-by` is also disabled at the app level.
7. **`morgan`** — concise request logging, enabled only when `NODE_ENV=development`.

Protected routes additionally require the `accessToken` cookie (set automatically on login/refresh).

## API Endpoints

### Docs — `/api-docs`

Swagger UI is mounted at `/api-docs` and is generated from JSDoc annotations in the route files via [config/swagger.js](config/swagger.js).

### Auth — `/auth`

| Method | Path                | Auth | Description                                                  |
| ------ | ------------------- | ---- | ------------------------------------------------------------ |
| GET    | `/csrf-token`       | —    | Issue a CSRF token (sets the CSRF cookie, returns the token) |
| POST   | `/register`         | —    | Register a new user                                          |
| POST   | `/login`            | —    | Log in, sets `accessToken` + `refreshToken` cookies          |
| POST   | `/refresh-token`    | —    | Rotate tokens using the `refreshToken` cookie                |
| POST   | `/logout`           | JWT  | Invalidate the refresh token and clear cookies               |
| POST   | `/change-password`  | JWT  | Change password (requires current password)                  |
| POST   | `/forgot-password`  | —    | Generate password reset token (logged to console)            |
| POST   | `/reset-password`   | —    | Reset password using token                                   |

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

These examples use `cookies.txt` to persist the auth + CSRF cookies between calls.

**Fetch a CSRF token** (must be done before any POST/PUT/PATCH/DELETE)

```bash
curl http://localhost:3000/auth/csrf-token \
  -c cookies.txt
# => { "csrfToken": "<token>" }
```

**Register**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -b cookies.txt -c cookies.txt \
  -d '{"name":"Siam","email":"siam@example.com","password":"Secret123!"}'
```

**Login** (sets `accessToken` + `refreshToken` cookies)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -b cookies.txt -c cookies.txt \
  -d '{"email":"siam@example.com","password":"Secret123!"}'
```

**Refresh tokens** (reads `refreshToken` cookie, rotates both cookies)

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "X-CSRF-Token: <token>" \
  -b cookies.txt -c cookies.txt
```

**Logout**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "X-CSRF-Token: <token>" \
  -b cookies.txt -c cookies.txt
```

**List users** (GET — no CSRF token required)

```bash
curl "http://localhost:3000/users?page=1&limit=10" \
  -b cookies.txt
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

1. **Get CSRF token** — `GET /auth/csrf-token` sets the CSRF cookie and returns the token. Send it on every state-changing request.
2. **Login** — sets two httpOnly cookies: `accessToken` (15-min cookie / 5-min JWT) and `refreshToken` (7-day cookie / 1-day JWT). The refresh token is stored server-side as a SHA-256 hash.
3. **Authenticated requests** — the browser sends the `accessToken` cookie automatically; [middleware/authMiddleware.js](middleware/authMiddleware.js) verifies it and populates `req.user`.
4. **Refresh** — when the access token expires, call `POST /auth/refresh-token`. The server hashes the incoming refresh token, looks it up, issues new tokens, and rotates both cookies.
5. **Token-reuse detection** — if a refresh token is presented but no matching hash is found, all of that user's sessions are invalidated (`clearRefreshToken`) and a `TOKEN_REUSE_DETECTED` audit entry is written.
6. **Logout** — clears the stored refresh token hash and both cookies.

Cookie flags (see [utils/cookies.js](utils/cookies.js)): `httpOnly`, `sameSite: 'strict'`, and `secure` when `NODE_ENV=production`.

## CSRF Protection

`csurf` is mounted globally with cookie-stored tokens. Behavior:

- `GET`, `HEAD`, and `OPTIONS` requests bypass the check.
- `GET /auth/csrf-token` is exempt from the CSRF check itself but is the route that issues the token.
- All other methods require the token from `GET /auth/csrf-token`, sent in the `X-CSRF-Token` (or `csrf-token`) header. The CSRF cookie must accompany the request.
- Missing/invalid tokens return `403 EBADCSRFTOKEN` from the global error handler.

## API Documentation (Swagger)

Swagger UI is served at [http://localhost:3000/api-docs](http://localhost:3000/api-docs). The OpenAPI 3.0 spec is generated by `swagger-jsdoc` from `@swagger` JSDoc blocks placed above route handlers in [routes/](routes/), with the base definition in [config/swagger.js](config/swagger.js).

All 14 endpoints (8 auth + 6 user) are documented with request bodies, path/query parameters, response schemas, and the relevant error cases (400 / 401 / 403 / 404 / 409). Reusable components defined in [config/swagger.js](config/swagger.js):

- **Schemas:** `User`, `SuccessResponse`, `PaginatedUsersResponse`, `ErrorResponse`
- **Security schemes:** `cookieAuth` (`accessToken` cookie), `apiKeyAuth` (`x-api-key` header), `csrfToken` (`x-csrf-token` header)

Public auth endpoints (`/register`, `/login`, `/forgot-password`, `/reset-password`, `/csrf-token`) override the global security with `security: []` so Swagger UI does not require credentials for them.

To document a new endpoint, add a `@swagger` JSDoc block above its handler — it will be picked up automatically on next start.

## Audit Logging

Sensitive actions are recorded in the `audit_logs` table via a fire-and-forget service ([services/auditLogService.js](services/auditLogService.js)). Failures are logged but never break the request. Tracked actions are defined in [constants/auditActions.js](constants/auditActions.js):

- `LOGIN`
- `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`, `RESTORE_USER`
- `CHANGE_PASSWORD`, `RESET_PASSWORD`
- `TOKEN_REUSE_DETECTED`

Each entry stores the actor, action, entity type/id, and a JSON `metadata` blob.

## Security Notes

- Passwords are hashed with **bcrypt** (cost 10).
- Access and refresh tokens use **separate secrets** (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
- Tokens travel in **httpOnly + sameSite=strict** cookies (Secure in production), so they are not reachable from JavaScript.
- Refresh tokens are stored as a **SHA-256 hash** ([utils/hash.js](utils/hash.js)) and rotated on every refresh.
- Refresh-token reuse triggers full session invalidation for that user and an audit-log entry.
- Reset tokens are also stored as a SHA-256 hash; only the raw token leaves the server, and they expire after **15 minutes**.
- `helmet` sets hardened HTTP security headers; `x-powered-by` is disabled.
- CORS uses an explicit allowlist ([constants/allowedOrigins.js](constants/allowedOrigins.js)) with `credentials: true`.
- `forgot-password` does **not** reveal whether an email exists.
- `.env` is git-ignored — never commit secrets.

## Scripts

| Script       | Description                              |
| ------------ | ---------------------------------------- |
| `yarn dev`   | Start dev server with nodemon            |
| `yarn start` | Run the server with `node` (production)  |

## License

MIT
