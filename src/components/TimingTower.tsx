'use client';

import { TimingTowerProps } from '@/types/f1-types';
import { useDashboardStore } from '@/store/dashboard-store';
import { useState, useEffect } from 'react';

// Tyre compound utilities (inline for now)
const tyreCompounds: Record<string, any> = {
  SOFT: { compound: 'SOFT', color: '#DC2626', shortName: 'S', gripLevel: 5, durability: 2 },
  MEDIUM: { compound: 'MEDIUM', color: '#F59E0B', shortName: 'M', gripLevel: 3, durability: 3 },
  HARD: { compound: 'HARD', color: '#E5E7EB', shortName: 'H', gripLevel: 2, durability: 5 },
  INTERMEDIATE: { compound: 'INTERMEDIATE', color: '#10B981', shortName: 'I', gripLevel: 4, durability: 3 },
  WET: { compound: 'WET', color: '#3B82F6', shortName: 'W', gripLevel: 5, durability: 2 }
};

const calculatePitWindow = (currentLap: number, tyreAge: number, compound: string, totalLaps: number) => {
  const baseMileage: Record<string, number> = { SOFT: 15, MEDIUM: 25, HARD: 35, INTERMEDIATE: 20, WET: 15 };
  const maxStintLength = baseMileage[compound] || 25;
  const optimalPitWindow = currentLap + (maxStintLength - tyreAge);
  const critical = tyreAge > maxStintLength * 0.8;
  
  return {
    optimal: Math.max(currentLap + 1, optimalPitWindow),
    latest: Math.min(totalLaps - 5, optimalPitWindow + 8),
    critical
  };
};

const formatTyreAge = (age: number): string => {
  if (age === 0) return 'NEW';
  if (age < 10) return `${age}`;
  return `${age}+`;
};

const getCurrentTyreCompound = (carData: any): string => {
  if (carData?.compound) return carData.compound;
  const mockCompounds = ['SOFT', 'MEDIUM', 'HARD'];
  return mockCompounds[0]; // Default to SOFT for consistency
};

export function TimingTower({ positions, intervals, drivers }: TimingTowerProps) {
  const { carData, sessionInfo, selectedDrivers, setSelectedDrivers } = useDashboardStore();
  const [isClient, setIsClient] = useState(false);
  const [mockData, setMockData] = useState<{[key: number]: {tyreAge: number, ers: number, drs: boolean}}>({});
  useEffect(() => {
    setIsClient(true);
    // Generate stable mock data once on client side using deterministic seeds
    const newMockData: {[key: number]: {tyreAge: number, ers: number, drs: boolean}} = {};
    (positions || []).forEach(pos => {
      // Use driver number as seed for consistent data
      const seed = pos.driver_number;
      newMockData[pos.driver_number] = {
        tyreAge: Math.floor((Math.sin(seed * 17) * 0.5 + 0.5) * 25) + 1,
        ers: Math.floor((Math.sin(seed * 23) * 0.5 + 0.5) * 100),
        drs: Math.sin(seed * 31) > 0.4 // 30% chance
      };
    });
    setMockData(newMockData);
  }, [positions]);

  if (!isClient) {
    return (
      <div className="space-y-2">
        <div className="text-center text-gray-400 py-8">
          Loading timing data...
        </div>
      </div>
    );
  }
    // Combine position and driver data with safety checks
  const timingData = (positions || []).map(pos => {
    const driver = (drivers || []).find(d => d.driver_number === pos.driver_number);
    const interval = (intervals || []).find(i => i.driver_number === pos.driver_number);
    const driverCarData = carData?.[pos.driver_number];
    
    // Use stable mock data
    const mock = mockData[pos.driver_number] || { tyreAge: 1, ers: 0, drs: false };
    const compound = getCurrentTyreCompound(driverCarData);
    const pitWindow = calculatePitWindow(
      sessionInfo?.currentLap || 1,
      mock.tyreAge,
      compound,
      sessionInfo?.totalLaps || 70
    );
    
    return {
      position: pos.position,
      driver,
      gap: interval?.gap_to_leader || '+0.000',
      interval: interval?.interval || '+0.000',
      tyreAge: mock.tyreAge,
      compound,
      pitWindow,
      ers: mock.ers,
      drs: mock.drs
    };
  }).sort((a, b) => a.position - b.position);
  const formatTime = (timeValue: string | number) => {
    if (!timeValue || timeValue === '0' || timeValue === '+0.000' || timeValue === 0) return '-';
    return typeof timeValue === 'number' ? timeValue.toFixed(3) : timeValue;
  };

  const toggleDriverSelection = (driverNumber: number) => {
    const isSelected = selectedDrivers.includes(driverNumber);
    if (isSelected) {
      setSelectedDrivers(selectedDrivers.filter(num => num !== driverNumber));
    } else {
      if (selectedDrivers.length < 5) { // Max 5 drivers
        setSelectedDrivers([...selectedDrivers, driverNumber]);
      }
    }
  };
  return (
    <div className="space-y-2">
      {/* Header with selection info */}
      <div className="flex items-center justify-between mb-3">
        <div className="grid grid-cols-12 gap-1 text-xs font-semibold text-gray-400 border-b border-gray-600 pb-2 flex-1">
          <div className="col-span-1">POS</div>
          <div className="col-span-3">DRIVER</div>
          <div className="col-span-2">TEAM</div>
          <div className="col-span-2">GAP</div>
          <div className="col-span-2">INT</div>
          <div className="col-span-1">TYRE</div>
          <div className="col-span-1">ERS</div>
        </div>
      </div>
        {selectedDrivers.length > 0 ? (
        <div className="text-xs text-blue-400 mb-2">
          {selectedDrivers.length} driver{selectedDrivers.length > 1 ? 's' : ''} selected for telemetry • Click to toggle
        </div>
      ) : (
        <div className="text-xs text-gray-400 mb-2">
          Click on drivers below to select them for telemetry analysis (max 5)
        </div>
      )}{/* Timing rows */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {timingData.map((entry, index) => {
          const isSelected = selectedDrivers.includes(entry.driver?.driver_number || 0);
          const driverNumber = entry.driver?.driver_number || 0;
          
          return (
            <div 
              key={entry.driver?.driver_number || index}
              onClick={() => driverNumber && toggleDriverSelection(driverNumber)}
              className={`grid grid-cols-12 gap-1 text-sm py-2 px-2 rounded transition-all cursor-pointer ${
                isSelected ? 'bg-blue-600/20 border border-blue-500/50' :
                entry.position === 1 ? 'bg-yellow-900/20 border-l-4 border-yellow-500' :
                entry.position <= 3 ? 'bg-orange-900/20' :
                entry.position <= 10 ? 'bg-green-900/20' :
                'hover:bg-gray-700'
              }`}
            >
            {/* Position */}
            <div className="col-span-1 font-bold text-white flex items-center">
              {entry.position}
              {entry.position <= 3 && (
                <div className="ml-1 w-2 h-2 rounded-full bg-yellow-500"></div>
              )}
            </div>

            {/* Driver */}
            <div className="col-span-3 flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.driver ? `#${entry.driver.team_colour}` : '#666' }}
              />
              <span className="text-white font-medium text-xs truncate">
                {entry.driver?.name_acronym || 'N/A'}
              </span>
            </div>

            {/* Team */}
            <div className="col-span-2 text-gray-300 text-xs truncate">
              {entry.driver?.team_name?.slice(0, 8) || 'Unknown'}
            </div>

            {/* Gap to leader */}
            <div className="col-span-2 text-gray-300 text-xs">
              {entry.position === 1 ? 'LEADER' : formatTime(entry.gap)}
            </div>

            {/* Interval */}
            <div className="col-span-2 text-gray-300 text-xs">
              {entry.position === 1 ? '-' : formatTime(entry.interval)}
            </div>

            {/* Tyre Compound and Age */}
            <div className="col-span-1 flex items-center space-x-1">
              <div 
                className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-black"
                style={{ backgroundColor: tyreCompounds[entry.compound]?.color || '#666' }}
              >
                {tyreCompounds[entry.compound]?.shortName || 'M'}
              </div>
              <span className={`text-xs ${
                entry.pitWindow.critical ? 'text-red-400 font-bold' : 'text-gray-300'
              }`}>
                {formatTyreAge(entry.tyreAge)}
              </span>
            </div>

            {/* ERS and DRS */}
            <div className="col-span-1 flex items-center space-x-1">
              {/* ERS Bar */}
              <div className="flex-1">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${entry.ers}%` }}
                  ></div>
                </div>
              </div>
              
              {/* DRS Indicator */}
              <div className={`text-xs font-bold px-1 py-0.5 rounded ${
                entry.drs ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'
              }`}>
                DRS
              </div>            </div>
          </div>
        );
        })}
      </div>

      {/* No data message */}
      {timingData.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No timing data available
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 p-2 bg-gray-800 rounded text-xs space-y-1">
        <div className="font-semibold text-gray-300">Legend:</div>
        <div className="grid grid-cols-2 gap-2 text-gray-400">
          <div>🟡 Top 3 • 🟢 Points (P1-P10)</div>
          <div>ERS: Energy Recovery • DRS: Drag Reduction</div>
        </div>
        <div className="flex space-x-4 text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Soft</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Hard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
