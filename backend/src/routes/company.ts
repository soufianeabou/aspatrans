import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth';
import { getCompanyByOwnerId } from '../models/companyModel';
import { getDriversByCompany } from '../models/driverModel';
import { getTripsByDriver } from '../models/tripModel';
import { query } from '../db';

const router = Router();

function companyOnly(req: AuthedRequest, res: any, next: any) {
  if (req.user?.role !== 'transport_company') {
    return res.status(403).json({ message: 'Transport company access required' });
  }
  next();
}

router.get('/me', authMiddleware, companyOnly, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const company = await getCompanyByOwnerId(userId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found for this user' });
    }
    
    return res.json({ company });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/revenue/:companyId', authMiddleware, companyOnly, async (req: AuthedRequest, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user!.id;

    const company = await getCompanyByOwnerId(userId);
    if (!company || company.id !== Number(companyId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Get all contracts for this company
    const { rows: contracts } = await query(
      `SELECT c.id, c.price, c.status, c.created_at,
              br.frequency, br.employees_count
       FROM contracts c
       JOIN business_requests br ON c.request_id = br.id
       WHERE c.company_id = $1 AND c.status = $2`,
      [companyId, 'active']
    );

    // Calculate revenue
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (const contract of contracts) {
      totalRevenue += Number(contract.price) || 0;
      
      const contractDate = new Date(contract.created_at);
      if (contractDate.getMonth() === currentMonth && contractDate.getFullYear() === currentYear) {
        monthlyRevenue += Number(contract.price) || 0;
      }
    }

    // Get revenue breakdown by vehicle
    const { rows: vehicleRevenue } = await query(
      `SELECT v.id, v.model, v.plate_number, COUNT(c.id) as trips_count, SUM(c.price) as total_revenue
       FROM vehicles v
       LEFT JOIN contracts c ON c.vehicle_id = v.id AND c.status = $1
       WHERE v.company_id = $2
       GROUP BY v.id, v.model, v.plate_number
       ORDER BY total_revenue DESC NULLS LAST`,
      ['active', companyId]
    );

    return res.json({
      totalRevenue,
      monthlyRevenue,
      activeContracts: contracts.length,
      vehicleBreakdown: vehicleRevenue.map((v: any) => ({
        vehicle_id: Number(v.id),
        model: v.model,
        plate_number: v.plate_number,
        trips_count: Number(v.trips_count) || 0,
        total_revenue: Number(v.total_revenue) || 0,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

