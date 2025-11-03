import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth';
import { createUser, findByEmail, findById, updateUserProfile, verifyPassword, UserRole } from '../models/userModel';
import { signToken } from '../config/jwt';

const router = Router();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ROLES: UserRole[] = ['business', 'admin', 'driver', 'transport_company'];

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, full_name, phone, company_name } = req.body ?? {};

    if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!password || String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!role || !ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (!full_name) return res.status(400).json({ message: 'Full name is required' });

    const existing = await findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = await createUser({ email, password, role, full_name, phone: phone ?? null, company_name: company_name ?? null });
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ user, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!password || String(password).length < 6) return res.status(400).json({ message: 'Invalid password' });

    const existing = await findByEmail(email);
    if (!existing) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await verifyPassword(password, existing.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const { password: _pw, ...safeUser } = existing as any;
    const token = signToken({ id: existing.id, email: existing.email, role: existing.role });
    return res.json({ user: safeUser, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await findById(userId);
    if (!user) return res.status(404).json({ message: 'Not found' });
    return res.json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { full_name, phone, company_name } = req.body ?? {};
    if (full_name !== undefined && String(full_name).trim().length === 0) {
      return res.status(400).json({ message: 'full_name cannot be empty' });
    }
    const updated = await updateUserProfile(req.user!.id, { full_name, phone, company_name });
    return res.json({ user: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;


