import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth';
import { getVehiclesByCompany, getVehicleById, createVehicle, updateVehicle, Vehicle } from '../models/vehicleModel';
import { getCompanyByOwnerId } from '../models/companyModel';
import { query } from '../db';

const router = Router();

function companyOnly(req: AuthedRequest, res: any, next: any) {
  if (req.user?.role !== 'transport_company') {
    return res.status(403).json({ message: 'Transport company access required' });
  }
  next();
}

router.get('/company/:companyId', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user!.id;

    if (req.user!.role !== 'transport_company') {
      return res.status(403).json({ message: 'Transport company access required' });
    }

    // Verify company belongs to user
    const company = await getCompanyByOwnerId(userId);
    if (!company || Number(company.id) !== Number(companyId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const vehicles = await getVehiclesByCompany(Number(companyId));
    return res.json({ vehicles });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, companyOnly, async (req: AuthedRequest, res) => {
  try {
    const { plate_number, model, capacity } = req.body ?? {};
    const userId = req.user!.id;

    if (!plate_number || !model || !capacity) {
      return res.status(400).json({ message: 'plate_number, model, and capacity are required' });
    }

    const company = await getCompanyByOwnerId(userId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found for this user' });
    }

    const vehicle = await createVehicle({
      company_id: company.id,
      plate_number: String(plate_number),
      model: String(model),
      capacity: Number(capacity),
      status: 'pending',
    });

    // Update company vehicles_count
    await query(
      'UPDATE transport_companies SET vehicles_count = vehicles_count + 1 WHERE id = $1',
      [company.id]
    );

    return res.status(201).json({ vehicle });
  } catch (e: any) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(400).json({ message: 'Plate number already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, companyOnly, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { plate_number, model, capacity, status, last_maintenance } = req.body ?? {};
    const userId = req.user!.id;

    const vehicle = await getVehicleById(Number(id));
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Verify vehicle belongs to user's company
    const company = await getCompanyByOwnerId(userId);
    if (!company || vehicle.company_id !== company.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates: any = {};
    if (plate_number !== undefined) updates.plate_number = String(plate_number);
    if (model !== undefined) updates.model = String(model);
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (status !== undefined) updates.status = String(status);
    if (last_maintenance !== undefined) updates.last_maintenance = last_maintenance || null;

    const updated = await updateVehicle(Number(id), updates);
    return res.json({ vehicle: updated });
  } catch (e: any) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(400).json({ message: 'Plate number already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

