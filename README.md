# PlayNest

PlayNest is a mobile-first, privacy-conscious web app for discovering and organizing guardian-attended family activities at public venues. It is a deployable React/Vite frontend backed by Supabase Auth, Postgres, RLS, database functions and optional Edge Functions.

The beta intentionally has no child directory, chat, public attendee list, ratings, background-check claims, live location, paid maps or fabricated adoption signals. Example events are completed, visibly labelled and non-joinable.

## Local development

Requirements: Node 22+, npm, and optionally the Supabase CLI.

```bash
cp .env.example .env
npm install
npm run dev
```

Create a free Supabase project, copy its Project URL and anon/publishable key into `.env`, then apply the schema:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

In Supabase Authentication, enable email/password, require email confirmation, and add local/production URLs to the redirect allowlist. Run `supabase db reset` for a local stack with the locality seed. Never put the service-role or Resend key in a `VITE_` variable.

Verification:

```bash
npm run lint
npm run typecheck
npm test
npm run build
supabase test db
```

## Architecture and security

- `src/` contains accessible React routes, forms, calendar/share helpers and the notification provider interface.
- `supabase/migrations/` defines enums, constraints, indexes, RLS and moderation tables.
- `decide_event_request` locks the event row before recalculating capacity, preventing concurrent acceptance of the final place. It automatically waitlists an oversized request.
- Child selection uses `event_request_children`; no arbitrary child JSON is accepted.
- Public reads expose event/venue data but never child profiles or attendees. Private notes are available only through party-restricted tables.
- Admin powers are enforced by RLS and `is_admin()`, not merely hidden UI.
- Analytics has a database constraint against sensitive property names.
- The service worker caches only a static shell and bypasses Supabase Auth/REST requests.
- The optional email function retrieves only the caller's own notification and gracefully reports disabled delivery. Core actions use database notifications and do not depend on email.

Before a public launch, add CAPTCHA/rate limiting at the Supabase/project edge, configure leaked-password protection and MFA for admins, review the concise policy text with Swedish/EU counsel, establish retention schedules, and perform a threat-model/RLS audit.

The initial administrator is bootstrapped by migration `202607210003_bootstrap_admin.sql`. After that account has registered and the migration has been applied, replace the email-specific trigger with the standard parent-only signup trigger to close the bootstrap path.

## Optional transactional email

Email is off by default; in-app notifications still work. To enable it:

```bash
supabase secrets set RESEND_API_KEY=... RESEND_FROM='PlayNest <hello@your-domain.example>'
supabase functions deploy send-notification
```

Disable it at any time by deleting `RESEND_API_KEY`. The browser never receives the key. For production, trigger delivery server-side (database webhook/queue) rather than trusting a browser call.

## Cloudflare Pages deployment

1. Push the repository to GitHub and create a Cloudflare Pages project.
2. Build command: `npm run build`; output directory: `dist`; Node version: `22`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Pages environment variables.
4. Add the Pages URL to Supabase Auth redirect URLs.
5. Deploy. The SPA fallback is supplied by `public/_redirects`.

GitHub Actions runs lint, strict TypeScript, tests and production build on pushes and pull requests.

## Free-tier operations and cost safety

The frontend can run on Cloudflare Pages' free tier, while Supabase's free tier provides Auth, Postgres and Edge Functions. Resend is optional and has a limited free tier. Google/Apple directions and Google Calendar use outbound URLs—not paid APIs.

Monitor Supabase database size, monthly active users, egress, function invocations and email limits; monitor Cloudflare builds/bandwidth and Resend sends. Higher usage, backups, custom email volume or more projects may eventually require payment. Keep spend alerts enabled, do not attach paid map/SMS/analytics services, retain only necessary moderation data, and leave Resend unset until email is needed. Provider quotas and pricing can change, so verify current dashboards before launch.

## Product follow-through

This first version includes the full data foundation and core screens. The request/organizer/admin UI is intentionally honest when the database is empty. Before inviting beta families, connect those screens to project data, add browser-level Supabase integration tests, deploy and test the Edge Functions, and seed only real organizer-owned upcoming events.
