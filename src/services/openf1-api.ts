// OpenF1 API integration service
import { 
  Driver, 
  Session, 
  Meeting,
  Position, 
  Interval, 
  CarData, 
  LocationData, 
  WeatherData, 
  LapData, 
  PitData, 
  TyreData,
  RaceControl 
} from '@/types/f1-types';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export class OpenF1Service {
  private static instance: OpenF1Service;
  private sessionKey: number | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 10000; // 10 second cache to reduce API calls
  private requestCount = 0;
  private requestWindow = 60000; // 1 minute window
  private maxRequestsPerWindow = 30; // Conservative limit to prevent 429 errors
  private lastRequestWindowReset = Date.now();
  private isRateLimited = false;
  private rateLimitResetTime = 0;

  private constructor() {}

  public static getInstance(): OpenF1Service {
    if (!OpenF1Service.instance) {
      OpenF1Service.instance = new OpenF1Service();
    }
    return OpenF1Service.instance;
  }

  // Cache management
  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private getFromCache<T>(key: string): T[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCache<T>(key: string, data: T[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Rate limiting check
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Check if we're currently rate limited
    if (this.isRateLimited && now < this.rateLimitResetTime) {
      console.warn('Rate limited, waiting until', new Date(this.rateLimitResetTime));
      return false;
    }
    
    // Reset rate limit status
    if (this.isRateLimited && now >= this.rateLimitResetTime) {
      this.isRateLimited = false;
      this.requestCount = 0;
      this.lastRequestWindowReset = now;
    }
    
    // Reset request window if needed
    if (now - this.lastRequestWindowReset > this.requestWindow) {
      this.requestCount = 0;
      this.lastRequestWindowReset = now;
    }
    
    // Check if we're exceeding rate limits
    if (this.requestCount >= this.maxRequestsPerWindow) {
      console.warn('Rate limit exceeded, throttling requests');
      return false;
    }
    
    return true;
  }

  // Generic fetch method with error handling and caching
  private async fetchFromAPI<T>(endpoint: string, params?: Record<string, any>): Promise<T[]> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache first for all endpoints (increased cache usage)
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check rate limiting
    if (!this.checkRateLimit()) {
      // Return cached data even if expired when rate limited
      const expiredCached = this.cache.get(cacheKey);
      if (expiredCached) {
        console.warn('Using expired cache due to rate limiting');
        return expiredCached.data;
      }
      return [];
    }

    try {
      this.requestCount++;
      
      const url = new URL(`${OPENF1_BASE_URL}${endpoint}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'F1-Dashboard/1.0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          // Handle rate limiting
          this.isRateLimited = true;
          this.rateLimitResetTime = Date.now() + 60000; // Wait 1 minute
          console.warn('Rate limited by OpenF1 API, waiting 1 minute');
          
          // Return cached data if available
          const fallbackCached = this.cache.get(cacheKey);
          if (fallbackCached) {
            return fallbackCached.data;
          }
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      
      // Return cached data as fallback
      const fallbackCached = this.cache.get(cacheKey);
      if (fallbackCached) {
        console.warn('Using cached data as fallback');
        return fallbackCached.data;
      }
      
      return [];
    }
  }

  // Get current or latest session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const sessions = await this.fetchFromAPI<Session>('/sessions', {
        year: new Date().getFullYear(),
        limit: 1
      });
      
      if (sessions.length > 0) {
        this.sessionKey = sessions[0].session_key;
        return sessions[0];
      }
      return null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // Get all sessions
  async getSessions(year?: number): Promise<Session[]> {
    const currentYear = year || new Date().getFullYear();
    return this.fetchFromAPI<Session>('/sessions', { year: currentYear });
  }

  // Get all drivers for the current session
  async getDrivers(sessionKey?: number): Promise<Driver[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    return this.fetchFromAPI<Driver>('/drivers', {
      session_key: key
    });
  }

  // Get live positions
  async getPositions(sessionKey?: number): Promise<Position[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    return this.fetchFromAPI<Position>('/position', {
      session_key: key
    });
  }

  // Get live intervals/gaps
  async getIntervals(sessionKey?: number): Promise<Interval[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    return this.fetchFromAPI<Interval>('/intervals', {
      session_key: key
    });
  }

  // Get car telemetry data
  async getCarData(sessionKey?: number, driverNumbers?: number[]): Promise<CarData[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    const params: any = { session_key: key };
    if (driverNumbers && driverNumbers.length > 0) {
      params.driver_number = driverNumbers.join(',');
    }

    return this.fetchFromAPI<CarData>('/car_data', params);
  }

  // Get car location data for track map
  async getLocationData(sessionKey?: number): Promise<LocationData[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    return this.fetchFromAPI<LocationData>('/location', {
      session_key: key
    });
  }

  // Get weather data
  async getWeatherData(sessionKey?: number): Promise<WeatherData[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    return this.fetchFromAPI<WeatherData>('/weather', {
      session_key: key
    });
  }

  // Get lap data
  async getLapData(sessionKey?: number, driverNumber?: number): Promise<LapData[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    const params: any = { session_key: key };
    if (driverNumber) {
      params.driver_number = driverNumber;
    }

    return this.fetchFromAPI<LapData>('/laps', params);
  }

  // Get pit stop data
  async getPitData(sessionKey?: number): Promise<PitData[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    return this.fetchFromAPI<PitData>('/pit', {
      session_key: key
    });
  }

  // Get race control messages
  async getRaceControl(sessionKey?: number): Promise<RaceControl[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    return this.fetchFromAPI<RaceControl>('/race_control', {
      session_key: key
    });
  }

  // Get tyre data
  async getTyreData(sessionKey?: number): Promise<TyreData[]> {
    const key = sessionKey || this.sessionKey;
    if (!key) return [];

    return this.fetchFromAPI<TyreData>('/stints', {
      session_key: key
    });
  }

  // Get sessions for a specific year
  async getSessionsByYear(year: number): Promise<Session[]> {
    return this.fetchFromAPI<Session>('/sessions', { year });
  }

  // Get all meetings (Grand Prix weekends)
  async getMeetings(year?: number): Promise<Meeting[]> {
    const currentYear = year || new Date().getFullYear();
    return this.fetchFromAPI<Meeting>('/meetings', { year: currentYear });
  }
  // Get latest data for dashboard
  async getDashboardData(sessionKey?: number) {
    const key = sessionKey || this.sessionKey;
    if (!key) {
      throw new Error('No session key available');
    }

    try {
      const [
        drivers,
        positions,
        intervals,
        weather,
        raceControl,
        locations,
        carData,
        tyreData
      ] = await Promise.all([
        this.getDrivers(key),
        this.getPositions(key),
        this.getIntervals(key),
        this.getWeatherData(key),
        this.getRaceControl(key),
        this.getLocationData(key),
        this.getCarData(key),
        this.getTyreData(key)
      ]);

      return {
        drivers,
        positions,
        intervals,
        weather: weather[weather.length - 1] || null, // Get latest weather
        raceControl,
        locations,
        carData,
        tyreData
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Check if session is currently live
  async isSessionLive(sessionKey?: number): Promise<boolean> {
    const session = await this.getCurrentSession();
    if (!session) return false;

    const now = new Date();
    const sessionStart = new Date(session.date_start);
    const sessionEnd = new Date(session.date_end);

    return now >= sessionStart && now <= sessionEnd;
  }

  // Stream live data with WebSocket-like polling
  startLiveDataStream(
    callback: (data: any) => void, 
    intervalMs: number = 10000, // Increased from 1000ms to 10000ms to reduce API calls
    sessionKey?: number
  ): () => void {
    const key = sessionKey || this.sessionKey;
    if (!key) {
      console.error('No session key for live data stream');
      return () => {};
    }

    const interval = setInterval(async () => {
      try {
        const data = await this.getDashboardData(key);
        callback({
          type: 'dashboard_update',
          data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error in live data stream:', error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

// Export singleton instance
export const openF1Api = OpenF1Service.getInstance();
