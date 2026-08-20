export interface BookingRow {
  id: string;
  reference: string;
  check_in: string;
  check_out: string;
  guests: number;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  estimated_total: number | string;
  status: 'pending' | 'confirmed' | 'declined' | 'expired' | 'cancelled';
  hold_expires_at: string | null;
  owner_action_token_hash: string;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}
