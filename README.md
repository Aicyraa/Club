# Club

A role-aware club board with a TypeScript/Express + PostgreSQL backend and a
React + Vite frontend. Signed-in users can post anonymously, members can see
the authors of public posts, and administrators can moderate the board.

## Tech Stack

| Layer    | Tech                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| Backend  | TypeScript, Express 5, PostgreSQL (`pg`), bcryptjs, express-validator, express-rate-limit |
| Frontend | React 19, Vite 8, Tailwind CSS 4, react-router-dom                                        |
| Tooling  | `concurrently` (root dev script), ESLint, Prettier, Husky, lint-staged, Vitest (root test runner) |

## Project Structure

```
Club/
├── package.json              # root: "dev" runs both apps; "test" runs both test suites
├── backend/
│   ├── .env.example                  # backend runtime configuration
│   ├── sql/schema.sql                # idempotent PostgreSQL bootstrap
│   └── src/
│       ├── app.ts                    # Express entry point
│       ├── routes/                   # auth, profiles, and messages
│       ├── controllers/              # request handlers
│       ├── models/pool.ts            # pg Pool from CONNECTION_STRING
│       ├── models/query.ts           # user + message queries
│       ├── middlewares/              # errorHandler, formValidator, rateLimiter
│       └── error/dbError.ts           # PostgreSQL-to-HTTP error mapping
└── frontend/
    ├── .env.example                  # optional production API URL
    └── src/
        ├── main.tsx                  # React entry
        ├── route.tsx                 # lazy routes and auth loaders
        └── App.tsx                   # protected club board
```

## Getting Started

### Prerequisites

- Node.js (npm)
- PostgreSQL (local instance)

### Setup

1. Install dependencies (three separate installs — no npm workspaces):

   ```sh
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Copy the backend environment example and fill in the values:

   ```sh
   cp backend/.env.example backend/.env
   ```

   | Variable            | Description |
   | ------------------- | ----------- |
   | `PORT`              | Backend port, from `1` to `65535` |
   | `SECRET`            | Session-signing secret; at least 32 bytes in production |
   | `ENVIRONMENT`       | Exactly `DEV` or `PROD` |
   | `CONNECTION_STRING` | PostgreSQL connection string |
   | `CORS_ORIGIN`       | Optional comma-separated frontend origins |
   | `MEMBERSHIP_SECRET` | Code that unlocks member access |

3. Apply the idempotent schema. It creates the `users`, `messages`, and
   `session` tables and their indexes:

   ```sh
   psql "$CONNECTION_STRING" -f backend/sql/schema.sql
   ```

4. Promote yourself to admin — there is no UI for it, so the first admin has to
   be set by hand:

   ```sql
   UPDATE users SET is_admin = TRUE WHERE username = 'your-username';
   ```

### Membership code

`POST /api/v1/profiles/membership` compares the submitted code against
`MEMBERSHIP_SECRET` in `backend/.env` using a constant-time comparison. There is
no default; if it is unset, the endpoint returns `503`.

```sh
MEMBERSHIP_SECRET=letmein
```

### Access control

| Role      | How you get it              | Sees                                            | Can do              |
| --------- | --------------------------- | ----------------------------------------------- | ------------------- |
| `normal`  | Default on signup           | Posts without author identities | Post messages |
| `member`  | Redeem `MEMBERSHIP_SECRET`  | Authors of non-anonymous posts | Post messages, edit own profile |
| `admin`   | `UPDATE users SET is_admin` | All author identities for moderation | Delete any message |

The author is stripped inside the SQL `SELECT`, not in the response builder, so
a viewer without permission receives no author id, name, or avatar at all.
Client-side gating is cosmetic — every one of these rules is enforced again by
`requireMember` / `requireAdmin` on the server.

### Run

Start both apps concurrently from the root:

```sh
npm run dev
```

Or individually:

```sh
npm run dev --prefix backend    # Express API on $PORT
npm run dev --prefix frontend   # Vite dev server
```

### Build

```sh
npm run build --prefix backend
npm run build --prefix frontend
```

For a separate production frontend host, copy `frontend/.env.example` to
`frontend/.env.production` and set `VITE_API_BASE_URL` to the API URL including
`/api/v1`. Add that browser origin to `CORS_ORIGIN`. For a same-origin reverse
proxy, leave both values unset and route `/api` to the backend.

Apply `backend/sql/schema.sql` before starting a production deployment. In
`PROD`, startup verifies that the session table exists instead of granting the
application role permission to create tables.

### Test

Vitest lives at the root and runs each package's tests from its own directory:

```sh
npm test               # backend + frontend (sequential)
npm run test:backend   # backend only
npm run test:frontend  # frontend only
```

## API

All paths are prefixed with `/api/v1`. Only `signup` and `login` are public;
every other endpoint requires a session cookie.

| Method   | Path                  | Who              | Description                                              |
| -------- | --------------------- | ---------------- | -------------------------------------------------------- |
| `POST`   | `/signup`             | anyone           | Register a user (hashes password with bcrypt)            |
| `POST`   | `/login`              | anyone           | Authenticate a user and start a session                  |
| `POST`   | `/logout`             | signed in        | Destroy the session                                      |
| `GET`    | `/me`                 | signed in        | Current user as `PublicUser`                              |
| `GET`    | `/messages`           | signed in        | Paginated, role-filtered feed                            |
| `POST`   | `/messages`           | signed in        | Create a message                                          |
| `DELETE` | `/messages/:id`       | admin only       | Delete a message                                          |
| `GET`    | `/profiles`           | signed in        | Own profile plus `messageCount` and `role`                |
| `PATCH`  | `/profiles`           | signed in        | Update username and avatar                                |
| `PATCH`  | `/profiles/password`  | signed in        | Change password (rotates the session id)                  |
| `POST`   | `/profiles/membership`| normal only      | Redeem `MEMBERSHIP_SECRET` to become a member             |
| `*`      | catch-all             | anyone           | 404 handler                                              |

`GET /messages` accepts `?page=` (default `1`) and `?pageLimit=` (default `10`,
capped at `50`) and returns:

```json
{
   "success": true,
   "message": "Messages fetched",
   "statusCode": 200,
   "data": {
      "items": [],
      "total": 0,
      "page": 1,
      "pageLimit": 10,
      "totalPages": 1
   }
}
```

Success responses use the `ApiResponse` class (`{ success: true, message,
statusCode, data }`). Errors use a different shape,
`{ success: false, error: { statusCode, message } }`, emitted by the error
handler middleware.

Sessions are stored in PostgreSQL through `connect-pg-simple`, so they survive
process restarts. Production startup validates the table, cookies are secure
behind the configured trusted proxy, and shutdown drains the HTTP server,
session store, and database pool.

## Conventions

- TypeScript everywhere, strict mode on both packages.
- Backend layering: `routes` → `controllers` → `models`, with `middlewares/` and `error/`.
- Path alias `@/*` → `./src/*` in both packages.
- camelCase filenames, PascalCase classes/interfaces, verb-prefixed functions (`postUser`, `addUser`).

## Production checklist

- Use HTTPS and a reverse proxy in front of the backend.
- Generate unique, high-entropy `SECRET` and `MEMBERSHIP_SECRET` values.
- Apply `backend/sql/schema.sql` with a migration role before deploying.
- Give the runtime database role only the DML permissions it needs.
- Set `CORS_ORIGIN` only when the frontend is hosted on a different origin.
- Run both builds and the backend test suite before releasing.
