'use client';

import { Driver, DriverPosition, TyreData, WeatherData } from '@/types/f1-types';
import { Clock, TrendingUp, AlertTriangle, Thermometer, Fuel, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PitWindowCalculatorProps {
  drivers: Driver[];
  positions: DriverPosition[];
  sessionInfo?: any;
  weather?: WeatherData;
  tyreData?: TyreData[];
}

interface TrackCharacteristics {
  name: string;
  tyreDegradationFactor: number; // 0.5 = low deg, 1.5 = high deg
  underCutAdvantage: number; // seconds gained from undercut
  pitLaneTimeLoss: number; // typical pit stop time loss
  surfaceAbrasiveness: 'low' | 'medium' | 'high';
  thermalDegradation: number; // temperature sensitivity factor
}

interface TyrePerformanceModel {
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
  baseLifespan: number; // optimal laps in ideal conditions
  degradationCurve: 'linear' | 'exponential' | 'cliff';
  temperatureWindow: { min: number; max: number }; // optimal track temp range
  performanceFalloff: number; // % performance loss per lap beyond optimal
  criticalAge: number; // age where performance cliff occurs
}

interface AdvancedPitWindowData {
  driverNumber: number;
  currentTyreAge: number;
  recommendedPitLap: number;
  pitWindowOpen: number;
  pitWindowClose: number;
  tyreCompound: string;
  estimatedLapTime: number;
  degradationRate: number;
  currentPerformance: number; // % of optimal performance
  fuelCorrectedLapTime: number;
  strategy: 'optimal' | 'undercut' | 'overcut' | 'emergency' | 'traffic_management';
  strategicFactors: {
    underCutOpportunity: boolean;
    trafficAhead: boolean;
    weatherThreat: boolean;
    fuelSaving: boolean;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  alternativeStrategies: {
    conservative: number;
    aggressive: number;
    weatherHedge?: number;
  };
}

// Track characteristics database - in real implementation, this would be dynamic
const TRACK_CHARACTERISTICS: Record<string, TrackCharacteristics> = {
  'monaco': {
    name: 'Monaco',
    tyreDegradationFactor: 0.6,
    underCutAdvantage: 18,
    pitLaneTimeLoss: 22,
    surfaceAbrasiveness: 'low',
    thermalDegradation: 0.8
  },
  'silverstone': {
    name: 'Silverstone',
    tyreDegradationFactor: 1.2,
    underCutAdvantage: 20,
    pitLaneTimeLoss: 19,
    surfaceAbrasiveness: 'high',
    thermalDegradation: 1.3
  },
  'spa': {
    name: 'Spa-Francorchamps',
    tyreDegradationFactor: 0.9,
    underCutAdvantage: 25,
    pitLaneTimeLoss: 23,
    surfaceAbrasiveness: 'medium',
    thermalDegradation: 1.0
  },
  'default': {
    name: 'Default Circuit',
    tyreDegradationFactor: 1.0,
    underCutAdvantage: 20,
    pitLaneTimeLoss: 21,
    surfaceAbrasiveness: 'medium',
    thermalDegradation: 1.1
  }
};

// Tyre performance models based on Pirelli compounds
const TYRE_MODELS: Record<string, TyrePerformanceModel> = {
  'SOFT': {
    compound: 'SOFT',
    baseLifespan: 25,
    degradationCurve: 'exponential',
    temperatureWindow: { min: 30, max: 45 },
    performanceFalloff: 0.08,
    criticalAge: 20
  },
  'MEDIUM': {
    compound: 'MEDIUM',
    baseLifespan: 35,
    degradationCurve: 'linear',
    temperatureWindow: { min: 25, max: 50 },
    performanceFalloff: 0.05,
    criticalAge: 30
  },
  'HARD': {
    compound: 'HARD',
    baseLifespan: 50,
    degradationCurve: 'cliff',
    temperatureWindow: { min: 35, max: 55 },
    performanceFalloff: 0.03,
    criticalAge: 45
  },
  'INTERMEDIATE': {
    compound: 'INTERMEDIATE',
    baseLifespan: 40,
    degradationCurve: 'linear',
    temperatureWindow: { min: 15, max: 30 },
    performanceFalloff: 0.06,
    criticalAge: 35
  },
  'WET': {
    compound: 'WET',
    baseLifespan: 30,
    degradationCurve: 'linear',
    temperatureWindow: { min: 10, max: 25 },
    performanceFalloff: 0.07,
    criticalAge: 25
  }
};

export function PitWindowCalculator({ drivers, positions, sessionInfo, weather, tyreData }: PitWindowCalculatorProps) {
  const [pitWindows, setPitWindows] = useState<AdvancedPitWindowData[]>([]);
  const [currentLap, setCurrentLap] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<string>('default');

  // Advanced pit window calculation with realistic F1 strategy models
  useEffect(() => {
    const calculateAdvancedPitWindows = () => {
      if (!drivers || drivers.length === 0) return;

      const totalLaps = sessionInfo?.total_laps || 70;
      const currentRaceLap = sessionInfo?.current_lap || currentLap;
      const trackTemp = weather?.track_temperature || 35;
      const trackCharacteristics = TRACK_CHARACTERISTICS[selectedTrack] || TRACK_CHARACTERISTICS['default'];      const windows: AdvancedPitWindowData[] = drivers.map((driver) => {
        // Try to get real tyre data for this driver
        const realTyreData = tyreData?.find(tyre => tyre.driver_number === driver.driver_number);
        
        let currentAge: number;
        let currentCompound: string;
        let seed = driver.driver_number; // Keep seed for other calculations
        
        if (realTyreData) {
          // Use real tyre data
          currentAge = realTyreData.age;
          currentCompound = realTyreData.compound;
        } else {
          // Use deterministic mock data with more sophisticated models (fallback)
          const baseAge = Math.floor((Math.sin(seed * 17) * 0.5 + 0.5) * 25) + 1;
          currentAge = Math.min(baseAge + Math.floor(currentRaceLap / 3), 50);
          
          const compounds = ['SOFT', 'MEDIUM', 'HARD'];
          const compoundIndex = Math.floor((Math.sin(seed * 23) * 0.5 + 0.5) * compounds.length);
          currentCompound = compounds[compoundIndex];
        }
        
        const tyreModel = TYRE_MODELS[currentCompound];

        // Calculate temperature-adjusted degradation
        const tempDelta = Math.abs(trackTemp - ((tyreModel.temperatureWindow.min + tyreModel.temperatureWindow.max) / 2));
        const tempFactor = 1 + (tempDelta * trackCharacteristics.thermalDegradation * 0.02);
        
        // Non-linear degradation calculation
        let degradationRate: number;
        let currentPerformance: number;
        
        switch (tyreModel.degradationCurve) {
          case 'exponential':
            degradationRate = Math.pow(currentAge / tyreModel.baseLifespan, 1.8) * trackCharacteristics.tyreDegradationFactor * tempFactor;
            currentPerformance = Math.max(0.7, 1 - (degradationRate * tyreModel.performanceFalloff));
            break;
          case 'cliff':
            if (currentAge < tyreModel.criticalAge) {
              degradationRate = (currentAge / tyreModel.baseLifespan) * 0.8 * trackCharacteristics.tyreDegradationFactor;
              currentPerformance = Math.max(0.85, 1 - (degradationRate * tyreModel.performanceFalloff));
            } else {
              degradationRate = 2.5 * trackCharacteristics.tyreDegradationFactor * tempFactor;
              currentPerformance = Math.max(0.6, 0.85 - ((currentAge - tyreModel.criticalAge) * 0.05));
            }
            break;
          default: // linear
            degradationRate = (currentAge / tyreModel.baseLifespan) * trackCharacteristics.tyreDegradationFactor * tempFactor;
            currentPerformance = Math.max(0.75, 1 - (degradationRate * tyreModel.performanceFalloff));
        }

        // Fuel-corrected lap time (lighter car = faster times)
        const baseLapTime = 85.5 + (Math.sin(seed * 41) * 0.5 + 0.5) * 3;
        const fuelLoad = Math.max(0, (totalLaps - currentRaceLap) * 0.12); // kg per lap consumption
        const fuelCorrectedTime = baseLapTime - (fuelLoad * 0.035); // ~0.035s per kg
        const performanceCorrectedTime = fuelCorrectedTime * (2 - currentPerformance);

        // Strategic factors analysis
        const currentPosition = positions.find(p => p.driver_number === driver.driver_number)?.position || seed;
        const driversAhead = positions.filter(p => p.position < currentPosition && p.position > 0).length;
          const strategicFactors = {
          underCutOpportunity: driversAhead > 0 && currentAge > 8 && degradationRate > 1.2,
          trafficAhead: driversAhead >= 3,
          weatherThreat: (weather?.rainfall || 0) > 0 || (weather?.humidity || 0) > 85,
          fuelSaving: currentPerformance > 0.9 && currentAge < tyreModel.baseLifespan * 0.6
        };

        // Calculate optimal pit window with strategic considerations
        let baseOptimalLap = Math.max(5, Math.min(totalLaps - 5, 
          currentRaceLap + (tyreModel.baseLifespan * (1 - degradationRate) * trackCharacteristics.tyreDegradationFactor)
        ));

        // Adjust for strategic factors
        if (strategicFactors.underCutOpportunity) baseOptimalLap -= 3;
        if (strategicFactors.trafficAhead) baseOptimalLap += 2;
        if (strategicFactors.weatherThreat) baseOptimalLap -= 5;
        if (strategicFactors.fuelSaving) baseOptimalLap += 3;

        const windowSize = Math.max(4, Math.min(12, tyreModel.baseLifespan * 0.3));
        
        // Determine primary strategy
        let strategy: AdvancedPitWindowData['strategy'] = 'optimal';
        if (currentPerformance < 0.75 || currentAge > tyreModel.criticalAge) {
          strategy = 'emergency';
        } else if (strategicFactors.underCutOpportunity && !strategicFactors.trafficAhead) {
          strategy = 'undercut';
        } else if (strategicFactors.trafficAhead || strategicFactors.fuelSaving) {
          strategy = 'overcut';
        } else if (driversAhead >= 5) {
          strategy = 'traffic_management';
        }

        // Risk assessment
        let riskLevel: AdvancedPitWindowData['riskLevel'] = 'low';
        if (currentPerformance < 0.8 || currentAge > tyreModel.criticalAge * 0.9) riskLevel = 'high';
        else if (currentPerformance < 0.9 || degradationRate > 1.5) riskLevel = 'medium';
        if (currentPerformance < 0.7) riskLevel = 'critical';

        // Alternative strategies
        const alternativeStrategies = {
          conservative: Math.min(totalLaps - 3, baseOptimalLap + 5),
          aggressive: Math.max(currentRaceLap + 2, baseOptimalLap - 4),
          ...(strategicFactors.weatherThreat && { weatherHedge: Math.max(currentRaceLap + 1, baseOptimalLap - 8) })
        };

        return {
          driverNumber: driver.driver_number,
          currentTyreAge: currentAge,
          recommendedPitLap: Math.round(baseOptimalLap),
          pitWindowOpen: Math.max(1, Math.round(baseOptimalLap - windowSize / 2)),
          pitWindowClose: Math.min(totalLaps, Math.round(baseOptimalLap + windowSize / 2)),
          tyreCompound: currentCompound,
          estimatedLapTime: performanceCorrectedTime,
          degradationRate,
          currentPerformance,
          fuelCorrectedLapTime: fuelCorrectedTime,
          strategy,
          strategicFactors,
          riskLevel,
          alternativeStrategies
        };
      });

      setPitWindows(windows.sort((a, b) => a.recommendedPitLap - b.recommendedPitLap));
    };

    calculateAdvancedPitWindows();
    
    // Update every 15 seconds for more responsive strategy updates
    const interval = setInterval(calculateAdvancedPitWindows, 15000);
    return () => clearInterval(interval);
  }, [drivers, sessionInfo, currentLap, weather, selectedTrack, positions, tyreData]);
  const getStrategyColor = (strategy: AdvancedPitWindowData['strategy']): string => {
    switch (strategy) {
      case 'optimal': return 'text-green-400 bg-green-400/10';
      case 'undercut': return 'text-blue-400 bg-blue-400/10';
      case 'overcut': return 'text-purple-400 bg-purple-400/10';
      case 'traffic_management': return 'text-orange-400 bg-orange-400/10';
      case 'emergency': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getRiskColor = (risk: AdvancedPitWindowData['riskLevel']): string => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
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
      {/* Header with controls */}      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Advanced Pit Strategy</h3>
          {tyreData && tyreData.length > 0 && (
            <div className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-300">
              LIVE DATA
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              {weather?.track_temperature || 35}°C
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Lap {currentLap}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-3">
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
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-300">Track:</label>
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
          >
            <option value="default">Default Circuit</option>
            <option value="monaco">Monaco</option>
            <option value="silverstone">Silverstone</option>
            <option value="spa">Spa-Francorchamps</option>
          </select>
        </div>
      </div>

      {/* Pit windows list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {pitWindows.map((window) => {
          const driver = drivers.find(d => d.driver_number === window.driverNumber);
          const isInWindow = currentLap >= window.pitWindowOpen && currentLap <= window.pitWindowClose;
          const isPastWindow = currentLap > window.pitWindowClose;
          const isUrgent = window.riskLevel === 'critical' || window.strategy === 'emergency';
          
          return (
            <div
              key={window.driverNumber}
              className={`p-4 rounded-lg border transition-all ${
                isInWindow 
                  ? 'border-green-500 bg-green-500/5' 
                  : isPastWindow 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : isUrgent
                      ? 'border-red-500 bg-red-500/10 animate-pulse'
                      : 'border-gray-600 bg-gray-700/50'
              }`}
            >
              {/* Driver header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {driver?.name_acronym || `#${window.driverNumber}`}
                  </div>
                  <div className={`px-2 py-1 text-xs rounded ${getStrategyColor(window.strategy)}`}>
                    {window.strategy.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className={`text-xs font-medium ${getRiskColor(window.riskLevel)}`}>
                    {window.riskLevel.toUpperCase()} RISK
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div 
                      className={`w-3 h-3 rounded-full ${getTyreCompoundColor(window.tyreCompound)}`}
                      title={window.tyreCompound}
                    />
                    <span className="text-xs text-gray-400">{window.currentTyreAge} laps</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {(window.currentPerformance * 100).toFixed(0)}% perf
                  </div>
                </div>
              </div>

              {/* Performance metrics */}
              <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
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
                <div>
                  <div className="text-gray-400">Lap Time</div>
                  <div className="font-medium">
                    {window.estimatedLapTime.toFixed(2)}s
                  </div>
                </div>
              </div>

              {/* Strategic factors */}
              <div className="flex flex-wrap gap-2 mb-2">
                {window.strategicFactors.underCutOpportunity && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                    <Zap className="w-3 h-3" />
                    <span>Undercut</span>
                  </div>
                )}
                {window.strategicFactors.trafficAhead && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-orange-500/20 rounded text-xs text-orange-300">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Traffic</span>
                  </div>
                )}
                {window.strategicFactors.weatherThreat && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                    <Thermometer className="w-3 h-3" />
                    <span>Weather</span>
                  </div>
                )}
                {window.strategicFactors.fuelSaving && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-300">
                    <Fuel className="w-3 h-3" />
                    <span>Fuel Save</span>
                  </div>
                )}
              </div>

              {/* Alternative strategies */}
              <div className="text-xs text-gray-400">
                <span>Alt: Conservative L{window.alternativeStrategies.conservative} | 
                Aggressive L{window.alternativeStrategies.aggressive}</span>
                {window.alternativeStrategies.weatherHedge && (
                  <span> | Weather L{window.alternativeStrategies.weatherHedge}</span>
                )}
              </div>

              {/* Status messages */}
              {isUrgent && (
                <div className="flex items-center space-x-2 mt-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">
                    {window.strategy === 'emergency' 
                      ? 'Critical tyre degradation - pit immediately!' 
                      : 'High risk situation - monitor closely'}
                  </span>
                </div>
              )}

              {isInWindow && !isUrgent && (
                <div className="flex items-center space-x-2 mt-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Pit window open - optimal time to pit</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced strategy summary */}
      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
        <div className="text-sm font-medium mb-3">Strategy Overview</div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-gray-400">In pit window</div>
            <div className="font-medium text-green-400">
              {pitWindows.filter(w => currentLap >= w.pitWindowOpen && currentLap <= w.pitWindowClose).length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">High risk</div>
            <div className="font-medium text-red-400">
              {pitWindows.filter(w => w.riskLevel === 'high' || w.riskLevel === 'critical').length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Strategic moves</div>
            <div className="font-medium text-blue-400">
              {pitWindows.filter(w => w.strategy === 'undercut' || w.strategy === 'overcut').length}
            </div>
          </div>
        </div>
        
        {/* Track characteristics info */}
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="text-gray-400 text-xs mb-1">Track Characteristics</div>
          <div className="text-xs">
            Degradation: {(TRACK_CHARACTERISTICS[selectedTrack]?.tyreDegradationFactor || 1).toFixed(1)}x | 
            Undercut: +{TRACK_CHARACTERISTICS[selectedTrack]?.underCutAdvantage || 20}s | 
            Pit Loss: {TRACK_CHARACTERISTICS[selectedTrack]?.pitLaneTimeLoss || 21}s
          </div>
        </div>
      </div>
    </div>
  );
}
