---
name: frontend_project_bootstrap
description: Use this skill when starting a brand-new frontend project to scaffold universal architecture baseline: App Router, module boundaries, providers, query client, auth shell, and strict config defaults.
---

# Frontend Project Bootstrap

## Goal
Initialize a new Next.js frontend with strict architecture from day one.

## Steps
1. Initialize baseline:
- App Router groups: `(public)`, `(admin)`
- Root layout + global providers
- `/api/health` endpoint

2. Create architecture skeleton:
- `src/modules/<feature>/{domain,application,infrastructure,presentation}`
- `src/shared/{providers,lib,ui,config,constants,types}`
- `_template` module as first reference

3. Add core runtime:
- Query client/provider
- HTTP client with typed error mapping
- Auth guard shell for protected routes
- Environment validation baseline

4. Add strict configs:
- TypeScript strict options
- Path aliases
- Tailwind/PostCSS setup
- Base Next.js config

5. Validate outcome:
- Project compiles
- Protected routes resolve to auth flow
- Module boundaries are respected
- Starter showcase page exists and demonstrates reusable baseline components

6. Enforce reuse baseline:
- Register reusable primitives in `src/shared/ui`
- Keep starter examples in `starter-showcase.tsx` as source of truth for new projects
- Do not duplicate primitives in module folders during bootstrap

## Output Format
- Final tree
- Key entry files
- What to replace first (`_template`, auth flow, API contracts)
