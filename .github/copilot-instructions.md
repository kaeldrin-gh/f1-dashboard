# F1 Dashboard Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a real-time F1 telemetry and timing dashboard built with Next.js, TypeScript, and modern data visualization libraries.

## Key Technologies
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Data Visualization**: Plotly.js, D3.js, Recharts
- **Real-time**: WebSocket connections via Socket.io
- **State Management**: Zustand
- **Data Fetching**: SWR for caching and revalidation
- **F1 Data Sources**: OpenF1 API, FastF1 Python integration

## Architecture Guidelines
- Use server components where possible, client components for interactivity
- Implement real-time WebSocket connections for live timing data
- Create modular, reusable components for different telemetry displays
- Use TypeScript interfaces for all F1 data structures
- Implement proper error boundaries and loading states
- Follow responsive design principles for mobile/tablet viewing

## F1 Data Integration
- OpenF1 API for live timing, positions, telemetry
- Track position data with moving car dots on circuit maps
- Real-time gap analysis between drivers
- Tyre compound and age tracking
- ERS (Energy Recovery System) deployment states
- Weather conditions and track temperature
- Pit window calculations and strategy analysis
- VSC/Safety Car detection and alerts
- Penalty and steward decision notifications

## API Documentation
- OpenF1 API Documentation: [OpenF1 API](https://openf1.org)
- API Base URL: `https://api.openf1.org/v1/`

## OpenF1 API Guidelines
When working with Formula 1 data, always refer to the [OpenF1 API documentation](https://openf1.org) for endpoint specifications and data structures. The API provides real-time and historical Formula 1 data including lap timings, car telemetry, radio communications, and driver information.

## Data Format
All API responses are available in JSON format. Use appropriate query parameters for filtering data by session, driver, or time ranges.

## Component Structure
- Dashboard layout with multiple synchronized widgets
- Track map with real-time car positions
- Timing tower with live gaps and sectors
- Telemetry charts (speed, throttle, brake, gear)
- Weather and track condition displays
- Alert system for race incidents
- Driver comparison tools
