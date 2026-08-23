import { corsHeaders, getRequiredEnv, jsonResponse, sha256Hex } from '../_shared/http.ts';
import { sendGuestRequestReceived, sendOwnerBookingRequest } from '../_shared/email.ts';
import { getAdminClient } from '../_shared/supabase.ts';
import type { BookingRow } from '../_shared/types.ts';

interface BookingPayload {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  checkIn?: unknown;
  checkOut?: unknown;
  guests?: unknown;
  estimatedTotal?: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function parseDateOnly(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function randomHex(bytes = 4) {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(values)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function validatePayload(payload: BookingPayload) {
  const name = cleanString(payload.name, 120);
  const email = cleanString(payload.email, 254).toLowerCase();
  const phone = cleanString(payload.phone, 80);
  const message = cleanString(payload.message, 2000);
  const checkIn = cleanString(payload.checkIn, 10);
  const checkOut = cleanString(payload.checkOut, 10);
  const guests = Number(payload.guests);
  const estimatedTotal = Number(payload.estimatedTotal);
  const checkInDate = parseDateOnly(checkIn);
  const checkOutDate = parseDateOnly(checkOut);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (name.length < 2) return { error: 'Please enter your full name.' } as const;
  if (!EMAIL_PATTERN.test(email)) return { error: 'Please enter a valid email address.' } as const;
  if (!checkInDate || !checkOutDate) return { error: 'Please select valid stay dates.' } as const;
  if (checkInDate < today) return { error: 'Check-in cannot be in the past.' } as const;
  if (checkOutDate <= checkInDate) return { error: 'Check-out must be after check-in.' } as const;
  if (!Number.isInteger(guests) || guests < 1 || guests > 6) {
    return { error: 'Guest count must be between 1 and 6.' } as const;
  }
  if (!Number.isFinite(estimatedTotal) || estimatedTotal < 0) {
    return { error: 'The booking estimate is invalid.' } as const;
  }

  return {
    value: {
      name,
      email,
      phone,
      message,
      checkIn,
      checkOut,
      guests,
      estimatedTotal: Math.round(estimatedTotal * 100) / 100,
    },
  } as const;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return jsonResponse(request, { error: 'method_not_allowed' }, 405);

  try {
    const parsed = validatePayload((await request.json()) as BookingPayload);
    if ('error' in parsed) {
      return jsonResponse(request, { error: 'invalid_request', message: parsed.error }, 400);
    }

    const holdHours = Math.min(Math.max(Number(Deno.env.get('BOOKING_HOLD_HOURS') ?? 24), 1), 72);
    const holdExpiresAt = new Date(Date.now() + holdHours * 60 * 60 * 1000).toISOString();
    const reference = `VF-${parsed.value.checkIn.replaceAll('-', '')}-${randomHex(3).toUpperCase()}`;
    const ownerToken = randomToken();
    const ownerTokenHash = await sha256Hex(ownerToken);
    const supabase = getAdminClient();

    const { data, error } = await supabase.rpc('create_booking_request', {
      p_reference: reference,
      p_check_in: parsed.value.checkIn,
      p_check_out: parsed.value.checkOut,
      p_guests: parsed.value.guests,
      p_name: parsed.value.name,
      p_email: parsed.value.email,
      p_phone: parsed.value.phone,
      p_message: parsed.value.message,
      p_estimated_total: parsed.value.estimatedTotal,
      p_hold_expires_at: holdExpiresAt,
      p_owner_action_token_hash: ownerTokenHash,
    });

    if (error) {
      if (error.code === '23P01') {
        return jsonResponse(
          request,
          {
            error: 'dates_unavailable',
            message: 'These dates have just become unavailable. Please choose another stay.',
          },
          409,
        );
      }
      throw error;
    }

    const booking = (Array.isArray(data) ? data[0] : data) as BookingRow | undefined;
    if (!booking) throw new Error('Booking record was not returned by the database.');

    const functionsBase = `${getRequiredEnv('SUPABASE_URL').replace(/\/$/, '')}/functions/v1`;
    const reviewUrl = `${functionsBase}/booking-action?booking=${encodeURIComponent(booking.id)}&token=${encodeURIComponent(ownerToken)}`;

    let notificationStatus: 'sent' | 'failed' = 'failed';
    try {
      await sendOwnerBookingRequest(booking, reviewUrl);
      notificationStatus = 'sent';
      try {
        await sendGuestRequestReceived(booking, reviewUrl);
      } catch (emailError) {
        console.error('guest acknowledgement email failed', emailError);
      }
    } catch (emailError) {
      console.error('owner email failed; booking remains safely stored', emailError);
    }

    return jsonResponse(
      request,
      {
        ok: true,
        reference: booking.reference,
        holdExpiresAt: booking.hold_expires_at,
        status: 'pending',
        notificationStatus,
      },
      201,
      { 'Cache-Control': 'no-store' },
    );
  } catch (error) {
    console.error('create-booking error', error);
    return jsonResponse(
      request,
      { error: 'booking_failed', message: 'The booking request could not be sent. Please try again.' },
      500,
    );
  }
});
