import { createTrip } from '../models/tripModel';
import { getContractById } from '../models/contractModel';
import { getRequestById } from '../models/requestModel';

export interface TripGenerationParams {
  contract_id: number;
}

/**
 * Generate trips automatically based on contract frequency and dates
 * Daily: One trip per day between start_date and end_date
 * Weekly: One trip per week between start_date and end_date
 * Monthly: One trip per month between start_date and end_date
 */
export async function generateTripsFromContract(contract_id: number): Promise<number> {
  const contract = await getContractById(contract_id);
  if (!contract) {
    throw new Error('Contract not found');
  }

  if (contract.status !== 'active') {
    throw new Error('Contract must be active to generate trips');
  }

  const request = await getRequestById(contract.request_id);
  if (!request) {
    throw new Error('Request not found');
  }

  const startDate = new Date(request.start_date);
  const endDate = request.end_date ? new Date(request.end_date) : null;
  
  // Default to 30 days if no end_date
  const finalEndDate = endDate || (() => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 30);
    return date;
  })();

  const trips: Array<{ contract_id: number; driver_id: number; scheduled_datetime: string }> = [];
  const currentDate = new Date(startDate);

  // Generate trips based on frequency
  while (currentDate <= finalEndDate) {
    // Set time to 8:00 AM by default (morning shift)
    const scheduledDatetime = new Date(currentDate);
    scheduledDatetime.setHours(8, 0, 0, 0);

    trips.push({
      contract_id: contract.id,
      driver_id: contract.driver_id,
      scheduled_datetime: scheduledDatetime.toISOString(),
    });

    // Move to next trip date based on frequency
    switch (request.frequency.toLowerCase()) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        // Default to daily if unknown frequency
        currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Create all trips
  let createdCount = 0;
  for (const tripData of trips) {
    try {
      await createTrip(tripData);
      createdCount++;
    } catch (error) {
      console.error(`Error creating trip for date ${tripData.scheduled_datetime}:`, error);
      // Continue creating other trips even if one fails
    }
  }

  return createdCount;
}

