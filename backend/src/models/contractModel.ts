import { query } from '../db';

export interface Contract {
  id: number;
  request_id: number;
  company_id: number;
  driver_id: number;
  vehicle_id: number;
  price: number;
  admin_notes: string | null;
  status: string;
  created_at: string;
}

export async function createContract(params: {
  request_id: number;
  company_id: number;
  driver_id: number;
  vehicle_id: number;
  price: number;
  admin_notes?: string | null;
}): Promise<Contract> {
  const { rows } = await query<Contract>(
    'INSERT INTO contracts (request_id, company_id, driver_id, vehicle_id, price, admin_notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [params.request_id, params.company_id, params.driver_id, params.vehicle_id, params.price, params.admin_notes ?? null]
  );
  return rows[0];
}

export async function getPendingContracts(): Promise<Contract[]> {
  const { rows } = await query<Contract>(
    `SELECT c.*, 
            br.pickup_location, br.destination, br.employees_count, br.frequency,
            tc.name as company_name,
            u.full_name as driver_name
     FROM contracts c
     JOIN business_requests br ON c.request_id = br.id
     JOIN transport_companies tc ON c.company_id = tc.id
     JOIN drivers d ON c.driver_id = d.id
     JOIN users u ON d.user_id = u.id
     WHERE c.status = $1
     ORDER BY c.created_at DESC`,
    ['pending']
  );
  return rows;
}

export async function getContractsByBusiness(business_id: number): Promise<any[]> {
  const { rows } = await query(
    `SELECT c.*, 
            br.pickup_location, br.destination, br.employees_count, br.frequency, br.start_date, br.end_date,
            tc.name as company_name, tc.contact_phone as company_phone,
            u.full_name as driver_name, u.phone as driver_phone,
            v.model as vehicle_model, v.plate_number as vehicle_plate
     FROM contracts c
     JOIN business_requests br ON c.request_id = br.id
     JOIN transport_companies tc ON c.company_id = tc.id
     JOIN drivers d ON c.driver_id = d.id
     JOIN users u ON d.user_id = u.id
     JOIN vehicles v ON c.vehicle_id = v.id
     WHERE br.business_id = $1
     ORDER BY c.created_at DESC`,
    [business_id]
  );
  return rows;
}

export async function getContractDetails(id: number): Promise<any | null> {
  const { rows } = await query(
    `SELECT c.*, 
            br.*, br.id as request_id,
            tc.name as company_name, tc.contact_phone as company_phone,
            u.full_name as driver_name, u.phone as driver_phone, u.email as driver_email,
            v.model as vehicle_model, v.plate_number as vehicle_plate, v.capacity as vehicle_capacity
     FROM contracts c
     JOIN business_requests br ON c.request_id = br.id
     JOIN transport_companies tc ON c.company_id = tc.id
     JOIN drivers d ON c.driver_id = d.id
     JOIN users u ON d.user_id = u.id
     JOIN vehicles v ON c.vehicle_id = v.id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function updateContractStatus(id: number, status: string): Promise<Contract | null> {
  const { rows } = await query<Contract>(
    'UPDATE contracts SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0] || null;
}

export async function getContractById(id: number): Promise<Contract | null> {
  const { rows } = await query<Contract>('SELECT * FROM contracts WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getAllRequests(status?: string): Promise<any[]> {
  let queryText = `
    SELECT br.*, u.full_name as business_name, u.company_name
    FROM business_requests br
    JOIN users u ON br.business_id = u.id
  `;
  const params: any[] = [];
  
  if (status) {
    queryText += ' WHERE br.status = $1';
    params.push(status);
  }
  
  queryText += ' ORDER BY br.created_at DESC';
  
  const { rows } = await query(queryText, params);
  return rows;
}

