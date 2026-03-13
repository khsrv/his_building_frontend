# Next.js App Router Rules

## 1. Routing Model
- Use App Router only (`src/app`).
- Organize by route groups: `(public)`, `(admin)`, `(auth)`.
- Keep `page.tsx` and `layout.tsx` composition-focused.
- Move feature logic to `src/modules/<feature>/presentation`.

## 2. Server vs Client Components
- Default to Server Components.
- Add `"use client"` only when interaction/browser API is required.
- Do not convert full route trees to client components for convenience.
- Keep heavy data loading on server when possible.

## 3. Data Fetching and Hydration
- Prefer server fetch for initial critical render.
- For interactive/live client state, use TanStack Query hooks.
- If prefetching on server for Query, use explicit hydration boundaries.
- Define cache intent explicitly (`force-cache`, `no-store`, `revalidate`).

## 4. Middleware and Guards
- Middleware does lightweight checks only (auth/session hint, redirects).
- No heavy IO/database queries in middleware.
- Final permission checks happen on server handlers/actions as well.

## 5. Server Actions and Route Handlers
- Use Server Actions for trusted mutation flows tied to UI.
- Use Route Handlers for explicit API/BFF endpoints.
- Validate all incoming payloads with Zod on the server.
- Return typed error envelopes; do not leak raw exceptions.

## 6. Metadata and SEO
- Use `generateMetadata` per route when dynamic.
- Do not compute heavy business data in metadata functions.
- Ensure canonical/title/description for public pages.

## 7. Forbidden
- Business rules inside `app/**/page.tsx`
- Duplicated fetch logic in both route and module without reason
- Client-side secret usage
