// Test script to verify the fallback calendar data works for future F1 races
const FALLBACK_2025_CALENDAR = [
  {
    meeting_name: "Canadian Grand Prix",
    country_name: "Canada",
    country_code: "CA",
    circuit_short_name: "Montreal",
    date_start: "2025-06-13T14:00:00+00:00",
    meeting_key: "2025-canadian-gp"
  },
  {
    meeting_name: "Spanish Grand Prix",
    country_name: "Spain",
    country_code: "ES",
    circuit_short_name: "Barcelona",
    date_start: "2025-06-27T14:00:00+00:00",
    meeting_key: "2025-spanish-gp"
  }
];

// Mock today's date as May 28, 2025
const now = new Date("2025-05-28T12:00:00Z");
console.log(`Current date: ${now.toISOString()}`);

// Filter for future races
const upcomingRaces = FALLBACK_2025_CALENDAR.filter(race => {
  const raceDate = new Date(race.date_start);
  const isUpcoming = raceDate > now;
  console.log(`Race: ${race.meeting_name} on ${race.date_start} - Upcoming: ${isUpcoming}`);
  return isUpcoming;
});

console.log(`\nFound ${upcomingRaces.length} upcoming races:`);
upcomingRaces.forEach((race, index) => {
  const raceDate = new Date(race.date_start);
  const daysUntil = Math.ceil((raceDate - now) / (1000 * 60 * 60 * 24));
  console.log(`${index + 1}. ${race.meeting_name} (${race.country_name}) - In ${daysUntil} days`);
});
