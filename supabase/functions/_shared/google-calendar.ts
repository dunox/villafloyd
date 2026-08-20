import { getRequiredEnv } from './http.ts';
import type { BookingRow } from './types.ts';

function base64UrlBytes(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function base64UrlJson(value: unknown) {
  return base64UrlBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToBytes(pem: string) {
  const body = pem
    .replaceAll('\\n', '\n')
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const binary = atob(body);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getGoogleAccessToken() {
  const serviceAccountEmail = getRequiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = getRequiredEnv('GOOGLE_PRIVATE_KEY');
  getRequiredEnv('GOOGLE_CALENDAR_ID');

  const now = Math.floor(Date.now() / 1000);
  const encodedHeader = base64UrlJson({ alg: 'RS256', typ: 'JWT' });
  const encodedClaims = base64UrlJson({
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/calendar.events',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
  const unsigned = `${encodedHeader}.${encodedClaims}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBytes(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${base64UrlBytes(new Uint8Array(signature))}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const tokenBody = (await tokenResponse.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenBody.access_token) {
    throw new Error(tokenBody.error_description || 'Google Calendar authentication failed.');
  }

  return tokenBody.access_token;
}

export async function createCalendarEvent(booking: BookingRow) {
  const accessToken = await getGoogleAccessToken();
  const calendarId = getRequiredEnv('GOOGLE_CALENDAR_ID');
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `Villa Floyd · ${booking.name} · ${booking.reference}`,
        description: `Villa Floyd direct booking\nReference: ${booking.reference}\nGuest: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone || 'Not provided'}\nGuests: ${booking.guests}\nEstimate: €${Number(booking.estimated_total).toFixed(0)}\nMessage: ${booking.message || 'No message'}`,
        start: { date: booking.check_in },
        end: { date: booking.check_out },
        transparency: 'opaque',
      }),
    },
  );

  const body = (await response.json()) as { id?: string; error?: { message?: string } };
  if (!response.ok || !body.id) {
    throw new Error(body.error?.message || 'The owner Google Calendar could not be updated.');
  }
  return body.id;
}

export async function deleteCalendarEvent(eventId: string) {
  const accessToken = await getGoogleAccessToken();
  const calendarId = getRequiredEnv('GOOGLE_CALENDAR_ID');
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error('Could not clean up the Google Calendar event.');
  }
}
