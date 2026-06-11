# Deployment Readiness Audit

## Audit performed before code changes

### Build and TypeScript status
- Backend `npm install`, `npx prisma generate`, `npm run build`, and `npx prisma validate` completed successfully in the existing workspace.
- Frontend `npm install` and `npm run build` completed successfully in the existing workspace.
- Frontend build emits Vite's default large-chunk warning because the current app is not route-split. This is not a deployment blocker.

### Prisma and database status
- `server/prisma/schema.prisma` validates with Prisma 7.2.0.
- `npx prisma generate` creates the custom Prisma client at `server/generated/prisma`, which is intentionally gitignored.
- The backend TypeScript build depends on the generated Prisma client existing before `tsc` runs, so the production build script should run Prisma generate before TypeScript compilation.
- `npx prisma migrate deploy` requires `DATABASE_URL`; without that environment variable Prisma reports that `datasource.url` is required. This is expected locally and must be configured on Render with the Neon connection string.

### Environment variable issues
- `client/.env` used quoted syntax with spaces: `VITE_BASEURL= 'http://localhost:3000'`. Vite environment values should be unquoted and should not include spaces.
- No frontend or backend `.env.example` files existed for deployment setup.
- Backend requires `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `TRUSTED_ORIGINS`; `PORT` and `NODE_ENV` are deployment/runtime variables.

### Render deployment blockers
- Backend `start` script ran `tsx server.ts`, which relies on a development TypeScript runner instead of compiled JavaScript.
- Backend `build` script only ran `tsc`, so a clean Render build could fail if Prisma client generation had not happened first.
- `server/dist` was not ignored, so local production builds could create untracked artifacts.

### Netlify deployment blockers
- The app uses `BrowserRouter`; Netlify needs an SPA fallback so direct visits to `/projects/:id`, `/preview/:id`, and `/auth/*` return `index.html`.
- Frontend env example was missing, making it easy to forget the deployed backend URL.

### Better Auth deployment notes
- Better Auth must use the Render backend URL as `BETTER_AUTH_URL`.
- Netlify frontend origin must be present in `TRUSTED_ORIGINS` for Better Auth and CORS.
- Production cross-site cookies require HTTPS, which Netlify and Render provide.

### Security hardening status
- The previous increment added manual security headers, CORS hardening, request limits, central errors, Zod validation, ownership checks, and generated-content safety.
- Adding the `helmet` package was attempted, but this environment's npm registry policy returned HTTP 403 for `helmet`. To keep verification passing, this increment retains the existing manual security headers rather than adding an un-installable dependency.
