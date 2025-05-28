'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, Flag, AlertTriangle } from 'lucide-react';

interface SessionData {
  type: 'FP1' | 'FP2' | 'FP3' | 'Sprint' | 'Qualifying' | 'Race';
  status: 'Not Started' | 'Active' | 'Paused' | 'Finished' | 'Red Flag' | 'Safety Car';
  timeRemaining: string;
  currentLap: number;
  totalLaps: number;
  circuitName: string;
  temperature: {
    air: number;
    track: number;
  };
  weather: 'Dry' | 'Light Rain' | 'Heavy Rain' | 'Wet';
  drsZones: number;
}

const SessionManager: React.FC = () => {
  const [sessionData, setSessionData] = useState<SessionData>({
    type: 'Race',
    status: 'Active',
    timeRemaining: '1:23:45',
    currentLap: 42,
    totalLaps: 70,
    circuitName: 'Silverstone Circuit',
    temperature: {
      air: 22,
      track: 35
    },
    weather: 'Dry',
    drsZones: 2
  });

  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        currentLap: prev.currentLap < prev.totalLaps ? prev.currentLap + Math.random() > 0.7 ? 1 : 0 : prev.currentLap,
        temperature: {
          air: prev.temperature.air + (Math.random() - 0.5) * 0.5,
          track: prev.temperature.track + (Math.random() - 0.5) * 2
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getStatusColor = (status: SessionData['status']) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Paused': return 'text-yellow-400';
      case 'Red Flag': return 'text-red-400';
      case 'Safety Car': return 'text-yellow-300';
      case 'Finished': return 'text-gray-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusIcon = (status: SessionData['status']) => {
    switch (status) {
      case 'Active': return <Play className="w-4 h-4" />;
      case 'Paused': return <Pause className="w-4 h-4" />;
      case 'Red Flag': return <AlertTriangle className="w-4 h-4" />;
      case 'Safety Car': return <Flag className="w-4 h-4" />;
      case 'Finished': return <Flag className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getWeatherEmoji = (weather: SessionData['weather']) => {
    switch (weather) {
      case 'Dry': return '☀️';
      case 'Light Rain': return '🌦️';
      case 'Heavy Rain': return '🌧️';
      case 'Wet': return '💧';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Session Info
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-sm text-gray-400">{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Session Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(sessionData.status)}
            <span className="text-sm font-medium text-gray-300">
              {sessionData.type}
            </span>
          </div>
          <div className={`text-sm font-bold ${getStatusColor(sessionData.status)}`}>
            {sessionData.status}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Time Remaining</div>
          <div className="text-sm font-bold text-white font-mono">
            {sessionData.timeRemaining}
          </div>
        </div>
      </div>

      {/* Lap Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Lap Progress</span>
          <span className="text-sm text-white font-mono">
            {sessionData.currentLap} / {sessionData.totalLaps}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(sessionData.currentLap / sessionData.totalLaps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Circuit and Weather */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Circuit</span>
          <span className="text-sm text-white">{sessionData.circuitName}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Weather</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getWeatherEmoji(sessionData.weather)}</span>
            <span className="text-sm text-white">{sessionData.weather}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Air Temp</span>
            <span className="text-xs text-white">{sessionData.temperature.air.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Track Temp</span>
            <span className="text-xs text-white">{sessionData.temperature.track.toFixed(1)}°C</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">DRS Zones</span>
          <span className="text-sm text-white">{sessionData.drsZones}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isLive 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isLive ? 'Pause' : 'Resume'}
        </button>
        
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default SessionManager;
