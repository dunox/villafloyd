import { escapeHtml, getRequiredEnv } from './http.ts';
import type { BookingRow } from './types.ts';

export function isEmailConfigured() {
  return Boolean(
    Deno.env.get('RESEND_API_KEY')?.trim() &&
      Deno.env.get('RESEND_FROM_EMAIL')?.trim() &&
      Deno.env.get('OWNER_EMAIL')?.trim(),
  );
}

async function sendEmail(payload: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getRequiredEnv('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getRequiredEnv('RESEND_FROM_EMAIL'),
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email provider error (${response.status}): ${await response.text()}`);
  }
}

function shell(content: string) {
  return `<!doctype html><html><body style="margin:0;background:#F4F6F6;color:#0D2B45;font-family:Arial,sans-serif"><div style="max-width:640px;margin:auto;padding:32px 18px"><div style="border-radius:24px;overflow:hidden;border:1px solid rgba(90,125,154,.28)"><div style="padding:24px 28px;background:#0D2B45;color:#F4F6F6"><b>Villa Floyd · direct booking</b></div><div style="padding:28px">${content}</div></div></div></body></html>`;
}

function details(booking: BookingRow) {
  return `<div style="margin:22px 0;padding:18px;border-radius:16px;background:#DCC7AA33"><div><strong>Stay:</strong> ${escapeHtml(booking.check_in)} → ${escapeHtml(booking.check_out)}</div><div><strong>Guests:</strong> ${booking.guests}</div><div><strong>Reference:</strong> ${escapeHtml(booking.reference)}</div><div><strong>Estimate:</strong> €${Number(booking.estimated_total).toFixed(0)}</div></div>`;
}

export async function sendOwnerBookingRequest(booking: BookingRow, reviewUrl: string) {
  await sendEmail({
    to: getRequiredEnv('OWNER_EMAIL'),
    replyTo: booking.email,
    subject: `Villa Floyd request ${booking.reference} · ${booking.check_in}–${booking.check_out}`,
    html: shell(`<h1>New booking request</h1><p>The dates are temporarily held while you review this request.</p>${details(booking)}<p><strong>Guest:</strong> ${escapeHtml(booking.name)}<br><strong>Email:</strong> ${escapeHtml(booking.email)}<br><strong>Phone:</strong> ${escapeHtml(booking.phone || 'Not provided')}<br><strong>Message:</strong> ${escapeHtml(booking.message || 'No message')}</p><p><a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#0D2B45;color:#F4F6F6;text-decoration:none;font-weight:700">Review request</a></p><p>Opening the link does not confirm or decline anything. A second explicit action is required.</p>`),
  });
}

export async function sendGuestRequestReceived(booking: BookingRow) {
  await sendEmail({
    to: booking.email,
    subject: `Villa Floyd request received · ${booking.reference}`,
    html: shell(`<h1>We received your request</h1><p>Thank you, ${escapeHtml(booking.name)}. Your dates are temporarily held while the owner reviews the request.</p>${details(booking)}<p>You will receive another email when the request is confirmed or declined. No payment has been taken.</p>`),
  });
}

export async function sendGuestConfirmed(booking: BookingRow) {
  await sendEmail({
    to: booking.email,
    subject: `Villa Floyd booking confirmed · ${booking.reference}`,
    html: shell(`<h1>Your stay is confirmed</h1><p>We’re looking forward to welcoming you to Villa Floyd.</p>${details(booking)}<p>The owner will contact you directly with the next practical details for your stay.</p>`),
  });
}

export async function sendGuestDeclined(booking: BookingRow) {
  await sendEmail({
    to: booking.email,
    subject: `Villa Floyd booking request update · ${booking.reference}`,
    html: shell(`<h1>Booking request update</h1><p>The requested stay could not be confirmed. The temporary hold has been released.</p>${details(booking)}<p>You can return to the Villa Floyd website and choose another available stay.</p>`),
  });
}
