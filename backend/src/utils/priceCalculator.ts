export function calculatePrice(params: {
  employees_count: number;
  frequency: 'daily' | 'weekly' | 'monthly';
}): number {
  const BASE_DISTANCE = 50; // 50 DH base
  const PER_EMPLOYEE = 15; // 15 DH par employé
  
  const frequencyMultipliers = {
    daily: 1.0,
    weekly: 0.8,
    monthly: 0.6,
  };
  
  const basePrice = BASE_DISTANCE + (params.employees_count * PER_EMPLOYEE);
  const multiplier = frequencyMultipliers[params.frequency] || 1.0;
  
  return Math.round(basePrice * multiplier);
}

