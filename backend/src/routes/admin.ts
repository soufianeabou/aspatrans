import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth';
import { getAllRequests } from '../models/contractModel';
import { getAllCompanies } from '../models/companyModel';
import { getAvailableDrivers, getAllDrivers } from '../models/driverModel';
import { getVehiclesByCompany } from '../models/vehicleModel';
import { getPendingContracts } from '../models/contractModel';

const router = Router();

// Middleware: only admin
function adminOnly(req: AuthedRequest, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

router.get('/requests', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
  try {
    const { status } = req.query;
    const requests = await getAllRequests(status as string | undefined);
    return res.json({ requests });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/companies', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
  try {
    const companies = await getAllCompanies();
    return res.json({ companies });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/drivers/available', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
  try {
    const drivers = await getAvailableDrivers();
    return res.json({ drivers });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/companies/:companyId/vehicles', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
  try {
    const { companyId } = req.params;
    const vehicles = await getVehiclesByCompany(Number(companyId));
    return res.json({ vehicles });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

