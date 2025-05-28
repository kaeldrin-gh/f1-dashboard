'use client';

import { useEffect, useState, useRef } from 'react';
import { Meeting } from '@/types/f1-types';

// Hardcoded 2025 F1 calendar
const FALLBACK_2025_CALENDAR: Partial<Meeting>[] = [
  {
    meeting_name: "Spanish Grand Prix",
    country_name: "Spain",
    country_code: "ES",
    circuit_short_name: "Barcelona",
    date_start: "2025-06-01T13:00:00+00:00",
    meeting_key: "2025-spain-gp"
  },
  {
    meeting_name: "Canadian Grand Prix",
    country_name: "Canada",
    country_code: "CA",
    circuit_short_name: "Montreal",
    date_start: "2025-06-15T18:00:00+00:00",
    meeting_key: "2025-canada-gp"
  },
  {
    meeting_name: "Austrian Grand Prix",
    country_name: "Austria",
    country_code: "AT",
    circuit_short_name: "Spielberg",
    date_start: "2025-06-29T13:00:00+00:00",
    meeting_key: "2025-austria-gp"
  },
  {
    meeting_name: "British Grand Prix",
    country_name: "United Kingdom",
    country_code: "GB",
    circuit_short_name: "Silverstone",
    date_start: "2025-07-06T14:00:00+00:00",
    meeting_key: "2025-britain-gp"
  },
  {
    meeting_name: "Belgian Grand Prix",
    country_name: "Belgium",
    country_code: "BE",
    circuit_short_name: "Spa",
    date_start: "2025-07-27T13:00:00+00:00",
    meeting_key: "2025-belgium-gp"
  },
  {
    meeting_name: "Hungarian Grand Prix",
    country_name: "Hungary",
    country_code: "HU",
    circuit_short_name: "Budapest",
    date_start: "2025-08-03T13:00:00+00:00",
    meeting_key: "2025-hungary-gp"
  },
  {
    meeting_name: "Dutch Grand Prix",
    country_name: "Netherlands",
    country_code: "NL",
    circuit_short_name: "Zandvoort",
    date_start: "2025-08-31T13:00:00+00:00",
    meeting_key: "2025-netherlands-gp"
  },
  {
    meeting_name: "Italian Grand Prix",
    country_name: "Italy",
    country_code: "IT",
    circuit_short_name: "Monza",
    date_start: "2025-09-07T13:00:00+00:00",
    meeting_key: "2025-italy-gp"
  },
  {
    meeting_name: "Azerbaijan Grand Prix",
    country_name: "Azerbaijan",
    country_code: "AZ",
    circuit_short_name: "Baku",
    date_start: "2025-09-21T11:00:00+00:00",
    meeting_key: "2025-azerbaijan-gp"
  },
  {
    meeting_name: "Singapore Grand Prix",
    country_name: "Singapore",
    country_code: "SG",
    circuit_short_name: "Marina Bay",
    date_start: "2025-10-05T12:00:00+00:00",
    meeting_key: "2025-singapore-gp"
  },
  {
    meeting_name: "United States Grand Prix",
    country_name: "United States",
    country_code: "US",
    circuit_short_name: "Austin",
    date_start: "2025-10-19T19:00:00+00:00",
    meeting_key: "2025-usa-gp"
  },
  {
    meeting_name: "Mexico City Grand Prix",
    country_name: "Mexico",
    country_code: "MX",
    circuit_short_name: "Mexico City",
    date_start: "2025-10-26T20:00:00+00:00",
    meeting_key: "2025-mexico-gp"
  },
  {
    meeting_name: "São Paulo Grand Prix",
    country_name: "Brazil",
    country_code: "BR",
    circuit_short_name: "Interlagos",
    date_start: "2025-11-09T17:00:00+00:00",
    meeting_key: "2025-brazil-gp"
  },
  {
    meeting_name: "Las Vegas Grand Prix",
    country_name: "United States",
    country_code: "US",
    circuit_short_name: "Las Vegas",
    date_start: "2025-11-22T22:00:00+00:00",
    meeting_key: "2025-vegas-gp"
  },
  {
    meeting_name: "Qatar Grand Prix",
    country_name: "Qatar",
    country_code: "QA",
    circuit_short_name: "Losail",
    date_start: "2025-11-30T15:00:00+00:00",
    meeting_key: "2025-qatar-gp"
  },
  {
    meeting_name: "Abu Dhabi Grand Prix",
    country_name: "United Arab Emirates",
    country_code: "AE",
    circuit_short_name: "Yas Marina",
    date_start: "2025-12-07T13:00:00+00:00",
    meeting_key: "2025-abudhabi-gp"
  }
];

interface UpcomingRacesProps {
  maxVisibleRaces?: number;
}

export function UpcomingRaces({ maxVisibleRaces = 3 }: UpcomingRacesProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // No need to fetch from API anymore, just filter our hardcoded calendar
    try {
      setLoading(true);
      setError(null);
      
      // Filter calendar for future dates
      const now = new Date();
      const upcomingRaces = FALLBACK_2025_CALENDAR.filter(meeting => {
        const meetingDate = new Date(meeting.date_start || '');
        return meetingDate > now;
      }).map(meeting => meeting as Meeting); // Type cast to Meeting
      
      console.log(`Found ${upcomingRaces.length} upcoming races in calendar`);
      
      if (upcomingRaces.length > 0) {
        setMeetings(upcomingRaces);
      } else {
        // If even our calendar has no upcoming races
        setError('No upcoming F1 races found. The 2025 season has concluded.');
      }
    } catch (err) {
      console.error('Error processing upcoming races:', err);
      setError(`Failed to process upcoming races: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatRaceDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRaceTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };  
  
  const getDaysUntilRace = (dateString: string) => {
    const raceDate = new Date(dateString);
    const now = new Date();
    const diffTime = raceDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''}`;
  };
  
  const getCountryFlag = (countryCode: string) => {
    // Simple flag emoji mapping for common F1 countries
    const flagMap: { [key: string]: string } = {
      'GB': '🇬🇧', 'AE': '🇦🇪', 'SA': '🇸🇦', 'AU': '🇦🇺', 'IT': '🇮🇹',
      'US': '🇺🇸', 'ES': '🇪🇸', 'MC': '🇲🇨', 'CA': '🇨🇦', 'AT': '🇦🇹',
      'FR': '🇫🇷', 'HU': '🇭🇺', 'BE': '🇧🇪', 'NL': '🇳🇱', 'AZ': '🇦🇿',
      'SG': '🇸🇬', 'JP': '🇯🇵', 'QA': '🇶🇦', 'MX': '🇲🇽', 'BR': '🇧🇷'
    };
    return flagMap[countryCode] || '🏁';
  };
  
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, meetings.length - maxVisibleRaces);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const visibleMeetings = meetings.slice(currentIndex, currentIndex + maxVisibleRaces);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < meetings.length - maxVisibleRaces;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mb-3"></div>
          <p className="text-gray-400 text-sm">Loading upcoming races...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-sm">{error}</p>
        <p className="text-gray-500 text-xs mt-2">Check your connection and try again</p>
      </div>
    );
  }  
  
  if (meetings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No upcoming races available</p>
        <p className="text-gray-500 text-xs mt-2">The 2025 F1 season has concluded.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Upcoming Races</h3>
          {meetings.length > maxVisibleRaces && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={!canGoBack}
              className={`p-1 rounded-full transition-colors ${
                canGoBack 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-xs text-gray-500">
              {currentIndex + 1}-{Math.min(currentIndex + maxVisibleRaces, meetings.length)} of {meetings.length}
            </span>
            
            <button
              onClick={handleNext}
              disabled={!canGoForward}
              className={`p-1 rounded-full transition-colors ${
                canGoForward 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Race cards */}
      <div className="space-y-3">
        {visibleMeetings.map((meeting, index) => {
          const globalIndex = currentIndex + index;
          const isNext = globalIndex === 0; // First upcoming race
          const daysUntil = getDaysUntilRace(meeting.date_start);
          
          return (
            <div
              key={meeting.meeting_key}
              className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-lg ${
                isNext 
                  ? 'bg-red-900/20 border-red-500/50 shadow-md' 
                  : 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/70'
              }`}
            >
              {isNext && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  NEXT
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCountryFlag(meeting.country_code)}</span>
                    <h3 className={`font-semibold truncate ${
                      isNext ? 'text-red-400' : 'text-white'
                    }`}>
                      {meeting.country_name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-1 truncate">
                    {meeting.circuit_short_name}
                  </p>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{formatRaceDate(meeting.date_start)}</p>
                    <p>{formatRaceTime(meeting.date_start)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end ml-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isNext 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-gray-600/50 text-gray-300'
                  }`}>
                    {daysUntil}
                  </span>
                  
                  {meeting.meeting_name && (
                    <span className="text-xs text-gray-500 mt-1 truncate max-w-20">
                      {meeting.meeting_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          {meetings.length > 0 
            ? `${meetings.length} upcoming race${meetings.length > 1 ? 's' : ''} • 2025 F1 Season`
            : 'No upcoming races scheduled'
          }
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Showing predicted 2025 F1 calendar
        </p>
      </div>
    </div>
  );
}