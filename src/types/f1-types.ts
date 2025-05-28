// F1 Data Types for OpenF1 API integration

export interface Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url?: string;
  country_code: string;
}

export interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  session_path: string;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  year: number;
}

export interface Position {
  driver_number: number;
  date: string;
  position: number;
}

export interface Interval {
  driver_number: number;
  date: string;
  gap_to_leader?: number;
  interval?: number;
}

export interface CarData {
  driver_number: number;
  date: string;
  rpm?: number;
  speed?: number;
  n_gear?: number;
  throttle?: number;
  brake?: number;
  drs?: number;
}

export interface LocationData {
  driver_number: number;
  date: string;
  x: number;
  y: number;
  z: number;
}

export interface WeatherData {
  date: string;
  air_temperature: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
}

export interface LapData {
  driver_number: number;
  date_start: string;
  lap_duration?: number;
  lap_number: number;
  is_pit_out_lap: boolean;
  segments_sector_1?: number[];
  segments_sector_2?: number[];
  segments_sector_3?: number[];
}

export interface PitData {
  driver_number: number;
  date: string;
  lap_number: number;
  pit_duration?: number;
}

export interface TyreData {
  driver_number: number;
  date: string;
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
  age: number;
}

export interface RaceControl {
  date: string;
  category: 'Flag' | 'SafetyCar' | 'VSC' | 'DRS' | 'Other';
  flag?: 'GREEN' | 'YELLOW' | 'RED' | 'CHEQUERED';
  lap_number?: number;
  message: string;
  scope?: 'Track' | 'Sector' | 'Driver';
  sector?: number;
  driver_number?: number;
}

export interface Meeting {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number | string; // Allow both number (from API) and string (for fallback data)
  meeting_name: string;
  meeting_official_name: string;
  year: number;
}

// Dashboard state types
export interface DashboardState {
  currentSession: Session | null;
  drivers: Driver[];
  livePositions: Position[];
  liveIntervals: Interval[];
  carData: Record<number, CarData>;
  locations: Record<number, LocationData>;
  weather: WeatherData | null;
  raceControl: RaceControl[];
  isConnected: boolean;
  lastUpdate: string;
}

// WebSocket message types
export interface WSMessage {
  type: 'position' | 'interval' | 'car_data' | 'location' | 'weather' | 'race_control' | 'dashboard_update';
  data: any;
  timestamp: string;
}

// UI Component props
export interface TrackMapProps {
  locations: Record<number, LocationData>;
  drivers: Driver[];
}

export interface TimingTowerProps {
  positions: Position[];
  intervals: Interval[];
  drivers: Driver[];
}

export interface TelemetryChartProps {
  carData: Record<number, CarData>;
  selectedDrivers: number[];
  dataType: 'speed' | 'throttle' | 'brake' | 'rpm';
}

export interface WeatherWidgetProps {
  weather: WeatherData | null;
}

export interface AlertsProps {
  raceControl: RaceControl[];
  onDismiss: (index: number) => void;
}

// Additional types for WebSocket service
export interface DriverPosition {
  driver_number: number;
  position: number;
  gap_to_leader: string;
  interval: string;
  date: string;
}

export interface RaceControlMessage {
  date: string;
  category: 'Flag' | 'SafetyCar' | 'VSC' | 'DRS' | 'Other';
  flag?: 'GREEN' | 'YELLOW' | 'RED' | 'CHEQUERED';
  lap_number?: number;
  message: string;
  scope?: 'Track' | 'Sector' | 'Driver';
  sector?: number;
  driver_number?: number;
}

export interface SessionInfo {
  name: string;
  type: string;
  status: 'live' | 'finished' | 'upcoming';
  timeRemaining: number;
  currentLap: number;
  totalLaps: number;
}

// Connection status types
export type ConnectionStatus = 'connected' | 'disconnected' | 'polling' | 'error';
