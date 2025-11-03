import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth';
import { getTripsByDriver, getTripById, createTrip, updateTripStart, updateTripEnd, Trip } from '../models/tripModel';
import { getContractById } from '../models/contractModel';
import { getDriverById } from '../models/driverModel';
import { query } from '../db';

const router = Router();

function adminOnly(req: AuthedRequest, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

router.get('/driver/:driverId', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { driverId } = req.params;
    const userId = Number(req.user!.id);
    
    // Verify driver exists and belongs to user
    const driver = await getDriverById(Number(driverId));
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    
    if (req.user!.role !== 'driver' || driver.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const trips = await getTripsByDriver(Number(driverId));
    return res.json({ trips });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/start', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body ?? {};
    const userId = req.user!.id;
    
    if (req.user!.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can start trips' });
    }
    
    const trip = await getTripById(Number(id));
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    
    // Verify driver owns the trip
    const driver = await getDriverById(trip.driver_id);
    if (!driver || driver.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    if (trip.status !== 'pending') {
      return res.status(400).json({ message: `Trip is already ${trip.status}` });
    }
    
    const latitude = lat !== undefined ? Number(lat) : null;
    const longitude = lng !== undefined ? Number(lng) : null;
    
    const updated = await updateTripStart(Number(id), latitude || 0, longitude || 0);
    return res.json({ trip: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/end', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body ?? {};
    const userId = req.user!.id;
    
    if (req.user!.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can end trips' });
    }
    
    const trip = await getTripById(Number(id));
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    
    // Verify driver owns the trip
    const driver = await getDriverById(trip.driver_id);
    if (!driver || driver.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    if (trip.status !== 'active') {
      return res.status(400).json({ message: `Trip is not active (current: ${trip.status})` });
    }
    
    const latitude = lat !== undefined ? Number(lat) : null;
    const longitude = lng !== undefined ? Number(lng) : null;
    
    const updated = await updateTripEnd(Number(id), latitude || 0, longitude || 0);
    return res.json({ trip: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
  try {
    const { contract_id, scheduled_datetime } = req.body ?? {};
    
    if (!contract_id || !scheduled_datetime) {
      return res.status(400).json({ message: 'contract_id and scheduled_datetime required' });
    }
    
    const contract = await getContractById(Number(contract_id));
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    if (contract.status !== 'active') {
      return res.status(400).json({ message: 'Contract must be active to create trips' });
    }
    
    const trip = await createTrip({
      contract_id: Number(contract_id),
      driver_id: contract.driver_id,
      scheduled_datetime: scheduled_datetime,
    });
    
    return res.status(201).json({ trip });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

