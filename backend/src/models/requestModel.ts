import { query } from '../db';

export type RequestStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface BusinessRequest {
  id: number;
  business_id: number;
  pickup_location: string;
  destination: string;
  employees_count: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
  special_notes: string | null;
  status: RequestStatus;
  created_at: string;
}

export async function createRequest(params: {
  business_id: number;
  pickup_location: string;
  destination: string;
  employees_count: number;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  special_notes?: string | null;
}): Promise<BusinessRequest> {
  const { rows } = await query<BusinessRequest>(
    'INSERT INTO business_requests (business_id, pickup_location, destination, employees_count, frequency, start_date, end_date, special_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [params.business_id, params.pickup_location, params.destination, params.employees_count, params.frequency, params.start_date, params.end_date ?? null, params.special_notes ?? null]
  );
  return rows[0];
}

export async function getRequestsByBusiness(business_id: number): Promise<BusinessRequest[]> {
  const { rows } = await query<BusinessRequest>('SELECT * FROM business_requests WHERE business_id = $1 ORDER BY created_at DESC', [business_id]);
  return rows;
}

export async function getRequestById(id: number): Promise<BusinessRequest | null> {
  const { rows } = await query<BusinessRequest>('SELECT * FROM business_requests WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function updateRequest(id: number, updates: {
  pickup_location?: string;
  destination?: string;
  employees_count?: number;
  frequency?: string;
  start_date?: string;
  end_date?: string | null;
  special_notes?: string | null;
  status?: RequestStatus;
}): Promise<BusinessRequest | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  Object.entries(updates).forEach(([k, v]) => {
    if (v !== undefined) {
      fields.push(`${k} = $${idx}`);
      values.push(v);
      idx++;
    }
  });

  if (fields.length === 0) return await getRequestById(id);

  values.push(id);
  const { rows } = await query<BusinessRequest>(`UPDATE business_requests SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
  return rows[0] || null;
}

export async function deleteRequest(id: number): Promise<boolean> {
  const { rows } = await query<{ id: number }>('DELETE FROM business_requests WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

