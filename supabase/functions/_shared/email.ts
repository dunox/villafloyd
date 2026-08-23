import type { BookingRow } from './types.ts';

const MAIL_BRIDGE_URL =
  Deno.env.get('MAIL_BRIDGE_URL')?.trim() ||
  'https://dunoxstudio.com/villafloyd/send-mail.php';

type MailKind = 'owner_request' | 'guest_received' | 'guest_confirmed' | 'guest_declined';

function guestGoogleCalendarUrl(booking: BookingRow, confirmed: boolean) {
  const compactDate = (value: string) => value.replace(/-/g, '');
  const title = confirmed ? 'Villa Floyd stay' : 'Villa Floyd · booking request';
  const statusLine = confirmed
    ? 'Your Villa Floyd stay is confirmed.'
    : 'These dates are requested and awaiting owner confirmation.';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${compactDate(booking.check_in)}/${compactDate(booking.check_out)}`,
    details: [
      statusLine,
      `Booking reference: ${booking.reference}`,
      `Guests: ${booking.guests}`,
      'Changing or deleting this calendar event does not change the booking.',
    ].join('\n'),
    location: 'Villa Floyd',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function postMail(
  kind: MailKind,
  booking: BookingRow,
  reviewUrl: string,
  extra: { calendarUrl?: string } = {},
) {
  const response = await fetch(MAIL_BRIDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kind,
      reference: booking.reference,
      name: booking.name,
      email: booking.email,
      phone: booking.phone ?? '',
      message: booking.message ?? '',
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      guests: booking.guests,
      estimatedTotal: Number(booking.estimated_total),
      reviewUrl,
      ...extra,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Villa Floyd PHP mail bridge failed (${response.status}): ${message.slice(0, 500)}`);
  }
}

export async function sendOwnerBookingRequest(booking: BookingRow, reviewUrl: string) {
  await postMail('owner_request', booking, reviewUrl);
}

export async function sendGuestRequestReceived(booking: BookingRow, reviewUrl: string) {
  await postMail('guest_received', booking, reviewUrl, {
    calendarUrl: guestGoogleCalendarUrl(booking, false),
  });
}

export async function sendGuestConfirmed(booking: BookingRow, reviewUrl: string) {
  await postMail('guest_confirmed', booking, reviewUrl, {
    calendarUrl: guestGoogleCalendarUrl(booking, true),
  });
}

export async function sendGuestDeclined(booking: BookingRow, reviewUrl: string) {
  await postMail('guest_declined', booking, reviewUrl);
}
