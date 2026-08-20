import { escapeHtml, htmlResponse, sha256Hex } from '../_shared/http.ts';
import { sendGuestConfirmed, sendGuestDeclined } from '../_shared/email.ts';
import { createCalendarEvent, deleteCalendarEvent } from '../_shared/google-calendar.ts';
import { getAdminClient } from '../_shared/supabase.ts';
import type { BookingRow } from '../_shared/types.ts';

type BookingAction = 'confirm' | 'decline';

async function getAuthorizedBooking(bookingId: string, token: string) {
  if (!bookingId || !token) return null;
  const supabase = getAdminClient();
  await supabase.rpc('expire_stale_bookings');
  const tokenHash = await sha256Hex(token);
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('owner_action_token_hash', tokenHash)
    .maybeSingle();

  if (error) throw error;
  return data as BookingRow | null;
}

function page(booking: BookingRow, bookingId: string, token: string, notice = '') {
  const actionable = booking.status === 'pending';
  const statusLabel = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
  const noticeHtml = notice ? `<div class="notice">${escapeHtml(notice)}</div>` : '';
  const actions = actionable
    ? `<form method="post">
        <input type="hidden" name="booking" value="${escapeHtml(bookingId)}">
        <input type="hidden" name="token" value="${escapeHtml(token)}">
        <button class="confirm" name="action" value="confirm" type="submit">Confirm booking</button>
        <button class="decline" name="action" value="decline" type="submit">Decline request</button>
      </form>`
    : `<p class="done">No further action is required for this request.</p>`;

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Villa Floyd · ${escapeHtml(booking.reference)}</title><style>
    *{box-sizing:border-box}body{margin:0;background:#F4F6F6;color:#0D2B45;font-family:Arial,sans-serif}.wrap{width:min(680px,calc(100% - 32px));margin:48px auto}.card{overflow:hidden;border:1px solid rgba(90,125,154,.28);border-radius:28px;background:#F4F6F6;box-shadow:0 28px 80px rgba(13,43,69,.14)}header{padding:24px 28px;background:#0D2B45;color:#F4F6F6}.eyebrow{color:#8DBFB7;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}h1{margin:8px 0 0;font-size:32px;font-weight:500}.body{padding:28px}.status{display:inline-block;padding:7px 11px;border-radius:999px;background:#DCC7AA;color:#0D2B45;font-size:12px;font-weight:700;text-transform:uppercase}.grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:22px 0;background:rgba(90,125,154,.24);border:1px solid rgba(90,125,154,.24);border-radius:16px;overflow:hidden}.item{padding:15px;background:#F4F6F6}.item span{display:block;margin-bottom:5px;color:#5A7D9A;font-size:11px;font-weight:700;text-transform:uppercase}.item strong{font-size:14px}.message{padding:18px;border-radius:16px;background:rgba(220,199,170,.24);line-height:1.55}.notice{margin:0 0 18px;padding:13px 15px;border-radius:14px;background:rgba(141,191,183,.28);font-weight:700}form{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}button{min-height:50px;border-radius:999px;font:inherit;font-weight:700;cursor:pointer}.confirm{border:1px solid #0D2B45;background:#0D2B45;color:#F4F6F6}.decline{border:1px solid #5A7D9A;background:transparent;color:#0D2B45}.done{margin:22px 0 0;color:#5A7D9A}.foot{margin-top:18px;color:#5A7D9A;font-size:12px}@media(max-width:520px){.wrap{margin:20px auto}.grid,form{grid-template-columns:1fr}h1{font-size:27px}}
  </style></head><body><main class="wrap"><section class="card"><header><div class="eyebrow">Villa Floyd · owner review</div><h1>${escapeHtml(booking.reference)}</h1></header><div class="body">${noticeHtml}<span class="status">${escapeHtml(statusLabel)}</span><div class="grid"><div class="item"><span>Stay</span><strong>${escapeHtml(booking.check_in)} → ${escapeHtml(booking.check_out)}</strong></div><div class="item"><span>Guests</span><strong>${booking.guests}</strong></div><div class="item"><span>Guest</span><strong>${escapeHtml(booking.name)}</strong></div><div class="item"><span>Email</span><strong>${escapeHtml(booking.email)}</strong></div><div class="item"><span>Phone</span><strong>${escapeHtml(booking.phone || 'Not provided')}</strong></div><div class="item"><span>Estimate</span><strong>€${Number(booking.estimated_total).toFixed(0)}</strong></div></div><div class="message"><strong>Guest message</strong><br>${escapeHtml(booking.message || 'No message')}</div>${actions}<p class="foot">Confirming creates the stay in the Villa Floyd owner calendar. Declining immediately releases the dates on the website.</p></div></section></main></body></html>`;
}

Deno.serve(async (request) => {
  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const bookingId = url.searchParams.get('booking') ?? '';
      const token = url.searchParams.get('token') ?? '';
      const booking = await getAuthorizedBooking(bookingId, token);
      if (!booking) return htmlResponse('<h1>Invalid or expired booking review link.</h1>', 403);
      return htmlResponse(page(booking, bookingId, token));
    }

    if (request.method !== 'POST') return htmlResponse('<h1>Method not allowed.</h1>', 405);

    const form = await request.formData();
    const bookingId = String(form.get('booking') ?? '');
    const token = String(form.get('token') ?? '');
    const action = String(form.get('action') ?? '') as BookingAction;
    if (action !== 'confirm' && action !== 'decline') {
      return htmlResponse('<h1>Invalid action.</h1>', 400);
    }

    const booking = await getAuthorizedBooking(bookingId, token);
    if (!booking) return htmlResponse('<h1>Invalid or expired booking review link.</h1>', 403);
    if (booking.status !== 'pending') {
      return htmlResponse(page(booking, bookingId, token, `This request is already ${booking.status}.`));
    }

    const supabase = getAdminClient();

    if (action === 'decline') {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'declined', hold_expires_at: null })
        .eq('id', booking.id)
        .eq('status', 'pending')
        .select('*')
        .single();
      if (error) throw error;

      const updated = data as BookingRow;
      try {
        await sendGuestDeclined(updated);
      } catch (emailError) {
        console.error('decline email failed', emailError);
      }
      return htmlResponse(
        page(updated, bookingId, token, 'Request declined. The dates are available again on the website.'),
      );
    }

    let calendarEventId = '';
    try {
      calendarEventId = await createCalendarEvent(booking);
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          hold_expires_at: null,
          google_calendar_event_id: calendarEventId,
        })
        .eq('id', booking.id)
        .eq('status', 'pending')
        .select('*')
        .single();
      if (error) throw error;

      const updated = data as BookingRow;
      try {
        await sendGuestConfirmed(updated);
      } catch (emailError) {
        console.error('confirmation email failed', emailError);
      }

      return htmlResponse(
        page(
          updated,
          bookingId,
          token,
          'Booking confirmed. The owner calendar has been updated and the dates remain blocked on the website.',
        ),
      );
    } catch (error) {
      if (calendarEventId) {
        try {
          await deleteCalendarEvent(calendarEventId);
        } catch (cleanupError) {
          console.error('calendar cleanup failed', cleanupError);
        }
      }
      console.error('confirm booking failed', error);
      return htmlResponse(
        page(
          booking,
          bookingId,
          token,
          error instanceof Error ? error.message : 'The booking could not be confirmed.',
        ),
        502,
      );
    }
  } catch (error) {
    console.error('booking-action error', error);
    return htmlResponse(
      '<h1>Villa Floyd booking action failed.</h1><p>Please retry the original review link.</p>',
      500,
    );
  }
});
