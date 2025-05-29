'use client';

import { Driver } from '@/types/f1-types';
import { Check } from 'lucide-react';

interface DriverSelectorProps {
  drivers: Driver[];
  selectedDrivers: number[];
  onSelectionChange: (driverNumbers: number[]) => void;
  maxSelection?: number;
}

export function DriverSelector({ 
  drivers, 
  selectedDrivers, 
  onSelectionChange, 
  maxSelection = 5 
}: DriverSelectorProps) {  const toggleDriver = (driverNumber: number) => {
    console.log('DriverSelector: Toggling driver', driverNumber, 'Current selection:', selectedDrivers);
    
    const isSelected = selectedDrivers.includes(driverNumber);
    
    if (isSelected) {
      // Remove driver
      const newSelection = selectedDrivers.filter(num => num !== driverNumber);
      console.log('DriverSelector: Removing driver, new selection:', newSelection);
      onSelectionChange(newSelection);
    } else {
      // Add driver (if under max limit)
      if (selectedDrivers.length < maxSelection) {
        const newSelection = [...selectedDrivers, driverNumber];
        console.log('DriverSelector: Adding driver, new selection:', newSelection);
        onSelectionChange(newSelection);
      } else {
        console.log('DriverSelector: Cannot add driver, max selection reached');
      }
    }
  };
  const getTeamColor = (teamName: string): string => {
    const teamColors: Record<string, string> = {
      'Red Bull Racing': '#1E3A8A',
      'Mercedes': '#059669',
      'Ferrari': '#DC2626',
      'McLaren': '#EA580C',
      'Alpine': '#2563EB',
      'Racing Bulls': '#6366F1',  // Updated from AlphaTauri
      'Aston Martin': '#065F46',
      'Williams': '#1D4ED8',
      'Kick Sauber': '#991B1B',   // Updated from Alfa Romeo
      'Haas': '#78716C'
    };
    return teamColors[teamName] || '#6B7280';
  };

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No drivers available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">
          Select Drivers ({selectedDrivers.length}/{maxSelection})
        </h3>
        <button
          onClick={() => onSelectionChange([])}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {drivers.map((driver) => {
          const isSelected = selectedDrivers.includes(driver.driver_number);
          const canSelect = selectedDrivers.length < maxSelection || isSelected;
          
          return (
            <button
              key={driver.driver_number}
              onClick={() => toggleDriver(driver.driver_number)}
              disabled={!canSelect}
              className={`
                relative flex items-center justify-between p-3 rounded-lg border transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300' 
                  : canSelect 
                    ? 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300' 
                    : 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getTeamColor(driver.team_name || '') }}
                />
                <div className="text-left">
                  <div className="font-medium text-sm">
                    {driver.name_acronym || `Driver ${driver.driver_number}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    #{driver.driver_number} • {driver.team_name || 'Unknown Team'}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <Check className="w-4 h-4 text-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      {selectedDrivers.length === maxSelection && (
        <div className="text-xs text-amber-400 text-center mt-2">
          Maximum drivers selected. Deselect one to choose another.
        </div>
      )}
    </div>
  );
}
