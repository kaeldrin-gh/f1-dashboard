import { create } from 'zustand';
import { DashboardState, WSMessage, ConnectionStatus, SessionInfo, RaceControlMessage, DriverPosition } from '@/types/f1-types';
import { openF1Api } from '@/services/openf1-api';

interface DashboardStore extends DashboardState {
  // Additional state
  connectionStatus: ConnectionStatus;
  sessionInfo: SessionInfo | null;
  alerts: RaceControlMessage[];
  selectedDrivers: number[];
  locationData: Record<number, any>;
  positions: DriverPosition[];
  
  // Actions
  setCurrentSession: (session: any) => void;
  updateDrivers: (drivers: any[]) => void;
  updatePositions: (positions: DriverPosition[]) => void;
  updateIntervals: (intervals: any[]) => void;
  updateCarData: (data: any[]) => void;
  updateLocationData: (locations: any[]) => void;
  updateLocations: (locations: Record<number, any>) => void;
  updateWeather: (weather: any) => void;
  updateSessionInfo: (info: SessionInfo) => void;
  addAlert: (message: RaceControlMessage) => void;
  addRaceControlMessage: (message: any) => void;
  removeRaceControlMessage: (index: number) => void;
  dismissAlert: (index: number) => void;
  setSelectedDrivers: (drivers: number[]) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  fetchInitialData: () => Promise<void>;
  startLiveUpdates: () => () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  currentSession: null,
  drivers: [],
  livePositions: [],
  liveIntervals: [],
  carData: {},
  locations: {},
  weather: null,
  raceControl: [],
  isConnected: false,
  lastUpdate: new Date().toISOString(),
  // Additional state
  connectionStatus: 'disconnected',
  sessionInfo: null,
  alerts: [],
  selectedDrivers: [], // Start with empty selection, will be populated when drivers are loaded
  locationData: {},
  positions: [],

  // Actions
  setCurrentSession: (session) => set({ currentSession: session }),
  
  updateDrivers: (drivers) => {
    const state = get();
    // If we have no selected drivers and drivers are loaded, select first 3
    const newSelectedDrivers = state.selectedDrivers.length === 0 && drivers.length > 0 
      ? drivers.slice(0, 3).map(d => d.driver_number) 
      : state.selectedDrivers;
    
    set({ 
      drivers, 
      selectedDrivers: newSelectedDrivers,
      lastUpdate: new Date().toISOString() 
    });
  },
    updatePositions: (positions) => set({ 
    livePositions: positions,
    positions: positions, // Update both for compatibility 
    lastUpdate: new Date().toISOString() 
  }),
  
  updateIntervals: (intervals) => set({ 
    liveIntervals: intervals, 
    lastUpdate: new Date().toISOString() 
  }),
  
  updateCarData: (data) => {
    // Convert array to Record format expected by components
    const carDataRecord = Array.isArray(data) 
      ? data.reduce((acc, item) => {
          acc[item.driver_number] = item;
          return acc;
        }, {} as Record<number, any>)
      : data;
    
    set({ 
      carData: carDataRecord, 
      lastUpdate: new Date().toISOString() 
    });
  },
    updateLocationData: (locations) => {
    // Convert array to Record format
    const locationRecord = Array.isArray(locations)
      ? locations.reduce((acc, loc) => {
          acc[loc.driver_number] = loc;
          return acc;
        }, {} as Record<number, any>)
      : locations;
    
    set({ 
      locations: locationRecord,
      locationData: locationRecord, // Update both for compatibility
      lastUpdate: new Date().toISOString() 
    });
  },
  
  updateLocations: (locations) => set({ 
    locations, 
    lastUpdate: new Date().toISOString() 
  }),
  
  updateWeather: (weather) => set({ 
    weather, 
    lastUpdate: new Date().toISOString() 
  }),
  
  updateSessionInfo: (info) => set({ 
    sessionInfo: info,
    lastUpdate: new Date().toISOString() 
  }),
  
  addAlert: (message) => set((state) => ({
    alerts: [message, ...state.alerts].slice(0, 20), // Keep only latest 20
    raceControl: [message, ...state.raceControl].slice(0, 20),
    lastUpdate: new Date().toISOString()
  })),
  
  addRaceControlMessage: (message) => set((state) => ({
    raceControl: [message, ...state.raceControl].slice(0, 20), // Keep only latest 20
    alerts: [message, ...state.alerts].slice(0, 20),
    lastUpdate: new Date().toISOString()
  })),
    removeRaceControlMessage: (index) => set((state) => ({
    raceControl: state.raceControl.filter((_, i) => i !== index),
    alerts: state.alerts.filter((_, i) => i !== index)
  })),

  dismissAlert: (index) => set((state) => ({
    alerts: state.alerts.filter((_, i) => i !== index),
    raceControl: state.raceControl.filter((_, i) => i !== index)
  })),

  setSelectedDrivers: (drivers) => set({ selectedDrivers: drivers }),
  
  setConnectionStatus: (status) => set({ 
    connectionStatus: status,
    isConnected: status === 'connected' || status === 'polling'
  }),

  fetchInitialData: async () => {
    try {
      set({ isConnected: true });
      
      // Get current session
      const session = await openF1Api.getCurrentSession();
      if (session) {
        set({ currentSession: session });
        
        // Fetch all initial data
        const data = await openF1Api.getDashboardData(session.session_key);
        
        set({
          drivers: data.drivers,
          livePositions: data.positions,
          liveIntervals: data.intervals,
          weather: data.weather,
          raceControl: data.raceControl,
          locations: data.locations.reduce((acc, loc) => {
            acc[loc.driver_number] = loc;
            return acc;
          }, {} as Record<number, any>),
          lastUpdate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      set({ isConnected: false });
    }
  },

  startLiveUpdates: () => {
    const state = get();
    if (!state.currentSession) {
      console.error('No current session for live updates');
      return () => {};
    }

    return openF1Api.startLiveDataStream((update: WSMessage) => {
      if (update.type === 'dashboard_update') {
        const data = update.data;
        set({
          drivers: data.drivers,
          livePositions: data.positions,
          liveIntervals: data.intervals,
          weather: data.weather,
          raceControl: data.raceControl,
          locations: data.locations.reduce((acc: Record<number, any>, loc: any) => {
            acc[loc.driver_number] = loc;
            return acc;
          }, {}),
          lastUpdate: update.timestamp,
          isConnected: true
        });
      }
    }, 2000, state.currentSession.session_key);
  }
}));
