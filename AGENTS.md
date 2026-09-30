# Club — agent notes

Two-app TypeScript repo: `backend/` (Express 5 + pg + passport) and `frontend/` (React 19 + Vite 8 + Tailwind 4). Verify claims here against code; `README.md` is **stale** (it documents `/users`, `/messages`, `src/error/dbError.ts`, and a root `.env` — none of which exist now).

This project is about practicing exclusive options and action for users who have membership status or higher action for admin

## Task

- Delagate task to sub agents as much as possible 


## Layout: not npm workspaces

- Three separate installs are required: root, `backend`, `frontend`. `shared/` is a types-only pseudo-package (`@repo/types`) resolved **only** through tsconfig `paths` — nothing installs or links it, so don't expect it in `node_modules`.
- `shared/types.d.ts` is the single source of truth for `User`, `PublicUser`, `Message`, `SignupFields`, `LoginFields`, `ApiResponse`. Change it there, not in `backend/src/types/type.ts` (that file holds Express request helpers) or `frontend/src/types/type.ts` (frontend-local only).
- `Express.User` is augmented in `backend/src/types/express.d.ts` to be `User` from `@repo/types`.

## Commands (verified)

| Task | Command | State |
| --- | --- | --- |
| Run both | `npm run dev` (root, `concurrently`) | works |
| Backend only | `npm run dev --prefix backend` (dotenv + nodemon + tsx, `tsconfig.node.json`) | needs `backend/.env` |
| Frontend only | `npm run dev --prefix frontend` | works |
| Build | `npm run build --prefix backend` | passes (`tsc` + `tsc-alias` rewrites `@` aliases in `dist`) |
| Build | `npm run build --prefix frontend` | **fails typecheck**: unused `useState` in `App.tsx` (left alone on request — deleting that one import fixes it) |
| Lint | `npm run lint --prefix frontend` (flat config in `frontend/eslint.config.js`) | runs, 2 pre-existing errors (`App.tsx` unused var, `UserContext` react-refresh) |
| Lint | `npm run lint` (root) | **broken**: ESLint 10 needs flat config, there is no root `eslint.config.*`, and `--ext` was removed |
| Test | `npm run test:backend` / `npm run test:frontend` (`vitest run --root <pkg> --passWithNoTests`) | backend suite is red (below) |

**Backend tests are currently failing — do not assume you broke them.** `npm run test:backend` gives 4 failed suites + 2 failed assertions:

- 4 suites fail to *collect*: vitest has no alias config, so any `src` module importing `@utils/*`, `@models/*`, ... blows up with `Cannot find package '@utils/appError'`. Existing tests that pass use only relative imports (`../../src/...`). When you need aliases in tests, add a `vitest.config.ts` under `backend/` — don't rewrite source imports to relative paths.
- `tests/error/dbError.test.ts` and `tests/middlewares/errorHandler.test.ts` import `src/error/dbError`, which was deleted (now `utils/appError.ts` + `utils/ApiResponse.ts`).
- Real assertion failures: `tests/middlewares/auth.test.ts` (`serializeCb` receives `user.userid`, code now uses `user.user_id`) and `tests/middlewares/formValidator.test.ts` (expects `"Lastname is empty."`, code says `"Username is empty."`).

## Environment

- Env file is **`backend/.env`**, not the root. Loaded by `dotenv-cli` inside the backend `dev`/`start` scripts. Vars: `PORT`, `SECRET`, `ENVIRONMENT` (`DEV`/`PROD`), `CONNECTION_STRING` (see `backend/.env.example`).
- `backend/src/models/pool.ts` throws on import if `CONNECTION_STRING` is unset — so anything importing it (directly or transitively) needs a valid DB URL.
- **No migrations or schema files.** The `users` table must already exist; `models/query.ts` runs raw SQL against it.

## Backend quirks

- `src/app.ts` calls `app.listen()` at import time. Never import it from a test.
- Two error payload shapes coexist: success responses use the `ApiResponse` class (`{ success, message, statusCode, data? }`, always `success: true`), while `middlewares/errorHandler.ts` emits `{ success: false, error: { statusCode, message } }`. Routes/controllers throw `new AppError(msg, code)`; the last two middlewares in `app.ts` are `unknownPage` then `errorHandler` — order matters, append routes before them.
- Session auth: `config/passport.ts` wires the `local` strategy, `serializeUser` → `user.user_id`. No session store configured (express-session default `MemoryStore`), so sessions die on restart. `requireAuth` / `destroySession` in `middlewares/auth.ts` use `req.isAuthenticated()` / `req.logOut()`; keep them last in their middleware chains.
- Route layer: `routes/*` only builds `express.Router()`s and chains middlewares → `controllers/*` → `models/query.ts`.

## Frontend quirks

- `verbatimModuleSyntax` is on: **every type import must be `import type`**, and `noUnusedLocals`/`noUnusedParameters` are on (that is why the build fails today).
- `allowImportingTsExtensions` is on and imports commonly carry the extension (`@services/setup.ts`, `./route.tsx`). Neighboring files also use relative imports (`App.tsx`, `route.tsx`) — match the file you are editing rather than "fixing" it.
- Vite 8 resolves tsconfig paths natively via `resolve.tsconfigPaths`; `vite-tsconfig-paths` was removed on purpose. Don't re-add the plugin.
- UI is shadcn/ui (Base UI base, style `base-nova`, neutral palette). Primitives live in `src/components/ui/`, `cn()` in `src/lib/utils.ts`, tokens in `src/index.css` (`:root`/`.dark` OKLCH vars + `@theme inline` + `@import "shadcn/tailwind.css"` for the `data-*` variants). `App.tsx` is deliberately still unstyled — do not restyle it unless asked.
- Adding shadcn components: the CLI **cannot resolve this repo's `@components/*` alias** — it aborts with "Could not resolve the following aliases: ui", and if forced it writes files into a literal `frontend/@/` directory and rewrites `cn` imports to a bare `cn` npm package. `components.json` therefore uses `ui: "@/components/ui"` / `utils: "@/lib/utils"`. `shadcn init` is scaffolding-only here; the theme came from `shadcn apply <preset-code> --only theme` (`npx shadcn preset resolve` prints the code). New npm deps: `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, dev `shadcn`. `frontend/src/components/ui/**` is exempt from `react-refresh/only-export-components` in `eslint.config.js` because the primitives export their cva variants.
- API: `services/setup.ts` is a bare axios instance with relative `baseURL: 'api/v1/'`; `vite.config.ts` proxies `/api` → `http://localhost:3000`. There is no env var for the API URL — the proxy is the wiring.
- Routes are React Router 7 data routes: the `/` loader (`route.tsx` `isAuthenticated`) hits `GET /api/v1/me`; `UserProvider` wraps `RouterProvider` in `main.tsx` because loaders can't reach context.
- Tailwind 4 is CSS-first — no config file, tokens live in `src/index.css`.
- Form errors render through shadcn's `FieldError` (`errors={[{ message }]}`) with `data-invalid` on `Field` + `aria-invalid` on the control. `src/components/error/InputError.tsx` was deleted; the now-unused `@error/*` tsconfig alias can go.
- `services/setup.ts` also exports `getApiErrorMessage(error, fallback)` because the backend's error text is not always a string: `loginController` passes `errors.array` (a function) as the `AppError` message, so the UI must never render `error.message` blindly.

## Formatting / conventions

- No Prettier config exists, so `npm run format` at the root applies **defaults** (2-space, double quotes, semicolons), which contradicts the committed style: 3-space indent, single quotes, no semicolons. Run it on specific files, or don't.
- Filenames camelCase (`formValidator.ts`, `signupController.ts`), components PascalCase, backend modules use named exports; classes (`AppError`, `ApiResponse`, `pool`, `passport`) use default exports.
- Commits follow Conventional Commits (`feat:`, `refactor:`, `fix:`, `chore:`), one logical change per commit.
- Local skills live in `.agents/skills/` (shadcn, tailwind-v4-shadcn) — load them with the `skill` tool when doing UI work.
