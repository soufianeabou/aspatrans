import bcrypt from 'bcryptjs';
import { query } from '../db';

export type UserRole = 'business' | 'admin' | 'driver' | 'transport_company';

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  company_name: string | null;
  created_at: string;
}

export async function findByEmail(email: string): Promise<User | null> {
  const { rows } = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function findById(id: number): Promise<Omit<User, 'password'> | null> {
  const { rows } = await query<Omit<User, 'password'>>('SELECT id, email, role, full_name, phone, company_name, created_at FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createUser(params: { email: string; password: string; role: UserRole; full_name: string; phone?: string | null; company_name?: string | null; }): Promise<Omit<User, 'password'>> {
  const hashed = await bcrypt.hash(params.password, 10);
  const { rows } = await query<Omit<User, 'password'>>(
    'INSERT INTO users (email, password, role, full_name, phone, company_name) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, role, full_name, phone, company_name, created_at',
    [params.email, hashed, params.role, params.full_name, params.phone || null, params.company_name || null]
  );
  return rows[0];
}

export async function updateUserProfile(id: number, updates: { full_name?: string; phone?: string | null; company_name?: string | null; }): Promise<Omit<User, 'password'> | null> {
  const { full_name, phone, company_name } = updates;
  const { rows } = await query<Omit<User, 'password'>>(
    'UPDATE users SET full_name = COALESCE($2, full_name), phone = COALESCE($3, phone), company_name = COALESCE($4, company_name) WHERE id = $1 RETURNING id, email, role, full_name, phone, company_name, created_at',
    [id, full_name ?? null, phone ?? null, company_name ?? null]
  );
  return rows[0] || null;
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}


