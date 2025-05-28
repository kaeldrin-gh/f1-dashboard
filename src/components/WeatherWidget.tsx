'use client';

import { WeatherWidgetProps } from '@/types/f1-types';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets } from 'lucide-react';

export function WeatherWidget({ weather }: WeatherWidgetProps) {
  if (!weather) {
    return (
      <div className="text-center text-gray-400 py-8">
        No weather data available
      </div>
    );
  }

  const getWeatherIcon = () => {
    if (weather.rainfall > 0) return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (weather.humidity > 80) return <Cloud className="w-8 h-8 text-gray-400" />;
    return <Sun className="w-8 h-8 text-yellow-400" />;
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <div className="space-y-4">
      {/* Main weather display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getWeatherIcon()}
          <div>
            <div className="text-2xl font-bold">
              {weather.air_temperature.toFixed(1)}°C
            </div>
            <div className="text-sm text-gray-400">Air Temperature</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-orange-400">
            {weather.track_temperature.toFixed(1)}°C
          </div>
          <div className="text-sm text-gray-400">Track</div>
        </div>
      </div>

      {/* Weather details grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Humidity */}
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-sm font-medium">{weather.humidity.toFixed(0)}%</div>
            <div className="text-xs text-gray-400">Humidity</div>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium">
              {weather.wind_speed.toFixed(1)} km/h {getWindDirection(weather.wind_direction)}
            </div>
            <div className="text-xs text-gray-400">Wind</div>
          </div>
        </div>

        {/* Pressure */}
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-green-400" />
          <div>
            <div className="text-sm font-medium">{weather.pressure.toFixed(0)} hPa</div>
            <div className="text-xs text-gray-400">Pressure</div>
          </div>
        </div>

        {/* Rainfall */}
        <div className="flex items-center space-x-2">
          <CloudRain className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-sm font-medium">
              {weather.rainfall > 0 ? `${weather.rainfall.toFixed(1)}mm` : 'Dry'}
            </div>
            <div className="text-xs text-gray-400">Rainfall</div>
          </div>
        </div>
      </div>

      {/* Track conditions indicator */}
      <div className="mt-4 p-3 bg-gray-700 rounded">
        <div className="text-sm font-medium mb-1">Track Conditions</div>
        <div className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              weather.rainfall > 0 
                ? 'bg-blue-500' 
                : weather.humidity > 80 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
          />
          <span className="text-xs">
            {weather.rainfall > 0 
              ? 'Wet' 
              : weather.humidity > 80 
                ? 'Damp' 
                : 'Dry'
            }
          </span>
        </div>
      </div>
    </div>
  );
}
