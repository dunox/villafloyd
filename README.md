# Villa Floyd — React + TypeScript

Premium responsive rental website for Villa Floyd. The project uses React 18, TypeScript, Vite and SCSS Modules. Reusable UI elements and page components are isolated in their own folders.

## Current production architecture

```text
Hostinger Premium
└── React / Vite static build
        ↓ HTTPS
Supabase
├── PostgreSQL — booking source of truth
└── Edge Functions — availability + booking actions
        ↓
├── Resend — owner/guest emails
└── Google Calendar — confirmed stays for the owner
```

The website does **not** use Airbnb, Booking.com, iCal or any external booking marketplace. Dates are blocked only from direct requests created on this website.

## Implemented

- Premium responsive Villa Floyd UI
- Mobile stacked amenity cards using native `position: sticky`
- Reversible stack behaviour while scrolling down/up
- Desktop/tablet Amenities entrance animation preserved
- Live availability loaded asynchronously from Supabase
- No mocked `blockedDates` in the frontend
- Correct accommodation date semantics: `[checkIn, checkOut)`
- Adjacent stays are allowed (one guest may check out the day another checks in)
- PostgreSQL exclusion constraint prevents overlapping active bookings
- Booking request form writes real records to Supabase
- Pending booking requests immediately hold/block the selected dates
- Pending holds expire automatically (default 24 hours, lazily cleaned on API access)
- Custom form validation instead of browser `Please fill out this field` popups
- Real booking reference shown after submission
- Owner review Edge Function with explicit Confirm / Decline actions
- Confirmed bookings can create an all-day Google Calendar event
- Declined requests immediately release dates
- Resend email templates for owner review and guest status updates
- Production Vite build fixed and verified

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Frontend environment

The React client uses only public Supabase values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-jwt
```

`.env.production` in this project is already connected to the deployed **VillaFloyd Project**. The anon key is a browser-safe public key; never place a Supabase service-role key in Vite variables.

## Supabase backend

Backend source is included in:

```text
supabase/
├── config.toml
├── migrations/
└── functions/
    ├── availability/
    ├── create-booking/
    ├── booking-action/
    └── _shared/
```

The live Supabase project already has:

- `bookings` table
- RLS enabled with no public table policies
- non-overlap database constraint
- stale-hold cleanup function
- protected booking creation RPC
- `availability` Edge Function
- `create-booking` Edge Function
- `booking-action` Edge Function

## Booking lifecycle

```text
Guest selects available dates
        ↓
POST create-booking
        ↓
Database creates PENDING booking
        ↓
Dates become unavailable on website immediately
        ↓
Owner receives review email (after Resend setup)
        ↓
Owner confirms
        ↓
status = CONFIRMED
        ↓
Google Calendar event is created
        ↓
Guest receives confirmation email
```

If the owner declines, the booking status becomes `declined` and the dates are released immediately.

If no action is taken before the hold expires, the pending request becomes `expired` when availability is next checked.

## Supabase Edge Function secrets still required for full owner workflow

Set these in the Supabase project secrets before launch:

```env
PUBLIC_SITE_URL=https://your-live-domain.com
BOOKING_HOLD_HOURS=24

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Villa Floyd <bookings@your-domain.com>
OWNER_EMAIL=owner@example.com

GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=...
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase Edge Functions and must never be exposed to the browser.

### Behaviour before email/calendar secrets are configured

Core website booking already works: the request is stored in PostgreSQL and the dates are held in the live availability calendar. Email notifications are skipped until Resend is configured.

Owner confirmation requires Google Calendar credentials because the confirmation action is intentionally designed to create the owner calendar event atomically with confirmation.

## Recommended owner calendar setup

Use a separate Google Calendar named:

```text
Villa Floyd — Bookings
```

Create a Google Cloud service account, enable the Google Calendar API, and share only this secondary calendar with the service-account email using permission **Make changes to events**. Put its calendar ID, service account email and private key into Supabase secrets.

This keeps the owner's personal calendar private while giving the booking backend access only to the villa calendar.

## Resend setup

Use Resend for transactional messages. Before launch, verify the villa's sending domain and set `RESEND_FROM_EMAIL` to an address on that domain. `OWNER_EMAIL` is the address that receives new booking requests and secure review links.

## Hostinger Premium deployment

Hostinger Premium only needs to serve the static Vite output.

1. Run `npm run build`.
2. Open Hostinger File Manager.
3. Upload the **contents** of `dist/` into `public_html/`.
4. Point the domain to that hosting account as usual.

No Node.js process is required on Hostinger. The backend remains on Supabase.

## Relevant frontend files

```text
src/components/Amenities/
src/components/BookingCalendar/
src/components/BookingPanel/
src/services/availability.ts
src/services/booking.ts
src/services/supabase.ts
src/ui/Input/
src/types/index.ts
```

## Visual palette

Only the existing Villa Floyd palette is used:

- Deep Sea `#0D2B45`
- Ocean Mist `#5A7D9A`
- Seafoam `#8DBFB7`
- Sandy Shore `#DCC7AA`
- Salt Air `#F4F6F6`
