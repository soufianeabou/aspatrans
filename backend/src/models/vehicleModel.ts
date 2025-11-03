import { query } from '../db';

export interface Vehicle {
  id: number;
  company_id: number;
  plate_number: string;
  model: string;
  capacity: number;
  status: string;
  last_maintenance: string | null;
  created_at: string;
}

export async function getVehiclesByCompany(company_id: number): Promise<Vehicle[]> {
  // Get all vehicles for the company (including all statuses)
  const { rows } = await query<Vehicle>(
    'SELECT * FROM vehicles WHERE company_id = $1 ORDER BY model',
    [company_id]
  );
  return rows.map((v: any) => ({
    ...v,
    id: Number(v.id),
    company_id: Number(v.company_id),
    capacity: Number(v.capacity),
  })) as Vehicle[];
}

export async function getVehicleById(id: number): Promise<Vehicle | null> {
  const { rows } = await query<any>('SELECT * FROM vehicles WHERE id = $1', [id]);
  if (!rows[0]) return null;
  
  // Ensure all numeric fields are numbers (PostgreSQL returns them as strings)
  return {
    ...rows[0],
    id: Number(rows[0].id),
    company_id: Number(rows[0].company_id),
    capacity: Number(rows[0].capacity),
  } as Vehicle;
}

export async function createVehicle(params: {
  company_id: number;
  plate_number: string;
  model: string;
  capacity: number;
  status?: string;
}): Promise<Vehicle> {
  const { rows } = await query<Vehicle>(
    'INSERT INTO vehicles (company_id, plate_number, model, capacity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [params.company_id, params.plate_number, params.model, params.capacity, params.status || 'pending']
  );
  return {
    ...rows[0],
    id: Number(rows[0].id),
    company_id: Number(rows[0].company_id),
    capacity: Number(rows[0].capacity),
  } as Vehicle;
}

export async function updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.plate_number !== undefined) {
    fields.push(`plate_number = $${paramIndex++}`);
    values.push(updates.plate_number);
  }
  if (updates.model !== undefined) {
    fields.push(`model = $${paramIndex++}`);
    values.push(updates.model);
  }
  if (updates.capacity !== undefined) {
    fields.push(`capacity = $${paramIndex++}`);
    values.push(updates.capacity);
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.last_maintenance !== undefined) {
    fields.push(`last_maintenance = $${paramIndex++}`);
    values.push(updates.last_maintenance);
  }

  if (fields.length === 0) {
    return getVehicleById(id);
  }

  values.push(id);
  const { rows } = await query<Vehicle>(
    `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  
  if (!rows[0]) return null;
  return {
    ...rows[0],
    id: Number(rows[0].id),
    company_id: Number(rows[0].company_id),
    capacity: Number(rows[0].capacity),
  } as Vehicle;
}

