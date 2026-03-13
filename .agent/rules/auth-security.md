# Auth and Security Rules

## 1. Session Strategy
Preferred for web:
- Refresh token in secure httpOnly cookie.
- Access token short-lived (memory/cookie strategy by architecture choice).
- Token rotation on refresh endpoint.

If JWT client storage is used:
- Never store refresh token in `localStorage`.
- Minimize token lifetime and enforce revocation strategy server-side.

## 2. Authorization
- UI role checks are UX-only.
- Real authorization must be enforced server-side (route handler/server action/backend).
- Admin routes require both routing guard and server permission validation.

## 3. CSRF and Transport
- Cookie-based auth must include CSRF protection.
- Always enforce HTTPS in production.
- Set `SameSite`, `Secure`, `HttpOnly` correctly for cookies.

## 4. Input/Output Security
- Validate all incoming payloads with Zod on server boundaries.
- Escape/sanitize rich content before rendering.
- Never trust query params without parsing and validation.

## 5. Secrets and Config
- Secrets are server-only environment variables.
- Never expose secret keys through `NEXT_PUBLIC_*`.
- Audit and rotate credentials.

## 6. Logging and Privacy
- No passwords/tokens/PII in logs.
- Error telemetry must redact sensitive payload fields.

## 7. Forbidden
- Authorization based only on client state
- Secret usage inside client components
- Blindly forwarding backend raw errors to users
