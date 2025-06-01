'use client';

import { TrackMapProps } from '@/types/f1-types';
import { useEffect, useRef, useState } from 'react';
import { getTrackLayout, getTrackPosition, TrackPoint } from './TrackLayouts';
import { useDashboardStore } from '@/store/dashboard-store';

export function TrackMap({ locations, drivers }: TrackMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sessionInfo, selectedDrivers } = useDashboardStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getTeamColor = (teamName: string): string => {
    const teamColors: Record<string, string> = {
      'Red Bull Racing': '#1E3A8A',
      'Mercedes': '#059669',
      'Ferrari': '#DC2626',
      'McLaren': '#EA580C',
      'Alpine': '#2563EB',
      'Racing Bulls': '#6366F1',  // Updated from AlphaTauri
      'Aston Martin': '#065F46',
      'Williams': '#1D4ED8',
      'Kick Sauber': '#991B1B',   // Updated from Alfa Romeo
      'Haas': '#78716C'
    };
    return teamColors[teamName] || '#6B7280';
  };

  useEffect(() => {
    if (!isClient) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get appropriate track layout
    const track = getTrackLayout(sessionInfo?.name);
    
    // Set canvas size based on track
    canvas.width = track.width;
    canvas.height = track.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw track outline
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    track.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();

    // Draw track surface (inner area)
    ctx.fillStyle = 'rgba(75, 85, 99, 0.2)';
    ctx.fill();    // Draw sector markers
    track.sectors.forEach((sectorPercent, index) => {
      if (index < track.sectors.length - 1) { // Don't draw marker at 100%
        const position = getTrackPosition(track, sectorPercent);
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(position.x, position.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Sector number with better styling
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(`S${index + 1}`, position.x + 8, position.y + 4);
        ctx.fillText(`S${index + 1}`, position.x + 8, position.y + 4);
      }
    });

    // Draw start/finish line
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const startFinish = track.startFinish;
    ctx.moveTo(startFinish.x - 8, startFinish.y);
    ctx.lineTo(startFinish.x + 8, startFinish.y);
    ctx.stroke();

    // Draw "START/FINISH" text
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('START/FINISH', startFinish.x, startFinish.y - 12);    // Draw car positions
    Object.entries(locations || {}).forEach(([driverNumber, location]) => {
      const driverNum = parseInt(driverNumber);
      const driver = drivers?.find(d => d.driver_number === driverNum);
      
      // Show all drivers if none selected, otherwise only show selected drivers
      const shouldShowDriver = selectedDrivers.length === 0 || selectedDrivers.includes(driverNum);
      if (!driver || !location || !shouldShowDriver) return;

      // Convert location data to track position
      // For demo, we'll use a simple mapping - in real implementation,
      // this would use the actual track coordinates from OpenF1
      const trackProgress = ((location.x || 0) + (location.y || 0)) % 100;
      const position = getTrackPosition(track, trackProgress);      // Draw car dot with team color
      const teamColor = getTeamColor(driver.team_name || '');
      ctx.fillStyle = teamColor;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(position.x, position.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw driver number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(driver.driver_number.toString(), position.x, position.y + 3);

      // Draw driver name nearby
      ctx.fillStyle = teamColor;
      ctx.font = '9px sans-serif';
      ctx.fillText(driver.name_acronym, position.x, position.y + 18);
    });

    // Draw track name
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(track.name, 10, 20);

  }, [isClient, locations, drivers, sessionInfo, selectedDrivers]);
  return (
    <div className="flex flex-col items-center">
      {isClient ? (
        <>
          <canvas 
            ref={canvasRef} 
            className="border border-gray-600 rounded-lg bg-gray-900"
            style={{ maxWidth: '100%', height: 'auto' }}
          />          <div className="mt-2 text-xs text-gray-400 text-center">
            {sessionInfo?.status === 'finished' ? (
              <span className="text-amber-400">⚠️ No live session - Showing demo track layout</span>
            ) : selectedDrivers.length === 0 ? (
              'Showing all drivers • Red line: Start/Finish • Yellow dots: Sector markers'
            ) : (
              `Showing ${selectedDrivers.length} selected driver${selectedDrivers.length > 1 ? 's' : ''} • Red line: Start/Finish • Yellow dots: Sector markers`
            )}
          </div>
          
          {/* Sector Information */}
          <div className="mt-2 text-xs text-gray-400 text-center max-w-sm">
            <strong>Sectors explained:</strong> F1 tracks are divided into 3 sectors (S1, S2, S3) for timing purposes. 
            Each sector measures split times to analyze driver performance through different parts of the circuit.
          </div>          {/* Driver Legend - Show selected drivers or all drivers if none selected */}
          {drivers && drivers.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {selectedDrivers.length === 0 ? (
                // Show all drivers when none selected
                drivers.slice(0, 10).map(driver => (
                  <div key={driver.driver_number} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: getTeamColor(driver.team_name || '') }}
                    />
                    <span>{driver.name_acronym}</span>
                  </div>
                ))
              ) : (
                // Show only selected drivers
                selectedDrivers.map(driverNumber => {
                  const driver = drivers.find(d => d.driver_number === driverNumber);
                  if (!driver) return null;
                  return (
                    <div key={driver.driver_number} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: getTeamColor(driver.team_name || '') }}
                      />
                      <span>{driver.name_acronym}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : (
        <div className="border border-gray-600 rounded-lg bg-gray-900 w-full h-64 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading track map...</div>
        </div>
      )}
    </div>
  );
}
