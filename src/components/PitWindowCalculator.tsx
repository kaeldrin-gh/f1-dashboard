'use client';

import { Driver, DriverPosition } from '@/types/f1-types';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PitWindowCalculatorProps {
  drivers: Driver[];
  positions: DriverPosition[];
  sessionInfo?: any;
}

interface PitWindowData {
  driverNumber: number;
  currentTyreAge: number;
  recommendedPitLap: number;
  pitWindowOpen: number;
  pitWindowClose: number;
  tyreCompound: string;
  estimatedLapTime: number;
  strategy: 'optimal' | 'early' | 'late' | 'emergency';
}

export function PitWindowCalculator({ drivers, positions, sessionInfo }: PitWindowCalculatorProps) {
  const [pitWindows, setPitWindows] = useState<PitWindowData[]>([]);
  const [currentLap, setCurrentLap] = useState(1);

  // Mock race data - in real implementation, this would come from live timing
  useEffect(() => {
    const calculatePitWindows = () => {
      if (!drivers || drivers.length === 0) return;

      const totalLaps = sessionInfo?.total_laps || 70; // Default race distance
      const currentRaceLap = sessionInfo?.current_lap || currentLap;      const windows: PitWindowData[] = drivers.map((driver) => {
        // Use deterministic mock data based on driver number
        const seed = driver.driver_number;
        const tyreAge = Math.floor((Math.sin(seed * 17) * 0.5 + 0.5) * 25) + 1;
        const compounds = ['SOFT', 'MEDIUM', 'HARD'];
        const compoundIndex = Math.floor((Math.sin(seed * 23) * 0.5 + 0.5) * compounds.length);
        const currentCompound = compounds[compoundIndex];
        
        // Calculate optimal pit window based on tyre compound
        let optimalPitLap: number;
        let windowSize: number;
        
        switch (currentCompound) {
          case 'SOFT':
            optimalPitLap = Math.max(15, Math.min(25, currentRaceLap + (25 - tyreAge)));
            windowSize = 5;
            break;
          case 'MEDIUM':
            optimalPitLap = Math.max(20, Math.min(35, currentRaceLap + (35 - tyreAge)));
            windowSize = 8;
            break;
          case 'HARD':
            optimalPitLap = Math.max(25, Math.min(50, currentRaceLap + (50 - tyreAge)));
            windowSize = 10;
            break;
          default:
            optimalPitLap = currentRaceLap + 15;
            windowSize = 6;
        }

        // Determine strategy
        let strategy: PitWindowData['strategy'] = 'optimal';
        if (tyreAge > 30) strategy = 'emergency';
        else if (optimalPitLap < currentRaceLap + 5) strategy = 'early';
        else if (optimalPitLap > totalLaps - 15) strategy = 'late';        return {
          driverNumber: driver.driver_number,
          currentTyreAge: tyreAge,
          recommendedPitLap: optimalPitLap,
          pitWindowOpen: Math.max(1, optimalPitLap - windowSize / 2),
          pitWindowClose: Math.min(totalLaps, optimalPitLap + windowSize / 2),
          tyreCompound: currentCompound,
          estimatedLapTime: 85.5 + (Math.sin(seed * 41) * 0.5 + 0.5) * 3, // Deterministic lap time
          strategy
        };
      });

      setPitWindows(windows.sort((a, b) => a.recommendedPitLap - b.recommendedPitLap));
    };

    calculatePitWindows();
    
    // Update every 30 seconds to simulate real-time calculations
    const interval = setInterval(calculatePitWindows, 30000);
    return () => clearInterval(interval);
  }, [drivers, sessionInfo, currentLap]);

  const getStrategyColor = (strategy: PitWindowData['strategy']): string => {
    switch (strategy) {
      case 'optimal': return 'text-green-400 bg-green-400/10';
      case 'early': return 'text-blue-400 bg-blue-400/10';
      case 'late': return 'text-yellow-400 bg-yellow-400/10';
      case 'emergency': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTyreCompoundColor = (compound: string): string => {
    switch (compound) {
      case 'SOFT': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HARD': return 'bg-gray-200';
      default: return 'bg-gray-500';
    }
  };

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No driver data available for pit window calculation
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Pit Window Calculator</h3>
        </div>
        <div className="text-sm text-gray-400">
          Lap {currentLap}
        </div>
      </div>

      {/* Current lap input */}
      <div className="flex items-center space-x-3 mb-4">
        <label className="text-sm text-gray-300">Current Lap:</label>
        <input
          type="number"
          min="1"
          max="100"
          value={currentLap}
          onChange={(e) => setCurrentLap(Number(e.target.value))}
          className="w-20 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Pit windows list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {pitWindows.map((window) => {
          const driver = drivers.find(d => d.driver_number === window.driverNumber);
          const isInWindow = currentLap >= window.pitWindowOpen && currentLap <= window.pitWindowClose;
          const isPastWindow = currentLap > window.pitWindowClose;
          
          return (
            <div
              key={window.driverNumber}
              className={`p-3 rounded-lg border transition-all ${
                isInWindow 
                  ? 'border-green-500 bg-green-500/5' 
                  : isPastWindow 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : 'border-gray-600 bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {driver?.name_acronym || `#${window.driverNumber}`}
                  </div>
                  <div className={`px-2 py-1 text-xs rounded ${getStrategyColor(window.strategy)}`}>
                    {window.strategy.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${getTyreCompoundColor(window.tyreCompound)}`}
                    title={window.tyreCompound}
                  />
                  <span className="text-xs text-gray-400">{window.currentTyreAge} laps</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-gray-400">Window Open</div>
                  <div className="font-medium">Lap {window.pitWindowOpen}</div>
                </div>
                <div>
                  <div className="text-gray-400">Optimal</div>
                  <div className="font-medium text-blue-400">Lap {window.recommendedPitLap}</div>
                </div>
                <div>
                  <div className="text-gray-400">Window Close</div>
                  <div className="font-medium">Lap {window.pitWindowClose}</div>
                </div>
              </div>

              {window.strategy === 'emergency' && (
                <div className="flex items-center space-x-2 mt-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">Critical tyre degradation - pit immediately!</span>
                </div>
              )}

              {isInWindow && (
                <div className="flex items-center space-x-2 mt-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Pit window open - optimal time to pit</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Strategy summary */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <div className="text-sm font-medium mb-2">Strategy Overview</div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-gray-400">Drivers in pit window</div>
            <div className="font-medium text-green-400">
              {pitWindows.filter(w => currentLap >= w.pitWindowOpen && currentLap <= w.pitWindowClose).length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Emergency stops needed</div>
            <div className="font-medium text-red-400">
              {pitWindows.filter(w => w.strategy === 'emergency').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
