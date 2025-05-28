import { io, Socket } from 'socket.io-client';
import { useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';
import type { 
  DriverPosition, 
  CarData, 
  LocationData, 
  WeatherData, 
  RaceControlMessage,
  SessionInfo,
  Session
} from '@/types/f1-types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    try {
      // For development, we'll simulate WebSocket with polling
      // In production, this would connect to your F1 data streaming service
      console.log('🔌 Connecting to F1 data stream...');
      
      this.socket = io('ws://localhost:3001', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to F1 data stream');
      this.reconnectAttempts = 0;
      useDashboardStore.getState().setConnectionStatus('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from F1 data stream');
      useDashboardStore.getState().setConnectionStatus('disconnected');
      this.handleReconnect();
    });

    this.socket.on('connect_error', () => {
      console.log('❌ Connection error - falling back to polling mode');
      useDashboardStore.getState().setConnectionStatus('disconnected');
      this.startPollingMode();
    });

    // Listen for live data updates
    this.socket.on('positions', (data: DriverPosition[]) => {
      useDashboardStore.getState().updatePositions(data);
    });

    this.socket.on('car_data', (data: CarData[]) => {
      useDashboardStore.getState().updateCarData(data);
    });

    this.socket.on('location_data', (data: LocationData[]) => {
      useDashboardStore.getState().updateLocationData(data);
    });

    this.socket.on('weather', (data: WeatherData) => {
      useDashboardStore.getState().updateWeather(data);
    });

    this.socket.on('race_control', (message: RaceControlMessage) => {
      useDashboardStore.getState().addAlert(message);
    });

    this.socket.on('session_info', (data: SessionInfo) => {
      useDashboardStore.getState().updateSessionInfo(data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('❌ Max reconnection attempts reached. Switching to polling mode.');
      this.startPollingMode();
    }
  }

  private startPollingMode() {
    console.log('📡 Starting polling mode for F1 data...');
    useDashboardStore.getState().setConnectionStatus('polling');
    
    // Start polling the OpenF1 API directly
    this.startDataPolling();
  }
  private async startDataPolling() {
    const store = useDashboardStore.getState();
    
    // Poll every 10 seconds instead of 2 seconds to reduce API load
    const pollInterval = setInterval(async () => {
      try {
        // Import the OpenF1 service dynamically to avoid circular dependencies
        const { OpenF1Service } = await import('./openf1-api');
        const api = OpenF1Service.getInstance();// Get latest session info
        const sessions = await api.getSessions();
        const latestSession = sessions.find((s: Session) => 
          new Date(s.date_start) <= new Date() && new Date(s.date_end) >= new Date()
        );
          if (latestSession) {
          store.updateSessionInfo({
            name: latestSession.session_name,
            type: latestSession.session_type,
            status: 'live',
            timeRemaining: Math.max(0, new Date(latestSession.date_end).getTime() - Date.now()),
            currentLap: 1,
            totalLaps: latestSession.session_type === 'Race' ? 70 : 0
          });

          // Get drivers first (critical for driver selection)
          const drivers = await api.getDrivers(latestSession.session_key);
          console.log('🏎️ Drivers fetched:', drivers.length);
          if (drivers.length > 0) {
            store.updateDrivers(drivers);
          }

          // Get live positions and intervals
          const [positions, intervals] = await Promise.all([
            api.getPositions(latestSession.session_key),
            api.getIntervals(latestSession.session_key)
          ]);// Merge position and interval data
          const mergedPositions: DriverPosition[] = positions.map((pos: any) => {
            const interval = intervals.find((int: any) => int.driver_number === pos.driver_number);
            return {
              driver_number: pos.driver_number,
              position: pos.position,
              date: pos.date,
              gap_to_leader: String(interval?.gap_to_leader || '+0.000'),
              interval: String(interval?.interval || '+0.000')
            };
          });

          store.updatePositions(mergedPositions);

          // Get car data and location data
          const [carData, locationData, weather] = await Promise.all([
            api.getCarData(latestSession.session_key),
            api.getLocationData(latestSession.session_key),
            api.getWeatherData(latestSession.session_key)
          ]);

          if (carData.length > 0) store.updateCarData(carData);
          if (locationData.length > 0) store.updateLocationData(locationData);
          if (weather.length > 0) store.updateWeather(weather[weather.length - 1]);          // Get race control messages
          const raceControl = await api.getRaceControl(latestSession.session_key);
          const newMessages = raceControl.filter((msg: RaceControlMessage) => 
            !store.alerts.some(alert => alert.date === msg.date && alert.message === msg.message)
          );          newMessages.forEach((msg: RaceControlMessage) => store.addAlert(msg));
        } else {
          // No live session found, load mock data for testing
          console.log('📺 No live session found, loading mock data for testing...');
          
          // Create mock drivers for testing (2024 F1 grid)
          const mockDrivers = [
            { driver_number: 1, name_acronym: 'VER', full_name: 'Max Verstappen', team_name: 'Red Bull Racing' },
            { driver_number: 11, name_acronym: 'PER', full_name: 'Sergio Perez', team_name: 'Red Bull Racing' },
            { driver_number: 44, name_acronym: 'HAM', full_name: 'Lewis Hamilton', team_name: 'Mercedes' },
            { driver_number: 63, name_acronym: 'RUS', full_name: 'George Russell', team_name: 'Mercedes' },
            { driver_number: 16, name_acronym: 'LEC', full_name: 'Charles Leclerc', team_name: 'Ferrari' },
            { driver_number: 55, name_acronym: 'SAI', full_name: 'Carlos Sainz', team_name: 'Ferrari' },
            { driver_number: 4, name_acronym: 'NOR', full_name: 'Lando Norris', team_name: 'McLaren' },
            { driver_number: 81, name_acronym: 'PIA', full_name: 'Oscar Piastri', team_name: 'McLaren' },
            { driver_number: 14, name_acronym: 'ALO', full_name: 'Fernando Alonso', team_name: 'Aston Martin' },
            { driver_number: 18, name_acronym: 'STR', full_name: 'Lance Stroll', team_name: 'Aston Martin' }
          ];
          
          store.updateDrivers(mockDrivers);          store.updateSessionInfo({
            name: 'Mock Session',
            type: 'Practice',
            status: 'finished',
            timeRemaining: 0,
            currentLap: 0,
            totalLaps: 0
          });
        }store.setConnectionStatus('connected');
      } catch (error) {
        console.error('❌ Polling error:', error);
        store.setConnectionStatus('error');
      }
    }, 10000); // 10 seconds instead of 2 seconds to reduce API load

    // Store the interval ID so we can clear it later
    (window as any).f1PollingInterval = pollInterval;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Clear polling interval if it exists
    if ((window as any).f1PollingInterval) {
      clearInterval((window as any).f1PollingInterval);
      delete (window as any).f1PollingInterval;
    }

    useDashboardStore.getState().setConnectionStatus('disconnected');
  }

  // Method to send commands (for future features like driver selection, camera angles, etc.)
  sendCommand(command: string, data?: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(command, data);
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// Hook for components to use the WebSocket service
export const useWebSocket = () => {
  const connect = useCallback(() => webSocketService.connect(), []);
  const disconnect = useCallback(() => webSocketService.disconnect(), []);
  const sendCommand = useCallback((command: string, data?: any) => webSocketService.sendCommand(command, data), []);
  
  return {
    connect,
    disconnect,
    sendCommand
  };
};
