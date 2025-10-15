# Booking Web (Next.js + Tailwind)

## Overview

- Google Sign-In → obtains **API JWT**
- Cookie-based session + **middleware** route guard
- Dashboard to **create / list / delete** bookings
- Calendar page to **connect / disconnect** Google Calendar and show connection status
- Responsive, friendly UI (Tailwind)

---

## Requirements

- Node 18+
- PNPM (or npm)
- Backend running at `http://localhost:4000`

---

## Quick start

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev        # http://localhost:3000
.env.local example
env
Copy code
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
NEXT_PUBLIC_API_URL="http://localhost:4000"
Auth flow
Google widget returns an ID Token.

Frontend calls POST /auth/google on the backend.

Backend returns JWT → stored in cookie auth.

Axios attaches Authorization: Bearer <JWT> for API requests.

middleware.ts requires the cookie to access protected routes.

Routes (frontend)
/login — Google Sign-In; sets auth cookie; redirects to origin (?from=).

/ — Dashboard (protected): create / list / delete bookings.

/calendar — Connect Google Calendar; shows connected / not connected, re-authorize, disconnect.

Middleware
Place middleware.ts at the project root.

Behavior

If no auth cookie and the path is not /login → redirect to /login?from=<path>.

If auth exists and the path is /login → redirect to /.

UI highlights
Booking Form Card

Date + time inputs separated

Quick duration chips (15 / 30 / 45 / 60 / 90 / 120 min)

End time auto-calculated from start + duration (editable)

“Today / Tomorrow” shortcuts

Timezone shown; inline validation

Toast notifications

Responsive layout with Tailwind

Scripts
json
Copy code
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
Notes
For production, prefer an HttpOnly cookie via a Next API route to set the token server-side.

Align backend CORS with your frontend origin(s).

Send times to the API as UTC ISO strings; convert local inputs with:

ts
Copy code
new Date(localValue).toISOString();