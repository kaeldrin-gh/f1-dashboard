// Tyre compound data and utilities
export interface TyreCompound {
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
  color: string;
  shortName: string;
  gripLevel: number; // 1-5 scale
  durability: number; // 1-5 scale
}

export const tyreCompounds: Record<string, TyreCompound> = {
  SOFT: {
    compound: 'SOFT',
    color: '#DC2626', // Red
    shortName: 'S',
    gripLevel: 5,
    durability: 2
  },
  MEDIUM: {
    compound: 'MEDIUM',
    color: '#F59E0B', // Yellow
    shortName: 'M',
    gripLevel: 3,
    durability: 3
  },
  HARD: {
    compound: 'HARD',
    color: '#E5E7EB', // White/Light Gray
    shortName: 'H',
    gripLevel: 2,
    durability: 5
  },
  INTERMEDIATE: {
    compound: 'INTERMEDIATE',
    color: '#10B981', // Green
    shortName: 'I',
    gripLevel: 4,
    durability: 3
  },
  WET: {
    compound: 'WET',
    color: '#3B82F6', // Blue
    shortName: 'W',
    gripLevel: 5,
    durability: 2
  }
};

// Calculate optimal pit window based on tyre age and compound
export const calculatePitWindow = (
  currentLap: number,
  tyreAge: number,
  compound: string,
  totalLaps: number
): { optimal: number; latest: number; critical: boolean } => {
  const tyre = tyreCompounds[compound] || tyreCompounds.MEDIUM;
  
  // Base stint length by compound (in laps)
  const baseMileage = {
    SOFT: 15,
    MEDIUM: 25,
    HARD: 35,
    INTERMEDIATE: 20,
    WET: 15
  };
  
  const maxStintLength = baseMileage[compound as keyof typeof baseMileage] || 25;
  const optimalPitWindow = currentLap + (maxStintLength - tyreAge);
  const latestPitWindow = Math.min(totalLaps - 5, optimalPitWindow + 8);
  const critical = tyreAge > maxStintLength * 0.8;
  
  return {
    optimal: Math.max(currentLap + 1, optimalPitWindow),
    latest: latestPitWindow,
    critical
  };
};

// Calculate relative pace based on tyre compound and age
export const calculateTyrePace = (compound: string, age: number): number => {
  const tyre = tyreCompounds[compound] || tyreCompounds.MEDIUM;
  
  // Pace degradation curve (percentage of optimal performance)
  const degradationRate = (6 - tyre.durability) * 0.005; // 0.5-2.5% per lap
  const performanceLoss = age * degradationRate;
  
  return Math.max(0.85, 1 - performanceLoss); // Minimum 85% performance
};

// Format tyre age for display
export const formatTyreAge = (age: number): string => {
  if (age === 0) return 'NEW';
  if (age < 10) return `${age}`;
  return `${age}+`;
};

// Get tyre compound from stint data or car data
export const getCurrentTyreCompound = (carData: any): string => {
  // This would typically come from the OpenF1 API car data
  // For now, we'll use a mock implementation
  if (carData?.compound) return carData.compound;
  
  // Mock compound based on driver number for demo
  const mockCompounds = ['SOFT', 'MEDIUM', 'HARD'];
  return mockCompounds[Math.floor(Math.random() * mockCompounds.length)];
};
