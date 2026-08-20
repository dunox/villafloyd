import { getFunctionHeaders, getFunctionUrl } from './supabase';

export interface BookingRequestPayload {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  estimatedTotal: number;
}

export interface BookingRequestResult {
  ok: boolean;
  reference: string;
  holdExpiresAt?: string;
  status?: 'pending';
}

interface BookingErrorBody {
  error?: string;
  message?: string;
}

export class BookingRequestError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'BookingRequestError';
    this.status = status;
    this.code = code;
  }
}

export async function submitBookingRequest(payload: BookingRequestPayload): Promise<BookingRequestResult> {
  const response = await fetch(getFunctionUrl('create-booking'), {
    method: 'POST',
    headers: getFunctionHeaders(),
    body: JSON.stringify(payload),
  });

  let body: BookingRequestResult | BookingErrorBody | null = null;
  try {
    body = (await response.json()) as BookingRequestResult | BookingErrorBody;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorBody = body as BookingErrorBody | null;
    throw new BookingRequestError(
      errorBody?.message ?? 'The booking request could not be sent. Please try again.',
      response.status,
      errorBody?.error,
    );
  }

  const result = body as BookingRequestResult | null;
  if (!result?.ok || !result.reference) {
    throw new BookingRequestError('The booking request returned an invalid response. Please try again.', 502);
  }

  return result;
}
