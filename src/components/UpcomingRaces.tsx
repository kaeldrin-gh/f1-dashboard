'use client';

import { useEffect, useState, useRef } from 'react';
 import { Meeting } from '@/types/f1-types';

// Define TabType
type TabType = 'upcoming' | 'finished';

// Interface for Finished Race Data from Jolpi API
interface JolpiDriver {
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
}

interface JolpiConstructor {
  constructorId: string;
  name: string;
}

interface JolpiRaceResultItem {
  position: string;
  Driver: JolpiDriver;
  Constructor: JolpiConstructor;
}

interface JolpiCircuit {
  circuitId: string;
  circuitName: string;
  Location: {
    country: string;
    locality: string;
  };
}

interface JolpiRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  Circuit: JolpiCircuit;
  Results: JolpiRaceResultItem[];
}

interface JolpiRaceTable {
  Races: JolpiRace[];
}

interface JolpiMRData {
  RaceTable: JolpiRaceTable;
  total?: string; // Total number of results available
  limit?: string; // The number of results per page
  offset?: string; // The number of results skipped
}

interface JolpiResponse {
  MRData: JolpiMRData;
}

interface FinishedRace {
  key: string; // season-round
  raceName: string;
  country: string;
  circuitName: string;
  date: string;
  winnerName: string;
  winnerTeam: string;
}

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
  const [loading, setLoading] = useState(true); // For upcoming races
  const [error, setError] = useState<string | null>(null); // For upcoming races
  
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [finishedRaces, setFinishedRaces] = useState<FinishedRace[]>([]);
  const [finishedRacesLoading, setFinishedRacesLoading] = useState(true);
  const [finishedRacesError, setFinishedRacesError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper booleans for active tab
  const isUpcomingTab = activeTab === 'upcoming';
  const isFinishedTab = activeTab === 'finished';

  useEffect(() => {
    // Fetch upcoming races (existing logic)
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
    }    // Fetch finished races for 2025 season
    const fetchFinishedRaces = async () => {
      try {
        setFinishedRacesLoading(true);
        setFinishedRacesError(null);
        
        // Fetch all races with pagination since API has a lower limit than 10000
        let allRaces: JolpiRace[] = [];
        let offset = 0;
        const limit = 100; // Use API's default limit
        let hasMoreData = true;
        
        while (hasMoreData) {
          const response = await fetch(`https://api.jolpi.ca/ergast/f1/2025/results.json?limit=${limit}&offset=${offset}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch finished races: ${response.statusText} (status: ${response.status})`);
          }
          const data: JolpiResponse = await response.json();
          
          if (data.MRData && data.MRData.RaceTable && data.MRData.RaceTable.Races) {
            const races = data.MRData.RaceTable.Races;
            
            // Add unique races (avoid duplicates based on season-round)
            races.forEach(race => {
              const exists = allRaces.some(existingRace => 
                existingRace.season === race.season && existingRace.round === race.round
              );
              if (!exists) {
                allRaces.push(race);
              }
            });
            
            // Check if we have more data to fetch
            const total = parseInt(data.MRData.total || '0');
            const currentOffset = parseInt(data.MRData.offset || '0');
            const currentLimit = parseInt(data.MRData.limit || '0');
            
            hasMoreData = (currentOffset + currentLimit) < total;
            offset += limit;
            
            console.log(`[UpcomingRaces] Fetched batch: offset=${currentOffset}, limit=${currentLimit}, total=${total}, races in batch=${races.length}, unique races so far=${allRaces.length}`);
          } else {
            hasMoreData = false;
          }
        }
        
        console.log('[UpcomingRaces] Total unique Race objects fetched from API for 2025:', allRaces.length);
        allRaces.forEach(r => {
          console.log(`[UpcomingRaces] API Race: ${r.raceName}, Date: ${r.date}, Round: ${r.round}, Results count: ${r.Results?.length || 0}`);
        });
        
        const processedRaces: FinishedRace[] = allRaces
          .filter(race => {
            const hasResults = race.Results && race.Results.length > 0;
            return hasResults; // Only filter by presence of results
          }) 
          .map(race => ({
            key: `${race.season}-${race.round}`,
            raceName: race.raceName,
            country: race.Circuit.Location.country,
            circuitName: race.Circuit.circuitName,
            date: race.date,
            winnerName: `${race.Results[0].Driver.givenName} ${race.Results[0].Driver.familyName}`,
            winnerTeam: race.Results[0].Constructor.name,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
          
        setFinishedRaces(processedRaces);
        console.log('[UpcomingRaces] Processed finished races (after filtering for results only):', processedRaces.length);

        if (processedRaces.length === 0) {
          if (allRaces.length > 0) {
            console.warn('All fetched races were filtered out (e.g., none had results).');
          } else {
            console.warn('API returned no races for 2025 or unexpected structure.');
          }
        }
      } catch (err) {
        console.error('Error fetching finished races (with pagination):', err);
        setFinishedRacesError(`Failed to fetch finished races: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setFinishedRacesLoading(false);
      }
    };

    fetchFinishedRaces();

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
  
  const getCountryFlag = (countryCodeOrName: string) => {
    // Simple flag emoji mapping for common F1 countries
    const flagMap: { [key: string]: string } = {
      'GB': '🇬🇧', 'AE': '🇦🇪', 'SA': '🇸🇦', 'AU': '🇦🇺', 'IT': '🇮🇹',
      'US': '🇺🇸', 'ES': '🇪🇸', 'MC': '🇲🇨', 'CA': '🇨🇦', 'AT': '🇦🇹',
      'FR': '🇫🇷', 'HU': '🇭🇺', 'BE': '🇧🇪', 'NL': '🇳🇱', 'AZ': '🇦🇿',
      'SG': '🇸🇬', 'JP': '🇯🇵', 'QA': '🇶🇦', 'MX': '🇲🇽', 'BR': '🇧🇷',
      // Add full country names if needed from Jolpi API
      'UK': '🇬🇧', 'UAE': '🇦🇪', 'Saudi Arabia': '🇸🇦', 'Australia': '🇦🇺', 'Italy': '🇮🇹',
      'USA': '🇺🇸', 'Spain': '🇪🇸', 'Monaco': '🇲🇨', 'Canada': '🇨🇦', 'Austria': '🇦🇹',
      'France': '🇫🇷', 'Hungary': '🇭🇺', 'Belgium': '🇧🇪', 'Netherlands': '🇳🇱', 'Azerbaijan': '🇦🇿',
      'Singapore': '🇸🇬', 'Japan': '🇯🇵', 'Qatar': '🇶🇦', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷'
    };
    return flagMap[countryCodeOrName.toUpperCase()] || flagMap[countryCodeOrName] || '🏁'; // Try uppercase for codes like 'AE', then original, then fallback
  };
  
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const currentList = isUpcomingTab ? meetings : finishedRaces;
    const maxIndex = Math.max(0, currentList.length - maxVisibleRaces);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const currentData = isUpcomingTab ? meetings : finishedRaces;
  const upcomingVisibleMeetings = meetings.slice(currentIndex, currentIndex + maxVisibleRaces);
  const visibleFinishedRaces = finishedRaces.slice(currentIndex, currentIndex + maxVisibleRaces);
  
  const canGoBack = currentIndex > 0;
  const currentListForForwardCheck = isUpcomingTab ? meetings : finishedRaces;
  const canGoForward = currentIndex < (currentListForForwardCheck.length - maxVisibleRaces);

  if (loading && isUpcomingTab) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mb-3"></div>
          <p className="text-gray-400 text-sm">Loading upcoming races...</p>
        </div>
      </div>
    );
  }

  if (finishedRacesLoading && isFinishedTab) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-400 text-sm">Loading finished races...</p>
        </div>
      </div>
    );
  }

  if (error && isUpcomingTab) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-sm">{error}</p>
        <p className="text-gray-500 text-xs mt-2">Check your connection and try again</p>
      </div>
    );
  }  

  if (finishedRacesError && isFinishedTab) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-sm">{finishedRacesError}</p>
        <p className="text-gray-500 text-xs mt-2">Could not load finished race data. Please try again later.</p>
      </div>
    );
  }
  
  // Combined loading/empty state for initial view before tabs are explicitly shown or if one tab has no data
  if (isUpcomingTab && meetings.length === 0 && !loading) {
    // Render tabs even if upcoming is empty, so user can switch to finished
  } else if (isFinishedTab && finishedRaces.length === 0 && !finishedRacesLoading) {
    // Render tabs even if finished is empty
  }

  return (
    <div className="space-y-4">
      {/* Tab Buttons */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => { setActiveTab('upcoming'); setCurrentIndex(0); }}
          className={`py-2 px-4 text-sm font-medium transition-colors ${
            isUpcomingTab
              ? 'border-b-2 border-red-500 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Upcoming ({meetings.length})
        </button>
        <button
          onClick={() => { setActiveTab('finished'); setCurrentIndex(0); }}
          className={`py-2 px-4 text-sm font-medium transition-colors ${
            isFinishedTab
              ? 'border-b-2 border-blue-500 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Finished ({finishedRaces.length})
        </button>
      </div>      {/* Header with navigation - adjust for active tab */}
      <div className="flex items-center justify-end">
          {/* Pagination controls: Show for active tab if it has more races than maxVisibleRaces */}
          {((isUpcomingTab && meetings.length > maxVisibleRaces) || 
            (isFinishedTab && finishedRaces.length > maxVisibleRaces)) && (
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
              {currentIndex + 1}-{
                isUpcomingTab 
                  ? Math.min(currentIndex + maxVisibleRaces, meetings.length) 
                  : Math.min(currentIndex + maxVisibleRaces, finishedRaces.length)
              } of {isUpcomingTab ? meetings.length : finishedRaces.length}
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
      
      {/* Race cards - Conditional Rendering */}
      {isUpcomingTab && (
        <> 
          {meetings.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No upcoming races available</p>
              <p className="text-gray-500 text-xs mt-2">The 2025 F1 season may have concluded or data is unavailable.</p>
            </div>
          )}
          {meetings.length > 0 && (
            <div className="space-y-3">
              {/* Use upcomingVisibleMeetings for pagination */}
              {upcomingVisibleMeetings.map((meeting, index) => {
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
          )}
        </>
      )}

      {isFinishedTab && (
        <>
          {finishedRaces.length === 0 && !finishedRacesLoading && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No finished races found for 2025 yet.</p>
              <p className="text-gray-500 text-xs mt-2">Check back after races have concluded or data is updated.</p>
            </div>
          )}
          {finishedRaces.length > 0 && (
            <div className="space-y-3">
              {/* Display paginated finished races */}
              {visibleFinishedRaces.map((race) => (
                <div
                  key={race.key}
                  className="bg-gray-700/50 border border-gray-600/50 p-4 rounded-lg hover:bg-gray-700/70 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCountryFlag(race.country)}</span>
                        <h3 className="font-semibold text-white truncate">
                          {race.raceName}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-1 truncate">
                        {race.circuitName}
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>{formatRaceDate(race.date)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-2 text-right">
                      <p className="text-sm font-semibold text-yellow-400">Winner:</p>
                      <p className="text-sm text-white truncate" title={`${race.winnerName} (${race.winnerTeam})`}>{race.winnerName}</p>
                      <p className="text-xs text-gray-400 truncate">{race.winnerTeam}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          {isUpcomingTab && (
            meetings.length > 0 
              ? `${meetings.length} upcoming race${meetings.length > 1 ? 's' : ''} • 2025 F1 Season`
              : 'No upcoming races scheduled for 2025'
          )}
          {isFinishedTab && (
            finishedRaces.length > 0
              ? `${finishedRaces.length} finished race${finishedRaces.length > 1 ? 's' : ''} • 2025 F1 Season`
              : 'No finished races recorded yet for 2025'
          )}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {isUpcomingTab 
            ? 'Showing predicted 2025 F1 calendar'
            : 'Finished race data from Jolpi API (Ergast)'
          }
        </p>
      </div>
    </div>
  );
}