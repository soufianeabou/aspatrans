import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth';
import { getDriverById, getDriverByUserId, getDriversByCompany, createDriver } from '../models/driverModel';
import { getCompanyByOwnerId } from '../models/companyModel';
import { createUser } from '../models/userModel';
import { getTripsByDriver } from '../models/tripModel';
import { query } from '../db';

const router = Router();

function companyOnly(req: AuthedRequest, res: any, next: any) {
  if (req.user?.role !== 'transport_company') {
    return res.status(403).json({ message: 'Transport company access required' });
  }
  next();
}

router.get('/me', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    if (req.user!.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can access this endpoint' });
    }
    
    const driver = await getDriverByUserId(userId);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    
    return res.json({ driver });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/company/:companyId', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user!.id;

    if (req.user!.role !== 'transport_company') {
      return res.status(403).json({ message: 'Transport company access required' });
    }

    const company = await getCompanyByOwnerId(userId);
    if (!company || Number(company.id) !== Number(companyId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const drivers = await getDriversByCompany(Number(companyId));
    
    // Get trip stats for each driver
    const driversWithStats = await Promise.all(
      drivers.map(async (driver: any) => {
        const trips = await getTripsByDriver(driver.id);
        const completedTrips = trips.filter((t: any) => t.status === 'completed');
        return {
          ...driver,
          trips_count: completedTrips.length,
          total_trips: trips.length,
        };
      })
    );

    return res.json({ drivers: driversWithStats });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, companyOnly, async (req: AuthedRequest, res) => {
  try {
    const { email, password, full_name, phone, license_number } = req.body ?? {};
    const userId = req.user!.id;

    if (!email || !password || !full_name || !license_number) {
      return res.status(400).json({ message: 'email, password, full_name, and license_number are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const company = await getCompanyByOwnerId(userId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found for this user' });
    }

    // Create user first
    const user = await createUser({
      email: String(email),
      password: String(password),
      role: 'driver',
      full_name: String(full_name),
      phone: phone ? String(phone) : null,
      company_name: null,
    });

    // Create driver
    const driver = await createDriver({
      company_id: company.id,
      user_id: user.id,
      license_number: String(license_number),
      availability_status: 'pending',
    });

    return res.status(201).json({ driver, user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (e: any) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(400).json({ message: 'Email or license number already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/availability', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { availability_status } = req.body ?? {};
    const userId = req.user!.id;
    
    if (req.user!.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can update availability' });
    }
    
    const driver = await getDriverById(Number(id));
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    
    if (driver.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const validStatuses = ['active', 'inactive', 'pending'];
    if (!availability_status || !validStatuses.includes(availability_status)) {
      return res.status(400).json({ message: `availability_status must be one of: ${validStatuses.join(', ')}` });
    }
    
    const { rows } = await query(
      'UPDATE drivers SET availability_status = $1 WHERE id = $2 RETURNING *',
      [availability_status, id]
    );
    
    return res.json({ driver: rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

