'use client';

import { Driver, DriverPosition, CarData } from '@/types/f1-types';
import { Clock, TrendingUp, TrendingDown, Minus, Trophy, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SectorTimingComparisonProps {
  drivers: Driver[];
  positions: DriverPosition[];
  carData: Record<number, CarData>;
  selectedDrivers?: number[];
}

interface SectorTiming {
  driverNumber: number;
  sector1: number;
  sector2: number;
  sector3: number;
  personalBest1: number;
  personalBest2: number;
  personalBest3: number;
  sessionBest1: boolean;
  sessionBest2: boolean;
  sessionBest3: boolean;
  improvement1?: number;
  improvement2?: number;
  improvement3?: number;
}

interface ComparisonData {
  referenceDriver: number;
  comparisons: Array<{
    driverNumber: number;
    sector1Delta: number;
    sector2Delta: number;
    sector3Delta: number;
    totalDelta: number;
  }>;
}

export function SectorTimingComparison({ drivers, positions, carData, selectedDrivers }: SectorTimingComparisonProps) {
  const [sectorTimings, setSectorTimings] = useState<SectorTiming[]>([]);
  const [referenceDriver, setReferenceDriver] = useState<number | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [sortBy, setSortBy] = useState<'sector1' | 'sector2' | 'sector3' | 'total'>('total');

  useEffect(() => {
    generateMockSectorTimings();
  }, [drivers, carData]);

  useEffect(() => {
    if (referenceDriver && sectorTimings.length > 0) {
      calculateComparisons();
    }
  }, [referenceDriver, sectorTimings]);

  const generateMockSectorTimings = () => {
    if (!drivers || drivers.length === 0) return;

    const driversToShow = selectedDrivers && selectedDrivers.length > 0 
      ? drivers.filter(d => selectedDrivers.includes(d.driver_number))
      : drivers.slice(0, 10);

    const newTimings: SectorTiming[] = driversToShow.map((driver) => {
      const baseTime = 20 + (Math.sin(driver.driver_number) * 2); // Base sector time variation
      const carPerformance = carData[driver.driver_number];
      
      // Performance factors based on car data
      const speedFactor = carPerformance ? (carPerformance.speed || 200) / 250 : 0.9;
      const throttleFactor = carPerformance ? (carPerformance.throttle || 0) / 100 : 0.8;
      
      // Generate realistic sector times (typical F1 sector splits)
      const sector1Base = 18 + Math.random() * 4; // 18-22 seconds
      const sector2Base = 25 + Math.random() * 5; // 25-30 seconds  
      const sector3Base = 22 + Math.random() * 3; // 22-25 seconds
      
      const sector1 = sector1Base * (1 + (1 - speedFactor) * 0.1);
      const sector2 = sector2Base * (1 + (1 - throttleFactor) * 0.1);
      const sector3 = sector3Base * (1 + (1 - speedFactor) * 0.05);
      
      // Personal bests (slightly better than current)
      const pb1 = sector1 - (0.1 + Math.random() * 0.3);
      const pb2 = sector2 - (0.1 + Math.random() * 0.5);
      const pb3 = sector3 - (0.1 + Math.random() * 0.2);
      
      return {
        driverNumber: driver.driver_number,
        sector1: parseFloat(sector1.toFixed(3)),
        sector2: parseFloat(sector2.toFixed(3)),
        sector3: parseFloat(sector3.toFixed(3)),
        personalBest1: parseFloat(pb1.toFixed(3)),
        personalBest2: parseFloat(pb2.toFixed(3)),
        personalBest3: parseFloat(pb3.toFixed(3)),
        sessionBest1: false,
        sessionBest2: false,
        sessionBest3: false,
        improvement1: sector1 > pb1 ? parseFloat((pb1 - sector1).toFixed(3)) : undefined,
        improvement2: sector2 > pb2 ? parseFloat((pb2 - sector2).toFixed(3)) : undefined,
        improvement3: sector3 > pb3 ? parseFloat((pb3 - sector3).toFixed(3)) : undefined,
      };
    });

    // Determine session bests
    if (newTimings.length > 0) {
      const bestS1 = Math.min(...newTimings.map(t => t.sector1));
      const bestS2 = Math.min(...newTimings.map(t => t.sector2));
      const bestS3 = Math.min(...newTimings.map(t => t.sector3));
      
      newTimings.forEach(timing => {
        timing.sessionBest1 = Math.abs(timing.sector1 - bestS1) < 0.001;
        timing.sessionBest2 = Math.abs(timing.sector2 - bestS2) < 0.001;
        timing.sessionBest3 = Math.abs(timing.sector3 - bestS3) < 0.001;
      });
    }

    setSectorTimings(newTimings);
    
    // Auto-select fastest overall driver as reference
    if (newTimings.length > 0 && !referenceDriver) {
      const fastestDriver = newTimings.reduce((fastest, current) => {
        const currentTotal = current.sector1 + current.sector2 + current.sector3;
        const fastestTotal = fastest.sector1 + fastest.sector2 + fastest.sector3;
        return currentTotal < fastestTotal ? current : fastest;
      });
      setReferenceDriver(fastestDriver.driverNumber);
    }
  };

  const calculateComparisons = () => {
    if (!referenceDriver) return;

    const refTiming = sectorTimings.find(t => t.driverNumber === referenceDriver);
    if (!refTiming) return;

    const comparisons = sectorTimings
      .filter(t => t.driverNumber !== referenceDriver)
      .map(timing => ({
        driverNumber: timing.driverNumber,
        sector1Delta: parseFloat((timing.sector1 - refTiming.sector1).toFixed(3)),
        sector2Delta: parseFloat((timing.sector2 - refTiming.sector2).toFixed(3)),
        sector3Delta: parseFloat((timing.sector3 - refTiming.sector3).toFixed(3)),
        totalDelta: parseFloat(((timing.sector1 + timing.sector2 + timing.sector3) - 
                              (refTiming.sector1 + refTiming.sector2 + refTiming.sector3)).toFixed(3)),
      }))
      .sort((a, b) => {
        switch (sortBy) {
          case 'sector1': return a.sector1Delta - b.sector1Delta;
          case 'sector2': return a.sector2Delta - b.sector2Delta;
          case 'sector3': return a.sector3Delta - b.sector3Delta;
          default: return a.totalDelta - b.totalDelta;
        }
      });

    setComparisonData({
      referenceDriver,
      comparisons
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}:${secs.toFixed(3).padStart(6, '0')}` : secs.toFixed(3);
  };

  const formatDelta = (delta: number) => {
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta.toFixed(3)}`;
  };

  const getDeltaColor = (delta: number) => {
    if (Math.abs(delta) < 0.05) return 'text-gray-400';
    return delta > 0 ? 'text-red-400' : 'text-green-400';
  };

  const getDeltaIcon = (delta: number) => {
    if (Math.abs(delta) < 0.05) return <Minus className="w-3 h-3" />;
    return delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getDriverName = (driverNumber: number) => {
    const driver = drivers.find(d => d.driver_number === driverNumber);
    return driver?.name_acronym || `#${driverNumber}`;
  };

  const getTeamColor = (driverNumber: number) => {
    const driver = drivers.find(d => d.driver_number === driverNumber);
    const teamColors: Record<string, string> = {
      'Red Bull Racing': 'bg-blue-600',
      'Mercedes': 'bg-cyan-400',
      'Ferrari': 'bg-red-600',
      'McLaren': 'bg-orange-500',
      'Aston Martin': 'bg-green-600',
      'Alpine': 'bg-pink-500',
      'Williams': 'bg-blue-400',
      'AlphaTauri': 'bg-gray-600',
      'Alfa Romeo': 'bg-red-800',
      'Haas': 'bg-gray-400',
    };
    return teamColors[driver?.team_name || ''] || 'bg-gray-500';
  };

  if (!sectorTimings.length) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No sector timing data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Reference Driver Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-red-400" />
          Sector Analysis
        </h3>
        <div className="flex gap-2">
          <select
            value={referenceDriver || ''}
            onChange={(e) => setReferenceDriver(Number(e.target.value))}
            className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            <option value="">Select Reference</option>
            {sectorTimings.map(timing => (
              <option key={timing.driverNumber} value={timing.driverNumber}>
                {getDriverName(timing.driverNumber)}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            <option value="total">Total Time</option>
            <option value="sector1">Sector 1</option>
            <option value="sector2">Sector 2</option>
            <option value="sector3">Sector 3</option>
          </select>
        </div>
      </div>

      {/* Reference Driver Display */}
      {referenceDriver && (
        <div className="bg-gray-700 rounded-lg p-3 border-l-4 border-yellow-400">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${getTeamColor(referenceDriver)}`}></div>
            <span className="font-semibold text-yellow-400">
              Reference: {getDriverName(referenceDriver)}
            </span>
          </div>
          {(() => {
            const refTiming = sectorTimings.find(t => t.driverNumber === referenceDriver);
            if (!refTiming) return null;
            return (
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xs text-gray-400">S1</div>
                  <div className={`font-mono ${refTiming.sessionBest1 ? 'text-purple-400 font-bold' : ''}`}>
                    {formatTime(refTiming.sector1)}
                    {refTiming.sessionBest1 && <Trophy className="w-3 h-3 inline ml-1" />}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">S2</div>
                  <div className={`font-mono ${refTiming.sessionBest2 ? 'text-purple-400 font-bold' : ''}`}>
                    {formatTime(refTiming.sector2)}
                    {refTiming.sessionBest2 && <Trophy className="w-3 h-3 inline ml-1" />}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">S3</div>
                  <div className={`font-mono ${refTiming.sessionBest3 ? 'text-purple-400 font-bold' : ''}`}>
                    {formatTime(refTiming.sector3)}
                    {refTiming.sessionBest3 && <Trophy className="w-3 h-3 inline ml-1" />}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Total</div>
                  <div className="font-mono font-semibold">
                    {formatTime(refTiming.sector1 + refTiming.sector2 + refTiming.sector3)}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Comparison Data */}
      {comparisonData && (
        <div className="space-y-2">
          {comparisonData.comparisons.map((comparison, index) => (
            <div key={comparison.driverNumber} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-gray-400 text-sm">#{index + 2}</span>
                  <div className={`w-3 h-3 rounded-full ${getTeamColor(comparison.driverNumber)}`}></div>
                  <span className="font-medium">{getDriverName(comparison.driverNumber)}</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${getDeltaColor(comparison.totalDelta)}`}>
                  {getDeltaIcon(comparison.totalDelta)}
                  <span className="font-mono">{formatDelta(comparison.totalDelta)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-gray-500">S1</div>
                  <div className={`font-mono ${getDeltaColor(comparison.sector1Delta)}`}>
                    {formatDelta(comparison.sector1Delta)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">S2</div>
                  <div className={`font-mono ${getDeltaColor(comparison.sector2Delta)}`}>
                    {formatDelta(comparison.sector2Delta)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">S3</div>
                  <div className={`font-mono ${getDeltaColor(comparison.sector3Delta)}`}>
                    {formatDelta(comparison.sector3Delta)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Reference Selected */}
      {!referenceDriver && (
        <div className="text-center py-6 text-gray-400">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select a reference driver to compare sector times</p>
        </div>
      )}
    </div>
  );
}
