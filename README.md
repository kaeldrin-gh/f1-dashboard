# 🏎️ F1 Dashboard (WIP)

A real-time Formula 1 telemetry and timing dashboard built with Next.js, providing live race data, track maps, and comprehensive analytics for F1 enthusiasts and professionals.

<div align="center">
  <img src="https://github.com/user-attachments/assets/3cfdb48b-1aca-439e-93fb-8388378ab187" alt="F1 race dashboard displaying live timing and telemetry data">
  <p><em>(Image shows 2024 mock data due to no live session at that moment.)</em></p>
</div>

## ✨ Features

### 🔴 Real-Time Data
- **Live Timing & Telemetry** - Real-time position updates, sector times, and gap analysis
- **Track Maps** - Interactive circuit maps with live car positions for 9 major F1 circuits
- **Session Management** - Support for Practice, Qualifying, Sprint, and Race sessions
- **WebSocket Integration** - Low-latency real-time updates via Socket.io

### 📊 Advanced Analytics
- **Telemetry Charts** - Speed, throttle, brake, and gear data visualization
- **Tyre Strategy** - Compound tracking, age monitoring, and pit window calculations
- **Weather Monitoring** - Track temperature, weather conditions, and grip analysis
- **Driver Comparisons** - Side-by-side performance analysis

### 🚨 Race Intelligence
- **Incident Alerts** - VSC/Safety Car detection and race control notifications
- **Position Changes** - Real-time overtaking and position swap tracking
- **Penalty System** - Steward decisions and penalty notifications
- **Pit Strategy** - Optimal pit window calculations and strategy analysis
- **Upcoming Races** - F1 calendar with upcoming race schedules and dates

### 🏁 Supported Circuits
- Monaco (Monte Carlo)
- Silverstone (British GP)
- Spa-Francorchamps (Belgian GP)
- Suzuka (Japanese GP)
- Monza (Italian GP)
- Interlagos (Brazilian GP)
- Hungaroring (Hungarian GP)
- Circuit of the Americas (US GP)
- Red Bull Ring (Austrian GP)
- Circuit de Barcelona-Catalunya (Spanish GP)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Data Visualization**: Plotly.js, D3.js, Recharts
- **Real-time**: WebSocket connections via Socket.io
- **State Management**: Zustand for efficient state handling
- **Data Fetching**: SWR for caching and revalidation
- **F1 Data**: OpenF1 API integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kaeldrin-gh/f1-dashboard.git
   cd f1-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the dashboard

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard layout
│   ├── TrackMap.tsx       # Interactive track visualization
│   ├── TimingTower.tsx    # Live timing and gaps
│   ├── TelemetryChart.tsx # Data visualization charts
│   ├── WeatherWidget.tsx  # Weather and track conditions
│   ├── Alerts.tsx         # Race incidents and notifications
│   ├── UpcomingRaces.tsx  # F1 calendar and race schedules
│   └── ...               # Additional components
├── services/              # External API integrations
│   ├── openf1-api.ts     # OpenF1 API service
│   └── websocket-service.ts # Real-time WebSocket handling
├── store/                 # State management
│   └── dashboard-store.ts # Zustand store
└── types/                 # TypeScript definitions
    └── f1-types.ts       # F1 data type definitions
```

## 🔌 Data Sources

### OpenF1 API
The dashboard integrates with the [OpenF1 API](https://openf1.org/) for:
- Live session data and timing
- Driver positions and telemetry
- Weather and track conditions
- Race control messages

### Real-Time Updates
- WebSocket connections for live data streaming
- Automatic reconnection handling
- Efficient data caching and state management

## 🎯 Usage

### Dashboard Navigation
- **Session Selection**: Choose between Practice, Qualifying, Sprint, or Race
- **Circuit Selection**: Pick from available F1 circuits
- **Driver Focus**: Select specific drivers for detailed analysis
- **Time Range**: Adjust historical data viewing window

### Track Map
- View real-time car positions on accurate circuit layouts
- Click on drivers for detailed telemetry
- Monitor sector performance and lap progression

### Timing Tower
- Live gap analysis between drivers
- Sector time comparisons
- Position change tracking

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with automatic builds and updates

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component structure
- Ensure responsive design compatibility
- Test with real F1 session data when available

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [OpenF1](https://openf1.org/) for providing free F1 data API
- [FastF1](https://github.com/theOehrly/FastF1) for F1 data analysis inspiration
- Formula 1 community for continuous feedback and support

## 📞 Support

If you have any questions or run into issues, please [open an issue](https://github.com/kaeldrin-gh/f1-dashboard/issues) on GitHub.

---

**Built with ❤️ for the Formula 1 community**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
