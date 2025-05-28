'use client';

import { Driver, DriverPosition } from '@/types/f1-types';
import { TrendingUp, TrendingDown, Minus, Trophy, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PositionChangeProps {
  drivers: Driver[];
  positions: DriverPosition[];
}

interface PositionHistory {
  driverNumber: number;
  currentPosition: number;
  previousPosition: number;
  positionChange: number;
  trend: 'up' | 'down' | 'stable';
  fastestLap: boolean;
  battles: number[];
}

export function PositionChanges({ drivers, positions }: PositionChangeProps) {
  const [positionHistory, setPositionHistory] = useState<PositionHistory[]>([]);
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);

  useEffect(() => {
    if (!drivers || !positions || drivers.length === 0) return;    // Generate position history with deterministic mock data
    const history: PositionHistory[] = drivers.map((driver, index) => {
      const currentPos = index + 1;
      const seed = driver.driver_number;
      const randomDirection = Math.sin(seed * 17) > 0 ? 1 : -1;
      const randomMagnitude = Math.floor((Math.sin(seed * 23) * 0.5 + 0.5) * 3);
      const previousPos = currentPos + randomDirection * randomMagnitude;
      const change = previousPos - currentPos;
      
      return {
        driverNumber: driver.driver_number,
        currentPosition: currentPos,
        previousPosition: Math.max(1, Math.min(20, previousPos)),
        positionChange: change,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        fastestLap: Math.sin(seed * 31) > 0.7, // 15% chance of fastest lap
        battles: Math.sin(seed * 37) > 0.4 ? [driver.driver_number + 1] : [] // 30% chance of battle
      };
    });

    setPositionHistory(history.sort((a, b) => a.currentPosition - b.currentPosition));
  }, [drivers, positions]);

  const getPositionChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getPositionChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400 bg-green-400/10';
    if (change < 0) return 'text-red-400 bg-red-400/10';
    return 'text-gray-400 bg-gray-400/10';
  };

  const getTeamColor = (driverNumber: number): string => {
    const colors = [
      '#1E3A8A', '#059669', '#DC2626', '#EA580C', '#2563EB',
      '#6366F1', '#065F46', '#1D4ED8', '#991B1B', '#78716C'
    ];
    return colors[(driverNumber - 1) % colors.length];
  };

  const filteredHistory = showOnlyChanges 
    ? positionHistory.filter(h => h.positionChange !== 0 || h.battles.length > 0 || h.fastestLap)
    : positionHistory;

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No position data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Position Changes</h3>
        </div>
        <label className="flex items-center space-x-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showOnlyChanges}
            onChange={(e) => setShowOnlyChanges(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
          />
          <span>Show only changes</span>
        </label>
      </div>

      {/* Position changes list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredHistory.map((history) => {
          const driver = drivers.find(d => d.driver_number === history.driverNumber);
          const hasActivity = history.positionChange !== 0 || history.battles.length > 0 || history.fastestLap;
          
          return (
            <div
              key={history.driverNumber}
              className={`p-3 rounded-lg border transition-all ${
                hasActivity 
                  ? 'border-blue-500/50 bg-blue-500/5' 
                  : 'border-gray-600 bg-gray-700/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getTeamColor(history.driverNumber) }}
                    />
                    <span className="font-medium text-sm">
                      {driver?.name_acronym || `#${history.driverNumber}`}
                    </span>
                  </div>
                  
                  {/* Current position */}
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-400">P</span>
                    <span className="text-lg font-bold text-white">
                      {history.currentPosition}
                    </span>
                  </div>
                </div>

                {/* Position change indicator */}
                {history.positionChange !== 0 && (
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded ${getPositionChangeColor(history.positionChange)}`}>
                    {getPositionChangeIcon(history.positionChange)}
                    <span className="text-xs font-medium">
                      {Math.abs(history.positionChange)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  {/* Previous position */}
                  <div className="text-gray-400">
                    Previous: P{history.previousPosition}
                  </div>
                  
                  {/* Team name */}
                  <div className="text-gray-500">
                    {driver?.team_name || 'Unknown Team'}
                  </div>
                </div>

                {/* Activity indicators */}
                <div className="flex items-center space-x-2">
                  {history.fastestLap && (
                    <div className="flex items-center space-x-1 text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                      <Trophy className="w-3 h-3" />
                      <span className="text-xs">FL</span>
                    </div>
                  )}
                  
                  {history.battles.length > 0 && (
                    <div className="flex items-center space-x-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                      <Target className="w-3 h-3" />
                      <span className="text-xs">Battle</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Position change description */}
              {history.positionChange !== 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {history.positionChange > 0 
                    ? `Gained ${history.positionChange} position${history.positionChange > 1 ? 's' : ''}` 
                    : `Lost ${Math.abs(history.positionChange)} position${Math.abs(history.positionChange) > 1 ? 's' : ''}`
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredHistory.length === 0 && showOnlyChanges && (
        <div className="text-center text-gray-400 py-8">
          <Target className="w-8 h-8 mx-auto mb-2 text-gray-500" />
          <p>No position changes or battles to display</p>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <div className="text-sm font-medium mb-2">Race Activity Summary</div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-gray-400">Position Changes</div>
            <div className="font-medium text-blue-400">
              {positionHistory.filter(h => h.positionChange !== 0).length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Active Battles</div>
            <div className="font-medium text-orange-400">
              {positionHistory.filter(h => h.battles.length > 0).length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Fastest Laps</div>
            <div className="font-medium text-purple-400">
              {positionHistory.filter(h => h.fastestLap).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
