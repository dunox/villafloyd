import { corsHeaders, jsonResponse } from '../_shared/http.ts';
import { getAdminClient } from '../_shared/supabase.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'GET') return jsonResponse(request, { error: 'method_not_allowed' }, 405);

  try {
    const supabase = getAdminClient();
    const { error: expireError } = await supabase.rpc('expire_stale_bookings');
    if (expireError) throw expireError;

    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('bookings')
      .select('check_in,check_out,status')
      .in('status', ['pending', 'confirmed'])
      .gte('check_out', today)
      .order('check_in', { ascending: true });

    if (error) throw error;

    return jsonResponse(
      request,
      {
        booked: (data ?? []).map((row) => ({
          from: row.check_in,
          to: row.check_out,
          status: row.status,
        })),
        generatedAt: new Date().toISOString(),
      },
      200,
      { 'Cache-Control': 'no-store' },
    );
  } catch (error) {
    console.error('availability error', error);
    return jsonResponse(
      request,
      { error: 'availability_unavailable', message: 'Live availability is temporarily unavailable.' },
      503,
    );
  }
});
