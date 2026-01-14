# 🏠 AI-Driven Property Insights Dashboard

A modern React-based dashboard for visualizing property management analytics, rent trends, and portfolio performance in real-time.

[![Live Demo](https://img.shields.io/badge/Live-Dashboard-blue)](https://property-insights-frontend.vercel.app/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff)](https://vitejs.dev/)
[![Recharts](https://img.shields.io/badge/Recharts-2.10-8884d8)](https://recharts.org/)

## 🚀 Live Demo

**Dashboard URL**: [https://property-insights-frontend.vercel.app/](https://property-insights-frontend.vercel.app/)

**Video Demo**: [Watch on Google Drive](https://drive.google.com/file/d/1vPLVWrSekaKa1_nqbaqLcfnJggGnLnlm/view?usp=drive_link)

## ✨ Features

- **Real-Time Analytics** - Live data from Spring Boot backend API
- **Interactive Charts** - Rent trends, portfolio distribution, and performance metrics
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Performance Scoring** - Visual indicators for property performance
- **Property Management** - View all properties with detailed metrics
- **Auto-Refresh** - Manual refresh button to fetch latest data
- **Modern UI/UX** - Clean, professional interface with gradient backgrounds

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Charts**: Recharts 2.10
- **Icons**: Lucide React
- **Styling**: Inline CSS (no external dependencies)
- **Deployment**: Vercel

## 📊 Dashboard Sections

### 1. **Key Metrics Cards**
- Total Monthly Revenue
- Total Properties
- Average Occupancy Rate
- Average Performance Score

### 2. **Rent Trends Chart**
- 6-month historical rent trends
- Line chart visualization
- Average rent tracking

### 3. **Portfolio Distribution**
- Pie chart of property types
- Breakdown by Apartment/House/Studio

### 4. **Property Details Table**
- Complete property listing
- Address, type, rent, occupancy
- Performance scores with color coding
- Occupancy status indicators

## 📦 Installation & Setup

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/HaswanthVIT/property-insights-frontend.git
cd property-insights-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

## 🔗 Backend Integration

The dashboard connects to the Spring Boot backend API:
```javascript
const API_URL = 'https://property-insights-backend.onrender.com/api';
```

**API Endpoints Used:**
- `GET /api/properties` - Fetch all properties
- `GET /api/properties/analytics` - Fetch analytics data

## 📱 Features Overview

### Interactive Elements
- **Refresh Button** - Manually fetch latest data from backend
- **Color-Coded Scores** - Green (85+), Yellow (75-84), Red (<75)
- **Status Indicators** - Occupied (green dot) or Available (warning icon)
- **Responsive Tables** - Horizontal scroll on mobile devices

### Data Visualization
- **Line Charts** - Rent trends over 6 months
- **Pie Charts** - Property type distribution
- **Stat Cards** - Key metrics with trend indicators

## 🌐 Deployment

Deployed on **Vercel** with:
- Automatic deployments from GitHub
- Global CDN for fast loading
- HTTPS enabled by default
- Environment variable support

### Build Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 🎨 UI Components

### Stat Card Component
Displays key metrics with icons and trend indicators

### Chart Components
- Line Chart (Rent Trends)
- Pie Chart (Portfolio Distribution)

### Table Component
Property details with sortable columns

## 📈 Sample Data Flow

1. **App loads** → Fetch data from backend
2. **Display loading state** → Show spinner
3. **Process data** → Calculate property type distribution
4. **Render dashboard** → Display charts and tables
5. **User clicks refresh** → Re-fetch data

## 🔧 Key Files

- `src/App.jsx` - Main dashboard component
- `src/index.css` - Global styles
- `vite.config.js` - Vite configuration

## 🚨 Important Notes

- **First Load**: Backend may take 30-50 seconds to wake up (Render free tier)
- **Auto-refresh**: Click refresh button if data seems stale
- **CORS**: Backend is configured to allow requests from Vercel domain

## 📝 License

MIT License - Feel free to use this project for learning and portfolio purposes.

## 👤 Author

**Haswanth**
- GitHub: [@HaswanthVIT](https://github.com/HaswanthVIT)
- Backend: [property-insights-backend](https://github.com/HaswanthVIT/property-insights-backend)

## 🙏 Acknowledgments

Built as a personal project to demonstrate full-stack development skills with React and modern deployment practices.

---

**Connected to Live Backend** ✅  
Backend API: [property-insights-backend.onrender.com](https://property-insights-backend.onrender.com)
