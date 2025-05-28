// Quick test to verify the meetings API is working
async function testMeetingsAPI() {
    try {
        const response = await fetch('https://api.openf1.org/v1/meetings?year=2025');
        const meetings = await response.json();
        
        console.log('Total meetings found:', meetings.length);
        console.log('Current date:', new Date());
        
        // Show all meetings with their dates
        console.log('\nAll 2025 meetings:');
        meetings.forEach((meeting, index) => {
            const meetingDate = new Date(meeting.date_start);
            const isUpcoming = meetingDate > new Date();
            console.log(`${index + 1}. ${meeting.meeting_name} - ${meeting.date_start} - ${isUpcoming ? 'UPCOMING' : 'PAST'}`);
        });
        
        const now = new Date();
        const upcomingMeetings = meetings
            .filter(meeting => {
                const meetingDate = new Date(meeting.date_start);
                return meetingDate > now;
            })
            .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
          console.log('\nUpcoming meetings:', upcomingMeetings.length);
        
        upcomingMeetings.slice(0, 3).forEach((meeting, index) => {
            console.log(`${index + 1}. ${meeting.meeting_name} - ${meeting.date_start} - ${meeting.location}`);
        });
        
    } catch (error) {
        console.error('Error fetching meetings:', error);
    }
}

testMeetingsAPI();
