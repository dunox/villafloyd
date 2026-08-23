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
├── Hostinger PHP mail() — owner/guest emails
└── Google Calendar link — guest adds dates to their own calendar
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
- Guests get an **Add to Google Calendar** link for their own calendar
- Declined requests immediately release dates
- Hostinger PHP `mail()` bridge for owner review and guest status updates
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
Owner receives review email through Hostinger PHP mail
        ↓
Owner confirms
        ↓
status = CONFIRMED
        ↓
Guest receives confirmation email
        ↓
Guest may add the stay to their own Google Calendar
```

If the owner declines, the booking status becomes `declined` and the dates are released immediately.

If no action is taken before the hold expires, the pending request becomes `expired` when availability is next checked.

## Email delivery

No Resend account or API key is required. The production build contains `send-mail.php`, copied automatically from `public/send-mail.php`. Supabase Edge Functions call this PHP endpoint server-to-server and Hostinger sends the messages with PHP `mail()`.

Current sender and owner inbox are both `contact@dunoxstudio.com`, matching the working Dunox Studio Hostinger mail setup. Owner messages use the guest email as `Reply-To`, so replying from the inbox goes directly to the guest.

The PHP endpoint verifies the secure Supabase owner-review URL before sending mail, so it is not an open mail relay and no extra mail API secret is required.

Optional Supabase settings:

```env
PUBLIC_SITE_URL=https://your-live-domain.com
BOOKING_HOLD_HOURS=24
MAIL_BRIDGE_URL=https://dunoxstudio.com/villafloyd/send-mail.php
```

`MAIL_BRIDGE_URL` is optional because the current Dunox Studio Villa Floyd path is already used as a fallback. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase Edge Functions and must never be exposed to the browser.

Owner confirmation does not depend on Google Calendar credentials. Calendar links open the guest's own Google Calendar with the stay dates prefilled; editing that personal event never changes the booking record.

## Hostinger Premium deployment

Hostinger Premium serves the Vite output plus the small `send-mail.php` endpoint included in `dist/`.

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
