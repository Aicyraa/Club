# Club

A club membership web app — an early-stage monorepo with a TypeScript/Express + PostgreSQL backend and a React + Vite frontend.

> **Status:** early development. The backend has signup scaffolding; the frontend is a bare starter. The two are not yet wired together.

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
├── .env.example              # PORT, SECRET, ENVIRONMENT, CONNECTION_STRING
├── backend/
│   └── src/
│       ├── app.ts                    # Express entry point
│       ├── types.ts                  # User, Message, RequestError
│       ├── routes/signupRoute.ts     # POST /signin
│       ├── controllers/signupController.ts
│       ├── models/pool.ts            # pg Pool from CONNECTION_STRING
│       ├── models/query.ts           # addUser INSERT
│       ├── middlewares/              # errorHandler, formValidator, rateLimiter
│       └── error/appError.ts         # AppError class
└── frontend/
    └── src/
        ├── main.tsx                  # React entry
        └── App.tsx                   # root component
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

2. Copy `.env.example` to `.env` and fill in the values:

   ```sh
   cp .env.example .env
   ```

   | Variable            | Description                  |
   | ------------------- | ---------------------------- |
   | `PORT`              | Backend port (e.g. `3000`)   |
   | `SECRET`            | App secret                   |
   | `ENVIRONMENT`       | `DEV` or `PROD`              |
   | `CONNECTION_STRING` | PostgreSQL connection string |

3. Make sure the `users` table exists in your database (no migrations are set up yet).

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

### Test

Vitest lives at the root and runs each package's tests from its own directory:

```sh
npm test               # backend + frontend (sequential)
npm run test:backend   # backend only
npm run test:frontend  # frontend only
```

## API

| Method | Path      | Description                                                         |
| ------ | --------- | ------------------------------------------------------------------- |
| `POST` | `/signin` | Register a user (hashes password with bcrypt, inserts into `users`) |
| `*`    | catch-all | 404 handler                                                         |

All responses follow the shape `{ success: boolean, error?: { statusCode, message } }`.

## Conventions

- TypeScript everywhere, strict mode on both packages.
- Backend layering: `routes` → `controllers` → `models`, with `middlewares/` and `error/`.
- Path alias `@/*` → `./src/*` in both packages.
- camelCase filenames, PascalCase classes/interfaces, verb-prefixed functions (`postUser`, `addUser`).

## Roadmap

- Mount the signup route and finish the controller (success response, awaited insert).
- Add login and messaging features (types and validation stubs already exist).
- Connect the frontend to the backend (API client + Vite proxy).
- Add a DB schema/migration for the `users` table.
