'use client';

import { Driver, DriverPosition, TyreData, WeatherData, SessionInfo } from '@/types/f1-types';
import { Target, Clock, Zap, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RaceStrategyOverviewProps {
  drivers: Driver[];
  positions: DriverPosition[];
  tyreData?: TyreData[];
  weather?: WeatherData;
  sessionInfo?: SessionInfo | null;
  selectedDrivers?: number[];
}

interface StrategyRecommendation {
  driverNumber: number;
  currentStrategy: 'Aggressive' | 'Conservative' | 'Opportunistic' | 'Reactive';
  nextPitWindow: {
    optimal: number;
    earliest: number;
    latest: number;
  };
  tyreRecommendation: 'Soft' | 'Medium' | 'Hard' | 'Intermediate' | 'Wet';
  riskLevel: 'Low' | 'Medium' | 'High';
  keyFactors: string[];
  expectedOutcome: {
    position: number;
    confidence: number; // 0-100%
  };
  alternativeStrategies: Array<{
    name: string;
    description: string;
    pros: string[];
    cons: string[];
  }>;
}

export function RaceStrategyOverview({ 
  drivers, 
  positions, 
  tyreData, 
  weather, 
  sessionInfo,
  selectedDrivers 
}: RaceStrategyOverviewProps) {
  const [strategies, setStrategies] = useState<StrategyRecommendation[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [currentLap, setCurrentLap] = useState(1);
  const [weatherForecast, setWeatherForecast] = useState<'Dry' | 'Light Rain' | 'Heavy Rain'>('Dry');

  useEffect(() => {
    generateStrategyRecommendations();
  }, [drivers, positions, tyreData, weather, sessionInfo, currentLap, weatherForecast]);

  const generateStrategyRecommendations = () => {
    if (!drivers || drivers.length === 0) return;

    const totalLaps = sessionInfo?.totalLaps || 70;
    const driversToAnalyze = selectedDrivers && selectedDrivers.length > 0 
      ? drivers.filter(d => selectedDrivers.includes(d.driver_number))
      : drivers.slice(0, 8);

    const recommendations: StrategyRecommendation[] = driversToAnalyze.map((driver) => {
      const position = positions.find(p => p.driver_number === driver.driver_number);
      const tyres = tyreData?.find(t => t.driver_number === driver.driver_number);
      const currentPosition = position?.position || Math.floor(Math.random() * 20) + 1;
      const lapsSinceLastPit = Math.floor(Math.random() * 25) + 5;

      // Determine current strategy based on position and circumstances
      let currentStrategy: StrategyRecommendation['currentStrategy'];
      if (currentPosition <= 3) {
        currentStrategy = 'Conservative';
      } else if (currentPosition <= 10) {
        currentStrategy = 'Opportunistic';
      } else if (currentPosition <= 15) {
        currentStrategy = 'Aggressive';
      } else {
        currentStrategy = 'Reactive';
      }

      // Calculate pit window
      const baseStintLength = 25;
      const tyrePerformanceDrop = lapsSinceLastPit * 0.1;
      const weatherImpact = weather?.rainfall ? -5 : 0;
      
      const optimalPitLap = currentLap + Math.max(5, baseStintLength - lapsSinceLastPit + weatherImpact);
      const earliestPitLap = Math.max(currentLap + 3, optimalPitLap - 5);
      const latestPitLap = Math.min(totalLaps - 5, optimalPitLap + 8);

      // Tyre recommendation based on conditions
      let tyreRecommendation: StrategyRecommendation['tyreRecommendation'];
      if (weather?.rainfall && weather.rainfall > 0.5) {
        tyreRecommendation = weather.rainfall > 2 ? 'Wet' : 'Intermediate';
      } else {
        const trackTemp = weather?.track_temperature || 35;
        const remainingLaps = totalLaps - currentLap;
        
        if (trackTemp > 45 || remainingLaps > 30) {
          tyreRecommendation = 'Hard';
        } else if (trackTemp < 25 || remainingLaps < 15) {
          tyreRecommendation = 'Soft';
        } else {
          tyreRecommendation = 'Medium';
        }
      }

      // Risk assessment
      let riskLevel: StrategyRecommendation['riskLevel'];
      if (currentPosition <= 5 && currentStrategy === 'Conservative') {
        riskLevel = 'Low';
      } else if (currentPosition > 15 || currentStrategy === 'Aggressive') {
        riskLevel = 'High';
      } else {
        riskLevel = 'Medium';
      }

      // Key factors
      const keyFactors = [];
      if (weather?.rainfall) keyFactors.push('Weather conditions changing');
      if (lapsSinceLastPit > 20) keyFactors.push('Tyre degradation high');
      if (currentPosition <= 3) keyFactors.push('Championship position critical');
      if (currentLap > totalLaps * 0.8) keyFactors.push('Late-race phase');
      if (weatherForecast !== 'Dry') keyFactors.push('Rain forecast');

      // Expected outcome
      const positionChange = currentStrategy === 'Aggressive' ? -2 : 
                           currentStrategy === 'Conservative' ? 1 : 0;
      const expectedPosition = Math.max(1, Math.min(20, currentPosition + positionChange));
      const confidence = riskLevel === 'Low' ? 85 : riskLevel === 'Medium' ? 70 : 55;

      // Alternative strategies
      const alternativeStrategies = [
        {
          name: 'One-Stop Strategy',
          description: 'Single pit stop with hard tyres for long stint',
          pros: ['Lower time loss', 'Track position advantage', 'Less complexity'],
          cons: ['Higher tyre degradation', 'Vulnerable to undercuts', 'Performance drop in final laps']
        },
        {
          name: 'Two-Stop Strategy',
          description: 'Two pit stops with medium/soft tyres',
          pros: ['Better tyre performance', 'Flexibility for undercuts', 'Consistent pace'],
          cons: ['More time lost in pits', 'Traffic exposure', 'Track position loss']
        },
        {
          name: 'Offset Strategy',
          description: 'Opposite strategy to main competitors',
          pros: ['Strategic flexibility', 'Different track conditions', 'Overtaking opportunities'],
          cons: ['Higher risk', 'Requires perfect execution', 'Weather dependent']
        }
      ];

      return {
        driverNumber: driver.driver_number,
        currentStrategy,
        nextPitWindow: {
          optimal: optimalPitLap,
          earliest: earliestPitLap,
          latest: latestPitLap
        },
        tyreRecommendation,
        riskLevel,
        keyFactors,
        expectedOutcome: {
          position: expectedPosition,
          confidence
        },
        alternativeStrategies
      };
    });

    setStrategies(recommendations);
    
    // Auto-select first driver if none selected
    if (!selectedDriver && recommendations.length > 0) {
      setSelectedDriver(recommendations[0].driverNumber);
    }
  };

  const getDriverName = (driverNumber: number) => {
    const driver = drivers.find(d => d.driver_number === driverNumber);
    return driver?.name_acronym || `#${driverNumber}`;
  };

  const getDriverFullName = (driverNumber: number) => {
    const driver = drivers.find(d => d.driver_number === driverNumber);
    return driver?.full_name || `Driver #${driverNumber}`;
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
      'Racing Bulls': 'bg-indigo-500',
      'Kick Sauber': 'bg-red-800',
      'Haas': 'bg-gray-400',
    };
    return teamColors[driver?.team_name || ''] || 'bg-gray-500';
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'Aggressive': return 'text-red-400';
      case 'Conservative': return 'text-green-400';
      case 'Opportunistic': return 'text-yellow-400';
      case 'Reactive': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      case 'Medium': return <AlertTriangle className="w-4 h-4" />;
      case 'High': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const selectedStrategy = strategies.find(s => s.driverNumber === selectedDriver);

  if (!strategies.length) {
    return (
      <div className="text-center py-8">
        <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No strategy data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-red-400" />
          Race Strategy
        </h3>
        <div className="flex gap-2">
          <select
            value={selectedDriver || ''}
            onChange={(e) => setSelectedDriver(Number(e.target.value))}
            className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            {strategies.map(strategy => (
              <option key={strategy.driverNumber} value={strategy.driverNumber}>
                {getDriverName(strategy.driverNumber)}
              </option>
            ))}
          </select>
          <select
            value={weatherForecast}
            onChange={(e) => setWeatherForecast(e.target.value as typeof weatherForecast)}
            className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            <option value="Dry">Dry Forecast</option>
            <option value="Light Rain">Light Rain</option>
            <option value="Heavy Rain">Heavy Rain</option>
          </select>
        </div>
      </div>

      {/* Strategy Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {strategies.slice(0, 4).map((strategy) => (
          <div 
            key={strategy.driverNumber}
            onClick={() => setSelectedDriver(strategy.driverNumber)}
            className={`bg-gray-800 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-750 ${
              selectedDriver === strategy.driverNumber ? 'ring-2 ring-red-400' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${getTeamColor(strategy.driverNumber)}`}></div>
              <span className="font-medium">{getDriverName(strategy.driverNumber)}</span>
              <div className={`flex items-center gap-1 ml-auto ${getRiskColor(strategy.riskLevel)}`}>
                {getRiskIcon(strategy.riskLevel)}
                <span className="text-xs">{strategy.riskLevel}</span>
              </div>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Strategy:</span>
                <span className={getStrategyColor(strategy.currentStrategy)}>
                  {strategy.currentStrategy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Next Pit:</span>
                <span>Lap {strategy.nextPitWindow.optimal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expected P:</span>
                <span className="font-semibold">P{strategy.expectedOutcome.position}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Strategy Analysis */}
      {selectedStrategy && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getTeamColor(selectedStrategy.driverNumber)}`}></div>
            <h4 className="text-lg font-semibold">{getDriverFullName(selectedStrategy.driverNumber)}</h4>
            <span className={`px-2 py-1 rounded text-xs ${getStrategyColor(selectedStrategy.currentStrategy)}`}>
              {selectedStrategy.currentStrategy} Strategy
            </span>
          </div>

          {/* Pit Window Details */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pit Window Analysis
            </h5>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-400">Earliest</div>
                <div className="font-semibold">Lap {selectedStrategy.nextPitWindow.earliest}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Optimal</div>
                <div className="font-semibold text-green-400">Lap {selectedStrategy.nextPitWindow.optimal}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Latest</div>
                <div className="font-semibold">Lap {selectedStrategy.nextPitWindow.latest}</div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-400">Recommended: </span>
              <span className="font-medium">{selectedStrategy.tyreRecommendation} Compound</span>
            </div>
          </div>

          {/* Key Factors */}
          {selectedStrategy.keyFactors.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Key Strategy Factors</h5>
              <div className="space-y-1">
                {selectedStrategy.keyFactors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expected Outcome */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Expected Outcome
            </h5>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">P{selectedStrategy.expectedOutcome.position}</div>
                <div className="text-sm text-gray-400">Predicted Position</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {selectedStrategy.expectedOutcome.confidence}%
                </div>
                <div className="text-sm text-gray-400">Confidence</div>
              </div>
            </div>
          </div>

          {/* Alternative Strategies */}
          <div>
            <h5 className="font-medium mb-3">Alternative Strategies</h5>
            <div className="space-y-3">
              {selectedStrategy.alternativeStrategies.map((alt, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <h6 className="font-medium mb-1">{alt.name}</h6>
                  <p className="text-sm text-gray-300 mb-2">{alt.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-green-400 font-medium mb-1">Pros:</div>
                      <ul className="space-y-1">
                        {alt.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-green-400 mt-0.5">+</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-red-400 font-medium mb-1">Cons:</div>
                      <ul className="space-y-1">
                        {alt.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">-</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
