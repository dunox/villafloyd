export interface GoogleCalendarEventInput {
  checkIn: string;
  checkOut: string;
  reference?: string;
  guests?: number;
  confirmed?: boolean;
}

function compactDate(value: string) {
  return value.replace(/-/g, '');
}

export function buildGuestGoogleCalendarUrl({
  checkIn,
  checkOut,
  reference,
  guests,
  confirmed = false,
}: GoogleCalendarEventInput) {
  const title = confirmed ? 'Villa Floyd stay' : 'Villa Floyd · booking request';
  const statusLine = confirmed
    ? 'Your Villa Floyd stay is confirmed.'
    : 'These dates are requested and awaiting owner confirmation.';
  const details = [
    statusLine,
    reference ? `Booking reference: ${reference}` : '',
    guests ? `Guests: ${guests}` : '',
    'Changing or deleting this calendar event does not change the booking.',
  ].filter(Boolean).join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${compactDate(checkIn)}/${compactDate(checkOut)}`,
    details,
    location: 'Villa Floyd',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
