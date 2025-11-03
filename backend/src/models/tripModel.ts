import { query } from '../db';

export type TripStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Trip {
  id: number;
  contract_id: number;
  driver_id: number;
  scheduled_datetime: string;
  actual_start: string | null;
  actual_end: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  status: TripStatus;
  created_at: string;
}

export async function getTripsByDriver(driver_id: number): Promise<any[]> {
  const { rows } = await query(
    `SELECT t.*, 
            c.price, c.admin_notes,
            br.pickup_location, br.destination, br.employees_count, br.frequency,
            u.full_name as business_name, u.phone as business_phone,
            tc.name as company_name,
            v.model as vehicle_model, v.plate_number as vehicle_plate
     FROM trips t
     JOIN contracts c ON t.contract_id = c.id
     JOIN business_requests br ON c.request_id = br.id
     JOIN users u ON br.business_id = u.id
     JOIN transport_companies tc ON c.company_id = tc.id
     JOIN vehicles v ON c.vehicle_id = v.id
     WHERE t.driver_id = $1
     ORDER BY t.scheduled_datetime DESC`,
    [driver_id]
  );
  return rows;
}

export async function getTripById(id: number): Promise<Trip | null> {
  const { rows } = await query<Trip>('SELECT * FROM trips WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createTrip(params: {
  contract_id: number;
  driver_id: number;
  scheduled_datetime: string;
}): Promise<Trip> {
  const { rows } = await query<Trip>(
    'INSERT INTO trips (contract_id, driver_id, scheduled_datetime) VALUES ($1, $2, $3) RETURNING *',
    [params.contract_id, params.driver_id, params.scheduled_datetime]
  );
  return rows[0];
}

export async function updateTripStart(id: number, lat: number, lng: number): Promise<Trip | null> {
  const { rows } = await query<Trip>(
    'UPDATE trips SET status = $1, actual_start = NOW(), pickup_lat = $2, pickup_lng = $3 WHERE id = $4 RETURNING *',
    ['active', lat, lng, id]
  );
  return rows[0] || null;
}

export async function updateTripEnd(id: number, lat: number, lng: number): Promise<Trip | null> {
  const { rows } = await query<Trip>(
    'UPDATE trips SET status = $1, actual_end = NOW(), destination_lat = $2, destination_lng = $3 WHERE id = $4 RETURNING *',
    ['completed', lat, lng, id]
  );
  return rows[0] || null;
}

