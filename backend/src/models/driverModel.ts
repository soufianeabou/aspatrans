import { query } from '../db';

export interface Driver {
  id: number;
  company_id: number;
  user_id: number;
  license_number: string;
  availability_status: string;
  created_at: string;
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const { rows } = await query<Driver>(
    `SELECT d.*, u.full_name, u.phone 
     FROM drivers d 
     JOIN users u ON d.user_id = u.id 
     WHERE d.availability_status = $1 
     ORDER BY u.full_name`,
    ['active']
  );
  return rows;
}

export async function getDriverById(id: number): Promise<Driver | null> {
  const { rows } = await query<Driver>('SELECT * FROM drivers WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getDriverByUserId(user_id: number): Promise<Driver | null> {
  const { rows } = await query<Driver>(
    `SELECT d.*, u.full_name, u.phone 
     FROM drivers d 
     JOIN users u ON d.user_id = u.id 
     WHERE d.user_id = $1`,
    [user_id]
  );
  return rows[0] || null;
}

export async function getAllDrivers(): Promise<any[]> {
  const { rows } = await query(
    `SELECT d.*, u.full_name, u.phone 
     FROM drivers d 
     JOIN users u ON d.user_id = u.id 
     ORDER BY u.full_name`
  );
  return rows;
}

export async function getDriversByCompany(company_id: number): Promise<any[]> {
  const { rows } = await query(
    `SELECT d.*, u.full_name, u.phone, u.email
     FROM drivers d 
     JOIN users u ON d.user_id = u.id 
     WHERE d.company_id = $1
     ORDER BY u.full_name`,
    [company_id]
  );
  return rows;
}

export async function createDriver(params: {
  company_id: number;
  user_id: number;
  license_number: string;
  availability_status?: string;
}): Promise<Driver> {
  const { rows } = await query<Driver>(
    'INSERT INTO drivers (company_id, user_id, license_number, availability_status) VALUES ($1, $2, $3, $4) RETURNING *',
    [params.company_id, params.user_id, params.license_number, params.availability_status || 'pending']
  );
  return rows[0];
}

