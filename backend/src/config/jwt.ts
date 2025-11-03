import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'dev-secret') as Secret;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export type JwtPayload = {
  id: number;
  email: string;
  role: 'business' | 'admin' | 'driver' | 'transport_company';
};

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}


