import { query } from '../db';

export interface TransportCompany {
  id: number;
  name: string;
  owner_id: number;
  contact_phone: string | null;
  vehicles_count: number;
  status: string;
  created_at: string;
}

export async function getAllCompanies(): Promise<TransportCompany[]> {
  const { rows } = await query<TransportCompany>('SELECT * FROM transport_companies WHERE status = $1 ORDER BY name', ['active']);
  return rows;
}

export async function getCompanyByOwnerId(owner_id: number): Promise<TransportCompany | null> {
  const { rows } = await query<any>(
    'SELECT * FROM transport_companies WHERE owner_id = $1 LIMIT 1',
    [owner_id]
  );
  if (!rows[0]) return null;
  // Ensure all numeric fields are numbers (PostgreSQL returns them as strings)
  return {
    ...rows[0],
    id: Number(rows[0].id),
    owner_id: Number(rows[0].owner_id),
    vehicles_count: Number(rows[0].vehicles_count),
  } as TransportCompany;
}

export async function getCompanyById(id: number): Promise<TransportCompany | null> {
  const { rows } = await query<TransportCompany>('SELECT * FROM transport_companies WHERE id = $1', [id]);
  return rows[0] || null;
}

