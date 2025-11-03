import { Router } from 'express';
import { AuthedRequest, authMiddleware } from '../middleware/auth';
import { createRequest, getRequestsByBusiness, getRequestById, updateRequest, deleteRequest, Frequency, RequestStatus } from '../models/requestModel';

const router = Router();

const VALID_FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly'];
const VALID_STATUSES: RequestStatus[] = ['pending', 'active', 'completed', 'cancelled'];

function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

router.post('/', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { pickup_location, destination, employees_count, frequency, start_date, end_date, special_notes } = req.body ?? {};
    const business_id = req.user!.id;

    if (req.user!.role !== 'business') return res.status(403).json({ message: 'Only business users can create requests' });
    if (!pickup_location || String(pickup_location).trim().length === 0) return res.status(400).json({ message: 'pickup_location is required' });
    if (!destination || String(destination).trim().length === 0) return res.status(400).json({ message: 'destination is required' });
    if (!employees_count || Number(employees_count) < 1) return res.status(400).json({ message: 'employees_count must be at least 1' });
    if (!frequency || !VALID_FREQUENCIES.includes(frequency)) return res.status(400).json({ message: `frequency must be one of: ${VALID_FREQUENCIES.join(', ')}` });
    if (!start_date || !isValidDate(start_date)) return res.status(400).json({ message: 'start_date must be a valid date' });
    if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) return res.status(400).json({ message: 'end_date must be a valid date' });

    const request = await createRequest({ business_id, pickup_location, destination, employees_count: Number(employees_count), frequency, start_date, end_date: end_date ?? null, special_notes: special_notes ?? null });
    return res.status(201).json({ request });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/business/:businessId', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { businessId } = req.params;
    const userId = Number(req.user!.id);
    if (Number(businessId) !== userId) return res.status(403).json({ message: 'Forbidden' });

    const requests = await getRequestsByBusiness(userId);
    return res.json({ requests });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { pickup_location, destination, employees_count, frequency, start_date, end_date, special_notes, status } = req.body ?? {};
    const userId = req.user!.id;

    const existing = await getRequestById(Number(id));
    if (!existing) return res.status(404).json({ message: 'Not found' });
    if (existing.business_id !== userId) return res.status(403).json({ message: 'Forbidden' });

    const updates: any = {};
    if (pickup_location !== undefined && String(pickup_location).trim().length > 0) updates.pickup_location = String(pickup_location);
    if (destination !== undefined && String(destination).trim().length > 0) updates.destination = String(destination);
    if (employees_count !== undefined && Number(employees_count) >= 1) updates.employees_count = Number(employees_count);
    if (frequency !== undefined && VALID_FREQUENCIES.includes(frequency)) updates.frequency = frequency;
    if (start_date !== undefined && isValidDate(start_date)) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date === null || isValidDate(end_date) ? end_date : undefined;
    if (special_notes !== undefined) updates.special_notes = special_notes;
    if (status !== undefined && VALID_STATUSES.includes(status)) updates.status = status;

    const updated = await updateRequest(Number(id), updates);
    return res.json({ request: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existing = await getRequestById(Number(id));
    if (!existing) return res.status(404).json({ message: 'Not found' });
    if (existing.business_id !== userId) return res.status(403).json({ message: 'Forbidden' });

    await deleteRequest(Number(id));
    return res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

