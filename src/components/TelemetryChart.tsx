'use client';

import { TelemetryChartProps } from '@/types/f1-types';
import { useEffect, useRef, useState, useCallback } from 'react';
import { BarChart3, Activity, Zap, Gauge } from 'lucide-react';

type TelemetryDataType = 'speed' | 'throttle' | 'brake' | 'rpm';

interface TelemetryChartPropsExtended extends Omit<TelemetryChartProps, 'dataType'> {
  dataType?: TelemetryDataType;
  onDataTypeChange?: (dataType: TelemetryDataType) => void;
}

// Move generateRealisticData outside component to prevent recreation on every render
const generateRealisticData = (type: TelemetryDataType, driverIndex: number, pointIndex: number) => {
  const time = pointIndex * 0.1; // 0.1 second intervals
  const driverOffset = driverIndex * 0.5; // Slight offset between drivers
  
  // Use deterministic seed instead of Math.random()
  const seed = (pointIndex * 17 + driverIndex * 31) % 100;
  const randomValue = Math.sin(seed) * 0.5 + 0.5; // 0-1 range
  
  switch (type) {
    case 'speed':
      // Simulate speed variations through corners and straights
      const baseSpeed = 200 + Math.sin(time * 0.2) * 80 + Math.sin(time * 0.8) * 30;
      const variation = Math.sin(time * 2 + driverOffset) * 15;
      return Math.max(50, Math.min(350, baseSpeed + variation + randomValue * 10));
      
    case 'throttle':
      // Simulate throttle application - more aggressive in corners
      const throttleBase = 70 + Math.sin(time * 0.3) * 30;
      const cornering = Math.abs(Math.sin(time * 1.2)) > 0.6 ? -40 : 0;
      return Math.max(0, Math.min(100, throttleBase + cornering + randomValue * 15));
      
    case 'brake':
      // Simulate braking zones
      const brakingZone = Math.abs(Math.sin(time * 0.8)) > 0.85;
      const cornerBraking = Math.abs(Math.sin(time * 1.5)) > 0.9;
      return brakingZone || cornerBraking ? randomValue * 80 + 20 : randomValue * 10;
      
    case 'rpm':
      // Simulate engine RPM with gear changes
      const baseRpm = 9000 + Math.sin(time * 0.4) * 2000;
      const gearShift = Math.sin(time * 3) > 0.95 ? -2000 : 0;
      return Math.max(6000, Math.min(15000, baseRpm + gearShift + randomValue * 500));
      
    default:
      return 50;
  }
};

export function TelemetryChart({ carData, selectedDrivers, dataType: initialDataType = 'speed', onDataTypeChange }: TelemetryChartPropsExtended) {
  const [dataType, setDataType] = useState<TelemetryDataType>(initialDataType);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRealTime, setIsRealTime] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [currentValues, setCurrentValues] = useState<number[]>([]);
  
  // Client-side mounting guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDataTypeChange = useCallback((newDataType: TelemetryDataType) => {
    setDataType(newDataType);
    onDataTypeChange?.(newDataType);
  }, [onDataTypeChange]);

  const getDataTypeIcon = useCallback((type: TelemetryDataType) => {
    switch (type) {
      case 'speed': return <Gauge className="w-4 h-4" />;
      case 'throttle': return <Zap className="w-4 h-4" />;
      case 'brake': return <Activity className="w-4 h-4" />;
      case 'rpm': return <BarChart3 className="w-4 h-4" />;
    }
  }, []);

  const getDataTypeUnit = useCallback((type: TelemetryDataType) => {
    switch (type) {
      case 'speed': return 'km/h';
      case 'throttle': return '%';
      case 'brake': return '%';
      case 'rpm': return 'RPM';
    }
  }, []);  useEffect(() => {
    if (!isMounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return; // Prevent errors with zero dimensions
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (rect.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = (rect.height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }
    }

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, 'rgba(55, 65, 81, 0.1)');
    gradient.addColorStop(1, 'rgba(55, 65, 81, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Get max value for scaling
    const getMaxValue = () => {
      switch (dataType) {
        case 'speed': return 350;
        case 'throttle': return 100;
        case 'brake': return 100;
        case 'rpm': return 15000;
        default: return 100;
      }
    };

    const maxValue = getMaxValue();
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
    
    // Draw telemetry lines for each selected driver
    selectedDrivers.forEach((driverNumber, driverIndex) => {
      ctx.strokeStyle = colors[driverIndex % colors.length];
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const dataPoints = 100; // Number of data points to display
      
      for (let i = 0; i < dataPoints; i++) {
        const x = (rect.width / (dataPoints - 1)) * i;
        const rawValue = generateRealisticData(dataType, driverIndex, i);
        const y = rect.height - (rawValue / maxValue) * rect.height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = colors[driverIndex % colors.length];
      ctx.shadowBlur = 5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw value labels
    ctx.fillStyle = '#D1D5DB';
    ctx.font = '12px Inter, sans-serif';
      // Y-axis labels
    ctx.textAlign = 'right';
    const unit = getDataTypeUnit(dataType);
    ctx.fillText(`${maxValue} ${unit}`, rect.width - 5, 15);
    ctx.fillText(`${Math.round(maxValue * 0.5)} ${unit}`, rect.width - 5, rect.height / 2);
    ctx.fillText(`0 ${unit}`, rect.width - 5, rect.height - 5);    // Time labels
    ctx.textAlign = 'center';
    ctx.fillText('0s', 5, rect.height - 5);
    ctx.fillText('10s', rect.width - 20, rect.height - 5);

    } catch (error) {
      console.warn('Canvas rendering error:', error);
    }
  }, [isMounted, selectedDrivers, dataType, showGrid, isRealTime]);// Separate useEffect for current values to prevent infinite loop
  useEffect(() => {
    if (!isMounted || selectedDrivers.length === 0) return;
    
    const newCurrentValues = selectedDrivers.map((_, index) => 
      generateRealisticData(dataType, index, 99)
    );
    setCurrentValues(newCurrentValues);
  }, [isMounted, selectedDrivers, dataType]);
  return (
    <div className="w-full space-y-4">
      {/* Enhanced Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Data type selector */}
        <div className="flex space-x-1">
          {(['speed', 'throttle', 'brake', 'rpm'] as const).map(type => (
            <button
              key={type}
              onClick={() => handleDataTypeChange(type)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-all ${
                dataType === type 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {getDataTypeIcon(type)}
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>

        {/* Chart options */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-red-600 focus:ring-red-500"
            />
            <span>Grid</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={isRealTime}
              onChange={(e) => setIsRealTime(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-red-600 focus:ring-red-500"
            />
            <span>Real-time</span>
          </label>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="w-full h-64 bg-gray-800 rounded-lg border border-gray-600"
          style={{ width: '100%', height: '256px' }}
        />        {/* Current value overlay - only render on client */}
        {isMounted && selectedDrivers.length > 0 && currentValues.length > 0 && (
          <div className="absolute top-2 left-2 bg-black/50 rounded-lg p-2 backdrop-blur-sm">
            <div className="text-xs text-gray-300 mb-1">Current {dataType.toUpperCase()}</div>
            {selectedDrivers.slice(0, 3).map((driverNumber, index) => {
              const colors = ['#EF4444', '#3B82F6', '#10B981'];
              const currentValue = currentValues[index];
              if (currentValue === undefined) return null;
              
              return (
                <div key={driverNumber} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="text-white font-mono">
                    #{driverNumber}: {currentValue.toFixed(1)} {getDataTypeUnit(dataType)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Legend */}
      <div className="flex flex-wrap gap-3">
        {selectedDrivers.map((driverNumber, index) => {
          const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
          return (
            <div key={driverNumber} className="flex items-center space-x-2 text-sm bg-gray-700 px-3 py-1 rounded-full">
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-300">Driver #{driverNumber}</span>
            </div>
          );
        })}
      </div>

      {selectedDrivers.length === 0 && (
        <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-lg border border-gray-600">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p className="text-lg font-medium mb-1">No drivers selected</p>
          <p className="text-sm">Select drivers from the timing tower to view telemetry data</p>
        </div>
      )}
    </div>
  );
}
