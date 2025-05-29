'use client';

import { Driver, DriverPosition, TyreData, WeatherData, CarData } from '@/types/f1-types';
import { Clock, TrendingUp, TrendingDown, Target, Zap, Gauge } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LapTimePredictorProps {
  drivers: Driver[];
  positions: DriverPosition[];
  carData: Record<number, CarData>;
  weather?: WeatherData;
  tyreData?: TyreData[];
  sessionInfo?: any;
}

interface LapTimePrediction {
  driverNumber: number;
  currentLapTime: number;
  predictedLapTime: number;
  improvementPotential: number; // seconds that could be gained
  factors: {
    tyrePerformance: number; // 0-1 scale
    fuelLoad: number; // kg
    weatherImpact: number; // seconds
    trackEvolution: number; // seconds
    drsAvailable: boolean;
    ersDeployment: number; // 0-1 scale
  };
  confidence: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'degrading';
}

export function LapTimePredictor({ drivers, positions, carData, weather, tyreData, sessionInfo }: LapTimePredictorProps) {
  const [predictions, setPredictions] = useState<LapTimePrediction[]>([]);
  const [currentLap, setCurrentLap] = useState(1);

  useEffect(() => {
    const calculateLapTimePredictions = () => {
      if (!drivers || drivers.length === 0) return;

      const currentRaceLap = sessionInfo?.current_lap || currentLap;
      const totalLaps = sessionInfo?.total_laps || 70;
      const trackTemp = weather?.track_temperature || 35;
      const rainfall = weather?.rainfall || 0;

      const newPredictions: LapTimePrediction[] = drivers.map((driver) => {
        const driverCarData = carData[driver.driver_number];
        const driverTyreData = tyreData?.find(t => t.driver_number === driver.driver_number);
        
        // Base lap time calculation (mock realistic times)
        const seed = driver.driver_number;
        const baseLapTime = 85.5 + (Math.sin(seed * 41) * 0.5 + 0.5) * 3; // 85.5-88.5s range
        
        // Tyre performance factor
        let tyrePerformance = 1.0;
        if (driverTyreData) {
          const agePerformanceFactor = Math.max(0.85, 1 - (driverTyreData.age * 0.008));
          const compoundPerformance = {
            'SOFT': 1.0,
            'MEDIUM': 0.98,
            'HARD': 0.96,
            'INTERMEDIATE': rainfall > 0 ? 1.02 : 0.88,
            'WET': rainfall > 5 ? 1.05 : 0.82
          };
          tyrePerformance = agePerformanceFactor * (compoundPerformance[driverTyreData.compound] || 0.98);
        }

        // Fuel load calculation (lighter = faster)
        const remainingLaps = Math.max(0, totalLaps - currentRaceLap);
        const fuelLoad = remainingLaps * 1.2; // ~1.2kg per lap
        const fuelTimeImpact = fuelLoad * 0.035; // ~0.035s per kg

        // Weather impact
        let weatherImpact = 0;
        if (rainfall > 0) {
          weatherImpact = Math.min(5, rainfall * 0.8); // Up to 5s slower in heavy rain
        }
        if (trackTemp < 20 || trackTemp > 50) {
          weatherImpact += Math.abs(trackTemp - 35) * 0.05; // Temperature penalty
        }

        // Track evolution (track gets faster over time)
        const trackEvolution = Math.max(-1.5, -currentRaceLap * 0.02); // Track improves by ~0.02s per lap

        // DRS availability (simplified)
        const currentPosition = positions.find(p => p.driver_number === driver.driver_number)?.position || seed;
        const drsAvailable = currentPosition > 1 && currentPosition <= 20;

        // ERS deployment simulation
        const ersDeployment = driverCarData?.throttle ? (driverCarData.throttle / 100) * 0.8 : 0.6;

        // Calculate predicted lap time
        const currentLapTime = baseLapTime + fuelTimeImpact + weatherImpact;
        let predictedLapTime = baseLapTime * tyrePerformance + fuelTimeImpact + weatherImpact + trackEvolution;
        
        if (drsAvailable) predictedLapTime -= 0.3; // DRS advantage
        if (ersDeployment > 0.7) predictedLapTime -= 0.2; // ERS boost

        const improvementPotential = Math.max(0, currentLapTime - predictedLapTime);

        // Determine confidence level
        let confidence: LapTimePrediction['confidence'] = 'medium';
        if (driverTyreData && driverCarData && weather) confidence = 'high';
        else if (!driverTyreData && !driverCarData) confidence = 'low';

        // Determine trend
        let trend: LapTimePrediction['trend'] = 'stable';
        if (tyrePerformance < 0.95 || (driverTyreData?.age || 0) > 20) trend = 'degrading';
        else if (trackEvolution < -0.5 || ersDeployment > 0.8) trend = 'improving';

        return {
          driverNumber: driver.driver_number,
          currentLapTime,
          predictedLapTime,
          improvementPotential,
          factors: {
            tyrePerformance,
            fuelLoad,
            weatherImpact,
            trackEvolution,
            drsAvailable,
            ersDeployment
          },
          confidence,
          trend
        };
      });

      setPredictions(newPredictions.sort((a, b) => a.predictedLapTime - b.predictedLapTime));
    };

    calculateLapTimePredictions();
    const interval = setInterval(calculateLapTimePredictions, 10000);
    return () => clearInterval(interval);
  }, [drivers, carData, weather, tyreData, sessionInfo, currentLap, positions]);

  const getTrendColor = (trend: LapTimePrediction['trend']): string => {
    switch (trend) {
      case 'improving': return 'text-green-400';
      case 'degrading': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend: LapTimePrediction['trend']) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4" />;
      case 'degrading': return <TrendingDown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: LapTimePrediction['confidence']): string => {
    switch (confidence) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No driver data available for lap time predictions
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gauge className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Lap Time Predictor</h3>
          {weather && (
            <div className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
              AI POWERED
            </div>
          )}
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
          className="w-20 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Predictions list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {predictions.map((prediction, index) => {
          const driver = drivers.find(d => d.driver_number === prediction.driverNumber);
          const isTopPerformer = index < 3;
          
          return (
            <div
              key={prediction.driverNumber}
              className={`p-4 rounded-lg border transition-all ${
                isTopPerformer 
                  ? 'border-purple-500 bg-purple-500/5' 
                  : 'border-gray-600 bg-gray-700/50'
              }`}
            >
              {/* Driver header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {driver?.name_acronym || `#${prediction.driverNumber}`}
                  </div>
                  <div className={`flex items-center space-x-1 ${getTrendColor(prediction.trend)}`}>
                    {getTrendIcon(prediction.trend)}
                    <span className="text-xs font-medium">{prediction.trend.toUpperCase()}</span>
                  </div>
                  <div className={`text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence.toUpperCase()} CONF
                  </div>
                </div>
                {index === 0 && (
                  <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded font-bold">
                    FASTEST
                  </div>
                )}
              </div>

              {/* Lap time predictions */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div>
                  <div className="text-gray-400">Current</div>
                  <div className="font-medium">{prediction.currentLapTime.toFixed(3)}s</div>
                </div>
                <div>
                  <div className="text-gray-400">Predicted</div>
                  <div className="font-medium text-purple-400">{prediction.predictedLapTime.toFixed(3)}s</div>
                </div>
                <div>
                  <div className="text-gray-400">Potential</div>
                  <div className="font-medium text-green-400">
                    -{prediction.improvementPotential.toFixed(3)}s
                  </div>
                </div>
              </div>

              {/* Performance factors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tyre Performance:</span>
                  <span className="font-medium">{(prediction.factors.tyrePerformance * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fuel Load:</span>
                  <span className="font-medium">{prediction.factors.fuelLoad.toFixed(1)}kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weather Impact:</span>
                  <span className="font-medium">+{prediction.factors.weatherImpact.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Track Evolution:</span>
                  <span className="font-medium text-green-400">{prediction.factors.trackEvolution.toFixed(2)}s</span>
                </div>
              </div>

              {/* Performance aids */}
              <div className="flex flex-wrap gap-2 mt-2">
                {prediction.factors.drsAvailable && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                    <Zap className="w-3 h-3" />
                    <span>DRS</span>
                  </div>
                )}
                {prediction.factors.ersDeployment > 0.7 && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 rounded text-xs text-yellow-300">
                    <Zap className="w-3 h-3" />
                    <span>ERS+</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
        <div className="text-sm font-medium mb-2">Prediction Summary</div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-gray-400">Fastest Predicted</div>
            <div className="font-medium text-purple-400">
              {predictions[0]?.predictedLapTime.toFixed(3)}s
            </div>
          </div>
          <div>
            <div className="text-gray-400">Track Evolution</div>
            <div className="font-medium text-green-400">
              {predictions[0]?.factors.trackEvolution.toFixed(2)}s/lap
            </div>
          </div>
          <div>
            <div className="text-gray-400">Weather Factor</div>
            <div className="font-medium">
              +{(predictions.reduce((sum, p) => sum + p.factors.weatherImpact, 0) / predictions.length).toFixed(2)}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
