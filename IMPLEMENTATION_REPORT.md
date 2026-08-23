# Villa Floyd — Implementation Report

## Completed

### 1. Mobile Amenities stack
- Replaced the mobile one-way card entrance animation with native sticky stacking.
- Cards overlap progressively while scrolling down and unfold naturally when scrolling upward.
- No GSAP or scroll-state React loop was added.
- Desktop/tablet animation remains unchanged.
- Reduced-motion behaviour is preserved.

### 2. Live booking availability
- Removed frontend demo blocked dates.
- Added asynchronous availability service connected to Supabase Edge Functions.
- Added loading, error and retry states to the calendar.
- Pending and confirmed bookings block nights in real time.
- Date ranges use hotel semantics `[check-in, check-out)`, so the checkout day can be reused as another booking's check-in.

### 3. Database safety
- Added a real `bookings` table in Supabase PostgreSQL.
- Added a GiST exclusion constraint that rejects overlapping `pending` or `confirmed` stays at database level.
- Verified with a database test that overlapping dates are rejected and adjacent stays are accepted.
- Enabled RLS and intentionally created no browser table policies.
- Locked down security-definer RPC functions to `service_role` only.

### 4. Booking form
- Removed fake/demo success behaviour.
- Form now sends to the deployed `create-booking` Edge Function.
- A successful request is stored in the database and receives a unique `VF-...` reference.
- Dates become unavailable immediately while the request is pending.
- Duplicate/overlapping booking requests return a conflict error.
- Replaced native browser validation popups with accessible field-level validation.

### 5. Owner workflow
- Deployed `booking-action` Edge Function.
- Secure owner links use a random token; only a SHA-256 hash is stored in the database.
- Opening the link does not mutate data.
- Confirm / Decline require explicit POST actions.
- Decline releases dates immediately.
- Confirm creates a Google Calendar event and then changes the booking to confirmed.

### 6. Google Calendar
- Implemented service-account authentication directly in Supabase Edge Functions.
- Confirmed stays create all-day events using the same exclusive checkout date semantics.
- Calendar event ID is stored in PostgreSQL.
- If the database confirmation fails after event creation, cleanup removes the orphan event.

### 7. Email
- Implemented Hostinger PHP mail bridge templates for:
  - owner booking request/review link;
  - guest request received;
  - guest confirmed;
  - guest declined.
- Email integration is optional during development: booking data is still stored safely if Hostinger PHP mail bridge secrets are not configured.

### 8. Build
- Fixed the existing `tsconfig.node.json` build error by making the Node config no-emit compatible with `allowImportingTsExtensions`.
- Final `npm run build` passes.
- Only Dart Sass legacy API deprecation warnings remain; they do not fail the build.

## Live Supabase project

Project: `VillaFloyd Project`

Deployed Edge Functions:
- `availability` — ACTIVE
- `create-booking` — ACTIVE
- `booking-action` — ACTIVE

Security advisor result:
- One informational notice: RLS is enabled with no policies on `bookings`. This is intentional because browser clients must not read personal booking records directly; all access goes through Edge Functions.

Performance advisor result:
- No findings.

## External configuration to verify before full launch

### Hostinger PHP mail bridge email
The booking flow is already wired for transactional email. Verify these Supabase secrets are set:
- `RESEND_API_KEY`
- verified sending address/domain for `RESEND_FROM_EMAIL`
- `OWNER_EMAIL`

### Guest calendar
No Google API credentials are required. The website and confirmation email use an **Add to Google Calendar** link that opens the guest's own calendar with the stay dates prefilled.

### Production domain
- Set `PUBLIC_SITE_URL` in Supabase once the live domain is known.

## Hostinger

Upload the contents of the generated `dist/` directory to `public_html/`. No Node.js backend is needed on the Hostinger Premium plan.
