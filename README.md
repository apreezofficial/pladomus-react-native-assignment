# Weather App - React Native

A 3-screen weather application built with React Native featuring saved cities, weather details, and live location support.

## Features

- **Saved Cities Screen** - List of saved cities with live temperatures
- **Add City Screen** - Add cities by name or use current location
- **Weather Detail Screen** - Current weather with temperature, feels-like, humidity, and wind
- **Temperature Units** - Toggle between Fahrenheit and Celsius
- **Persistent Storage** - Cities and preferences saved via AsyncStorage
- **Pull-to-Refresh** - Update weather data
- **Sort by Temperature** - Organize cities by current temperature
- **Location Services** - GPS location support with permissions

## Tech Stack

- **React Native** (bare workflow)
- **React Navigation** v7 (Stack Navigator)
- **AsyncStorage** for persistence
- **Open-Meteo API** for weather data (no API key required)
- **React Native Geolocation Service** for location
- **TypeScript** with ESLint

## Architecture

```
src/
├── types/          # TypeScript interfaces
├── services/       # Weather API and storage services  
├── hooks/          # Custom React hooks
├── screens/        # Screen components
└── components/     # Reusable components
```

## API Integration

- **Weather Data**: Open-Meteo API (`https://api.open-meteo.com/v1/forecast`)
- **Geocoding**: Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`)

## Getting Started

### Prerequisites

- Node.js 18+
- React Native development environment
- Android Studio (for Android builds)
- Xcode (for iOS builds)

### Installation

```bash
# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Building APK

The project includes GitHub Actions workflow for automated APK builds:

1. Push code to GitHub
2. Go to **Actions** tab in your repository
3. Run **Build Android APK** workflow
4. Download the APK from **Artifacts**

## Demo

A web demo is available at `web-demo.html` - open in any browser to see the app functionality.

## Permissions

### Android
- `ACCESS_FINE_LOCATION` - For GPS weather
- `ACCESS_COARSE_LOCATION` - Location fallback
- `INTERNET` - Weather API access

### iOS
- `NSLocationWhenInUseUsageDescription` - Location access

## License

MIT License