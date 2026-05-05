# node-api-postgres

A RESTful API built with **Node.js**, **Express 5**, and **PostgreSQL**. It provides user management with authentication, JWT-based authorization, password recovery, soft-delete + restore, request validation, rate limiting, and a global error handler.

## Tech Stack

- **Runtime:** Node.js (ESM — `"type": "module"`)
- **Framework:** Express 5
- **Database:** PostgreSQL via `pg`
- **Auth:** `jsonwebtoken` (JWT) + `bcrypt`
- **Validation:** `joi` & `zod`
- **Security/Infra:** `cors`, `express-rate-limit`, API-key middleware
- **Dev:** `nodemon`

## Project Structure

```
.
├── app.js                  # Express app entry point
├── constants/
│   └── errorCodes.js       # Centralized error codes
├── controllers/
│   ├── authController.js   # Register, login, password flows
│   └── userController.js   # User CRUD + restore
├── db/
│   └── index.js            # PostgreSQL pool
├── middleware/
│   ├── apiKey.js           # x-api-key gate
│   ├── asyncHandler.js     # Async wrapper
│   ├── authMiddleware.js   # JWT Bearer auth
│   ├── authorizeSelf.js    # Owner-only guard
│   ├── errorHandler.js     # Global error handler
│   ├── validate.js         # Schema validator
│   └── validateId.js
├── models/
│   └── userModel.js        # SQL queries
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── services/
│   ├── auth/
│   │   └── authService.js  # Auth business logic
│   └── userService.js
├── utils/
│   ├── AppError.js         # Custom error class
│   ├── formatZodError.js
│   ├── jwt.js              # Token sign/verify
│   ├── resetToken.js       # Reset-token generation
│   └── response.js         # Unified success response
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
JWT_SECRET=your_long_random_secret
```

### 3. Database Schema

Create the database and `users` table:

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

Protected routes additionally require an `Authorization: Bearer <jwt>` header.

## API Endpoints

### Auth — `/auth`

| Method | Path                | Auth | Description                                   |
| ------ | ------------------- | ---- | --------------------------------------------- |
| POST   | `/register`         | —    | Register a new user                           |
| POST   | `/login`            | —    | Log in, returns JWT                           |
| POST   | `/change-password`  | JWT  | Change password (requires current password)   |
| POST   | `/forgot-password`  | —    | Generate password reset token (logged to console) |
| POST   | `/reset-password`   | —    | Reset password using token                    |

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

**Login**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"email":"siam@example.com","password":"Secret123!"}'
```

**List users**

```bash
curl http://localhost:3000/users?page=1&limit=10 \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer <jwt>"
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

## Security Notes

- Passwords are hashed with **bcrypt** (cost 10).
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
