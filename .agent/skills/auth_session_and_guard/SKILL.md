---
name: auth_session_and_guard
description: Use this skill for implementing or reviewing auth/session flows in Next.js projects: login/logout, refresh, middleware guards, role checks, and secure token handling.
---

# Auth Session and Guard

## Goal
Keep authentication secure, predictable, and aligned with server authority.

## Steps
1. Define session model:
- Access token lifetime
- Refresh strategy (httpOnly cookie preferred)
- Logout and revocation behavior

2. Guard strategy:
- Middleware for quick route-level redirect decisions
- Server-side permission checks for protected data/actions
- Role-based UI rendering as UX layer only

3. API/auth integration:
- Centralize auth client/interceptor behavior
- Handle 401 -> refresh -> retry path safely
- Prevent refresh stampede with single-flight strategy

4. Security checks:
- No refresh token in localStorage
- No secrets in client bundles
- CSRF protection for cookie auth

5. Failure UX:
- Expired session -> deterministic redirect/login flow
- Friendly unauthorized/forbidden messaging
