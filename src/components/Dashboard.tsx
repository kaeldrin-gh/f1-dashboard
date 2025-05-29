'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import { useWebSocket } from '@/services/websocket-service';
import { TrackMap } from './TrackMap';
import { TimingTower } from './TimingTower';
import { TelemetryChart } from './TelemetryChart';
import { WeatherWidget } from './WeatherWidget';
import { Alerts } from './Alerts';
import { ConnectionStatus } from './ConnectionStatus';
import { DriverSelector } from './DriverSelector';
import { PitWindowCalculator } from './PitWindowCalculator';
import { PositionChanges } from './PositionChanges';
import { UpcomingRaces } from './UpcomingRaces';
import { RaceStrategyOverview } from './RaceStrategyOverview';

export function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [telemetryDataType, setTelemetryDataType] = useState<'speed' | 'throttle' | 'brake' | 'rpm'>('speed');
  const [rightPanelTab, setRightPanelTab] = useState<'pit-windows' | 'position-changes' | 'strategy' | 'alerts'>('pit-windows');
    const {
    drivers,
    positions,
    liveIntervals,
    carData,
    locationData,
    weather,
    alerts,
    sessionInfo,
    connectionStatus,
    lastUpdate,
    selectedDrivers,
    setSelectedDrivers,
    dismissAlert
  } = useDashboardStore();
  
  // Debug logging to understand what's happening
  useEffect(() => {
    console.log('Dashboard state updated:', {
      driversCount: drivers.length,
      selectedDrivers,
      connectionStatus,
      lastUpdate
    });
    if (drivers.length > 0) {
      console.log('Available drivers:', drivers.map(d => ({ number: d.driver_number, name: d.name_acronym, team: d.team_name })));
    }
  }, [drivers, selectedDrivers, connectionStatus, lastUpdate]);
  
  const { connect, disconnect } = useWebSocket();  // Initialize WebSocket connection and start data streaming
  useEffect(() => {
    setIsMounted(true);
    console.log('🚀 Starting F1 Dashboard...');
    
    // Connect to live data stream
    connect();

    // Fallback: If no drivers are loaded after 5 seconds, use mock data
    const fallbackTimer = setTimeout(() => {
      const currentDrivers = useDashboardStore.getState().drivers;
      if (currentDrivers.length === 0) {        console.log('🔧 No drivers loaded, using fallback mock data...');        const mockDrivers = [
          { driver_number: 1, name_acronym: 'VER', full_name: 'Max Verstappen', team_name: 'Red Bull Racing' },
          { driver_number: 22, name_acronym: 'TSU', full_name: 'Yuki Tsunoda', team_name: 'Red Bull Racing' },
          { driver_number: 63, name_acronym: 'RUS', full_name: 'George Russell', team_name: 'Mercedes' },
          { driver_number: 12, name_acronym: 'ANT', full_name: 'Kimi Antonelli', team_name: 'Mercedes' },
          { driver_number: 16, name_acronym: 'LEC', full_name: 'Charles Leclerc', team_name: 'Ferrari' },
          { driver_number: 44, name_acronym: 'HAM', full_name: 'Lewis Hamilton', team_name: 'Ferrari' },
          { driver_number: 4, name_acronym: 'NOR', full_name: 'Lando Norris', team_name: 'McLaren' },
          { driver_number: 81, name_acronym: 'PIA', full_name: 'Oscar Piastri', team_name: 'McLaren' },
          { driver_number: 14, name_acronym: 'ALO', full_name: 'Fernando Alonso', team_name: 'Aston Martin' },
          { driver_number: 18, name_acronym: 'STR', full_name: 'Lance Stroll', team_name: 'Aston Martin' },
          { driver_number: 11, name_acronym: 'HAD', full_name: 'Isack Hadjar', team_name: 'Racing Bulls' },
          { driver_number: 21, name_acronym: 'LAW', full_name: 'Liam Lawson', team_name: 'Racing Bulls' },
          { driver_number: 55, name_acronym: 'SAI', full_name: 'Carlos Sainz', team_name: 'Williams' },
          { driver_number: 2, name_acronym: 'SAR', full_name: 'Logan Sargeant', team_name: 'Williams' },
          { driver_number: 31, name_acronym: 'OCO', full_name: 'Esteban Ocon', team_name: 'Alpine' },
          { driver_number: 10, name_acronym: 'GAS', full_name: 'Pierre Gasly', team_name: 'Alpine' },
          { driver_number: 20, name_acronym: 'MAG', full_name: 'Kevin Magnussen', team_name: 'Haas' },
          { driver_number: 87, name_acronym: 'BEA', full_name: 'Oliver Bearman', team_name: 'Haas' },
          { driver_number: 77, name_acronym: 'BOT', full_name: 'Valtteri Bottas', team_name: 'Kick Sauber' },
          { driver_number: 5, name_acronym: 'BOR', full_name: 'Gabriel Bortoleto', team_name: 'Kick Sauber' }
        ];useDashboardStore.getState().updateDrivers(mockDrivers);
        
        // Start animated mock position updates
        let animationFrame = 0;
        const animatePositions = () => {
          animationFrame += 0.5; // Animation speed
          
          // Generate moving positions for selected drivers around the track (0-100%)
          const selectedDrivers = useDashboardStore.getState().selectedDrivers;
          const mockLocations = selectedDrivers.map((driverNumber, index) => {
            // Each driver has a different starting position and speed
            const baseProgress = (animationFrame + index * 20) % 100;
            // Convert progress to x,y coordinates (simplified simulation)
            const angle = (baseProgress / 100) * 2 * Math.PI;
            const x = 50 + Math.cos(angle) * 30; // Track center + radius
            const y = 40 + Math.sin(angle) * 25;
            
            return {
              driver_number: driverNumber,
              x: x,
              y: y,
              trackProgress: baseProgress
            };
          });
          
          useDashboardStore.getState().updateLocationData(mockLocations);
        };
        
        // Update positions every 200ms for smooth animation
        const animationInterval = setInterval(animatePositions, 200);
        
        // Store interval for cleanup
        (window as any).mockAnimationInterval = animationInterval;
      }
    }, 5000);    // Cleanup on unmount
    return () => {
      disconnect();
      clearTimeout(fallbackTimer);
      // Clear animation interval if it exists
      if ((window as any).mockAnimationInterval) {
        clearInterval((window as any).mockAnimationInterval);
        delete (window as any).mockAnimationInterval;
      }
    };
  }, []); // Remove connect/disconnect dependencies to prevent infinite loops
  const handleDismissAlert = (index: number) => {
    dismissAlert(index);
  };

  // Show loading state until component is mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-400">Loading F1 Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4" suppressHydrationWarning>
      {/* Header */}
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-red-500">F1 Live Dashboard</h1>            {sessionInfo && (
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                {sessionInfo.name} - {sessionInfo.type} | Status: {sessionInfo.status}
                {sessionInfo.status === 'finished' && (
                  <span className="ml-2 text-amber-400 font-medium">⚠️ No Live Session</span>
                )}
              </p>
            )}
            {!sessionInfo && (
              <p className="text-amber-400 mt-1 text-sm sm:text-base font-medium">
                📡 Connecting to F1 data stream...
              </p>
            )}
          </div>
          <ConnectionStatus 
            status={connectionStatus}
            lastUpdate={lastUpdate}
          />
        </div>
      </header>      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Column - Track Map & Weather */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Track Position</h2>
            <TrackMap 
              locations={locationData}
              drivers={drivers}
            />
          </div>
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Weather Conditions</h2>
            <WeatherWidget weather={weather} />
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Upcoming Races</h2>
            <UpcomingRaces maxVisibleRaces={4} />
          </div>
        </div>

        {/* Middle Left Column - Timing Tower */}
        <div className="xl:col-span-1">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 h-full">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Live Timing</h2>
            <TimingTower 
              positions={positions}
              intervals={liveIntervals}
              drivers={drivers}
            />
          </div>
        </div>

        {/* Middle Right Column - Telemetry & Driver Selection */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Telemetry</h2>
            <TelemetryChart 
              carData={carData}
              selectedDrivers={selectedDrivers}
              dataType={telemetryDataType}
              onDataTypeChange={setTelemetryDataType}
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Driver Selection</h2>
            <DriverSelector
              drivers={drivers}
              selectedDrivers={selectedDrivers}
              onSelectionChange={setSelectedDrivers}
              maxSelection={5}
            />
          </div>
        </div>        {/* Right Column - Tabbed Interface */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6">          {/* Tab Navigation */}
          <div className="bg-gray-800 rounded-lg">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setRightPanelTab('pit-windows')}
                className={`flex-1 px-3 py-3 text-xs sm:text-sm font-medium transition-colors ${
                  rightPanelTab === 'pit-windows' 
                    ? 'text-red-400 border-b-2 border-red-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Pit Windows
              </button>
              <button
                onClick={() => setRightPanelTab('position-changes')}
                className={`flex-1 px-3 py-3 text-xs sm:text-sm font-medium transition-colors ${
                  rightPanelTab === 'position-changes' 
                    ? 'text-red-400 border-b-2 border-red-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Positions
              </button>              <button
                onClick={() => setRightPanelTab('strategy')}
                className={`flex-1 px-3 py-3 text-xs sm:text-sm font-medium transition-colors ${
                  rightPanelTab === 'strategy' 
                    ? 'text-red-400 border-b-2 border-red-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Strategy
              </button>
              <button
                onClick={() => setRightPanelTab('alerts')}
                className={`flex-1 px-3 py-3 text-xs sm:text-sm font-medium transition-colors ${
                  rightPanelTab === 'alerts' 
                    ? 'text-red-400 border-b-2 border-red-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Alerts {alerts.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {alerts.length}
                  </span>
                )}
              </button>
            </div>
              {/* Tab Content */}
            <div className="p-3 sm:p-4">
              {rightPanelTab === 'pit-windows' && (
                <PitWindowCalculator
                  drivers={drivers}
                  positions={positions}
                  sessionInfo={sessionInfo}
                />
              )}
              
              {rightPanelTab === 'position-changes' && (
                <PositionChanges
                  drivers={drivers}
                  positions={positions}
                />
              )}              {rightPanelTab === 'strategy' && (
                <RaceStrategyOverview
                  drivers={drivers}
                  positions={positions}
                  weather={weather || undefined}
                  sessionInfo={sessionInfo}
                  selectedDrivers={selectedDrivers}
                />
              )}
              
              {rightPanelTab === 'alerts' && (
                <>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Race Control</h2>
                  <Alerts 
                    alerts={alerts}
                    onDismiss={handleDismissAlert}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
