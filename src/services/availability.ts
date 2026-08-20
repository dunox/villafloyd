import type { AvailabilityBlock, AvailabilityResponse } from '../types';
import { getFunctionHeaders, getFunctionUrl } from './supabase';

const CACHE_TTL_MS = 30_000;
let cache: { data: AvailabilityBlock[]; expiresAt: number } | null = null;
let inFlight: Promise<AvailabilityBlock[]> | null = null;

function isAvailabilityBlock(value: unknown): value is AvailabilityBlock {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AvailabilityBlock>;
  return (
    typeof candidate.from === 'string' &&
    typeof candidate.to === 'string' &&
    (candidate.status === 'pending' || candidate.status === 'confirmed')
  );
}

export function invalidateAvailabilityCache() {
  cache = null;
  inFlight = null;
}

export async function getAvailability(force = false): Promise<AvailabilityBlock[]> {
  if (!force && cache && cache.expiresAt > Date.now()) return cache.data;
  if (!force && inFlight) return inFlight;

  inFlight = (async () => {
    const response = await fetch(getFunctionUrl('availability'), {
      method: 'GET',
      headers: getFunctionHeaders(),
      cache: 'no-store',
    });

    let body: AvailabilityResponse | { message?: string } | null = null;
    try {
      body = (await response.json()) as AvailabilityResponse | { message?: string };
    } catch {
      body = null;
    }

    if (!response.ok) {
      throw new Error(body && 'message' in body && body.message ? body.message : 'Live availability is temporarily unavailable.');
    }

    const booked = 'booked' in (body ?? {}) && Array.isArray((body as AvailabilityResponse).booked)
      ? (body as AvailabilityResponse).booked.filter(isAvailabilityBlock)
      : [];

    cache = { data: booked, expiresAt: Date.now() + CACHE_TTL_MS };
    return booked;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
