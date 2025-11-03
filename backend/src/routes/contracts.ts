import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth';
import { createContract, getPendingContracts, getContractById, getContractsByBusiness, getContractDetails, updateContractStatus } from '../models/contractModel';
import { getRequestById } from '../models/requestModel';
import { getVehicleById } from '../models/vehicleModel';
import { getDriverById } from '../models/driverModel';
import { calculatePrice } from '../utils/priceCalculator';
import { generateTripsFromContract } from '../utils/tripGenerator';

const router = Router();

function adminOnly(req: AuthedRequest, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

router.post('/', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
  try {
    const { request_id, company_id, driver_id, vehicle_id, price, admin_notes } = req.body ?? {};
    
    if (!request_id || !company_id || !driver_id || !vehicle_id || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const request = await getRequestById(Number(request_id));
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    const driver = await getDriverById(Number(driver_id));
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    
    const vehicle = await getVehicleById(Number(vehicle_id));
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    
    // Ensure both are numbers for comparison (PostgreSQL returns IDs as strings)
    const vehicleCompanyId = Number(vehicle.company_id);
    const requestedCompanyId = Number(company_id);
    
    if (vehicleCompanyId !== requestedCompanyId) {
      return res.status(400).json({ message: 'Vehicle does not belong to selected company' });
    }
    
    const contract = await createContract({
      request_id: Number(request_id),
      company_id: Number(company_id),
      driver_id: Number(driver_id),
      vehicle_id: Number(vehicle_id),
      price: Number(price),
      admin_notes: admin_notes ?? null,
    });
    
    // Update request status to active
    const { query } = await import('../db');
    await query('UPDATE business_requests SET status = $1 WHERE id = $2', ['active', request_id]);
    
    return res.status(201).json({ contract });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pending', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
  try {
    const contracts = await getPendingContracts();
    return res.json({ contracts });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/calculate-price', authMiddleware, adminOnly, async (req: AuthedRequest, res) => {
  try {
    const { employees_count, frequency } = req.query;
    if (!employees_count || !frequency) {
      return res.status(400).json({ message: 'employees_count and frequency required' });
    }
    
    const price = calculatePrice({
      employees_count: Number(employees_count),
      frequency: frequency as 'daily' | 'weekly' | 'monthly',
    });
    
    return res.json({ price });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Business routes
router.get('/business/:businessId', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { businessId } = req.params;
    const userId = Number(req.user!.id);
    
    if (Number(businessId) !== userId || req.user!.role !== 'business') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const contracts = await getContractsByBusiness(userId);
    return res.json({ contracts });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/details', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const contract = await getContractDetails(Number(id));
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    // Verify business owns the request
    if (req.user!.role === 'business' && contract.business_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    return res.json({ contract });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/accept', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    if (req.user!.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can accept contracts' });
    }
    
    const contract = await getContractById(Number(id));
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    const request = await getRequestById(contract.request_id);
    if (!request || request.business_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    if (contract.status !== 'pending') {
      return res.status(400).json({ message: `Contract is already ${contract.status}` });
    }
    
    const updated = await updateContractStatus(Number(id), 'active');
    if (updated) {
      // Also update request status
      await import('../db').then(({ query }) => query('UPDATE business_requests SET status = $1 WHERE id = $2', ['active', request.id]));
      
      // Generate trips automatically based on frequency and dates
      try {
        const tripsCount = await generateTripsFromContract(Number(id));
        console.log(`✅ Generated ${tripsCount} trips for contract ${id}`);
        return res.json({ 
          contract: updated, 
          message: `${tripsCount} trajets générés automatiquement`,
          tripsGenerated: tripsCount
        });
      } catch (tripError: any) {
        console.error('Error generating trips:', tripError);
        // Still return success for contract acceptance, but log trip generation error
        return res.json({ 
          contract: updated, 
          warning: 'Contrat accepté mais erreur lors de la génération des trajets: ' + (tripError.message || 'Erreur inconnue')
        });
      }
    }
    
    return res.json({ contract: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/reject', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    if (req.user!.role !== 'business') {
      return res.status(403).json({ message: 'Only business users can reject contracts' });
    }
    
    const contract = await getContractById(Number(id));
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    const request = await getRequestById(contract.request_id);
    if (!request || request.business_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    if (contract.status !== 'pending') {
      return res.status(400).json({ message: `Contract is already ${contract.status}` });
    }
    
    const updated = await updateContractStatus(Number(id), 'cancelled');
    return res.json({ contract: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

