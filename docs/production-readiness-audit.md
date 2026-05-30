# AI Website Builder Production Readiness Audit

## Repository findings

### Existing architecture
- Frontend is a React + TypeScript + Vite app with Better Auth UI, route-based pages, a project dashboard, preview iframe, chat sidebar, and visual editor components.
- Backend is an Express + TypeScript API using Better Auth, Prisma, and PostgreSQL.
- Prisma already contains `WebsiteProject`, `Conversation`, and `Version` models, but the backend previously exposed only Better Auth and a health/root route.

### Unfinished features identified
- Project creation was simulated on the home page and did not call the backend.
- My Projects and Community pages used local dummy data instead of database-backed endpoints.
- The builder page did not load, save, publish, or generate project updates through the API.
- Chat revisions and version rollback were UI-only stubs.
- Preview and public view pages read dummy data rather than authenticated/private or published/public API data.
- Publishing toggled client state only and did not protect unpublished projects.

### Missing backend endpoints identified
- Authenticated project CRUD endpoints.
- Authenticated generation/regeneration endpoint.
- Version restore endpoint with project ownership checks.
- Publish/unpublish endpoints.
- Public published-project read endpoints.
- Centralized health, not-found, validation, and error responses.

### Security vulnerabilities identified
- Private frontend routes were not guarded by session checks.
- There was no middleware authorization layer for project ownership.
- API request bodies were not centrally validated.
- Express JSON size limits, rate limiting, hardened CORS, and security headers were missing.
- Generated/previewed HTML could include scripts, inline event handlers, iframes, unsafe URLs, and dangerous CSS.
- Preview iframes allowed scripts and same-origin broadly in listing/public contexts.
- Database queries did not enforce ownership because project routes did not exist.

### Database gaps identified
- Project ownership did not cascade on user deletion.
- Project listing and public-gallery queries lacked targeted indexes.
- Conversation/version timeline lookups lacked project/timestamp indexes.
- Project lifecycle metadata lacked archive and generation status flags.

### Scalability and UX bottlenecks identified
- Dashboard/community pages loaded static arrays instead of paginated server data.
- The client lacked a reusable API layer, causing duplicated future fetch logic risk.
- The production frontend bundle still exceeds the default Vite chunk warning threshold and should be route-split in a later increment.
- Pricing/billing remains incomplete and should be integrated with a payment provider in a dedicated billing increment.

## Implementation completed in this increment

### Backend security foundation
- Added security headers, hardened CORS, request body size limits, and in-memory API rate limiting.
- Added centralized async handling, not-found handling, and structured error responses.
- Added Better Auth session middleware for private project APIs.
- Added Zod validation for project, generation, archive, params, and query payloads.
- Added ownership checks on every private project operation.

### Project/product APIs
- Added authenticated project list, create, get, update, delete, duplicate, archive, generate, restore-version, publish, and unpublish endpoints.
- Added public published-project list, get, and version-read endpoints.
- Project creation and regeneration now save conversation entries, generated code, versions, and current version pointers transactionally.

### AI/editor content safety
- Added generated HTML validation and sanitization to block scripts, iframes, inline event handlers, unsafe URL schemes, dangerous CSS, and server-side execution patterns.
- Restricted generated output to static frontend HTML/CSS.
- Hardened preview messaging and editor updates to sanitize style/class mutations.
- Removed script permissions from dashboard/community/public read-only preview iframes.

### Frontend integration
- Added a reusable API client.
- Added route protection for private project routes.
- Connected home project creation, dashboard list/delete, builder load/save/generate/publish, version restore, preview, community, and published view pages to backend APIs.
- Replaced `any`-based editor update typing with explicit selected-element/update types.

## Recommended next increments

1. Replace the deterministic safe static generator with a production AI provider service that uses the same `assertSafeGeneratedCode` gate before storage.
2. Add job-backed asynchronous generation status tracking for long-running AI calls.
3. Add project pagination, search debounce, archive UI, duplicate UI, and optimistic dashboard updates.
4. Route-split the frontend with `React.lazy` and chunk vendor libraries.
5. Add automated API tests for ownership, validation, publishing, and sanitizer bypass cases.
6. Integrate billing and credit enforcement before charging users.
7. Add deployment configuration for production CORS origins, Better Auth URL/secret validation, database migrations, and observability.
