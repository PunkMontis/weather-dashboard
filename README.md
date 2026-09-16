# 🌍 Weather Dashboard

A modern, responsive weather dashboard application that fetches real-time weather data from the OpenWeatherMap API. Features include current weather, 5-day forecasts, air quality metrics, and geolocation support.

![Weather Dashboard](https://img.shields.io/badge/Weather-Dashboard-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## ✨ Features

- 🌤️ **Real-time Weather Data** - Current weather conditions with detailed metrics
- 📍 **Geolocation Support** - Get weather for your current location
- 📅 **5-Day Forecast** - Extended forecast with hourly data
- 🌬️ **Air Quality Index** - AQI and pollution component data
- 💾 **Recent Searches** - Quick access to previously searched cities
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- ⚡ **Fast API** - Built with Express.js for optimal performance
- 🔒 **Error Handling** - Comprehensive error messages and validation

## 📋 Prerequisites

- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn**
- **OpenWeatherMap API Key** (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/PunkMontis/weather-dashboard.git
cd weather-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API Keys section
4. Copy your API key

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
OPENWEATHER_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 6. Access the Dashboard

Open your browser and navigate to:

```
http://localhost:3000
```

## 📚 API Endpoints

### Get Current Weather by City

```http
GET /api/weather/:city?units=metric&lang=en
```

**Parameters:**
- `city` (required): City name
- `units` (optional): `metric`, `imperial`, or `standard` (default: `metric`)
- `lang` (optional): Language code (default: `en`)

**Response:**
```json
{
  "city": "London",
  "country": "GB",
  "temperature": 15.5,
  "feelsLike": 14.2,
  "humidity": 72,
  "pressure": 1013,
  "windSpeed": 4.5,
  "clouds": 60,
  "description": "Partly cloudy",
  "icon": "02d",
  "sunrise": "2024-01-15T07:30:00.000Z",
  "sunset": "2024-01-15T16:45:00.000Z",
  "timezone": 0,
  "coord": {
    "lat": 51.5085,
    "lon": -0.1257
  }
}
```

### Get 5-Day Forecast

```http
GET /api/forecast/:city?units=metric&lang=en
```

**Response:**
```json
{
  "city": "London",
  "country": "GB",
  "forecast": [
    {
      "datetime": "2024-01-15T12:00:00.000Z",
      "temperature": 16.2,
      "feelsLike": 15.1,
      "humidity": 70,
      "windSpeed": 5.1,
      "description": "Sunny",
      "icon": "01d",
      "rainProbability": 10
    }
    // ... more forecast items
  ]
}
```

### Get Weather by Coordinates

```http
GET /api/weather/coord/:lat/:lon?units=metric&lang=en
```

**Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude

### Get Air Quality Index

```http
GET /api/air-quality/:lat/:lon
```

**Response:**
```json
{
  "aqi": 2,
  "aqiLabel": "Fair",
  "components": {
    "co": 250.5,
    "no2": 12.3,
    "o3": 50.2,
    "pm2_5": 8.1,
    "pm10": 15.5
  }
}
```

### Health Check

```http
GET /api/health
```

## 🏗️ Project Structure

```
weather-dashboard/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Styling
│   └── script.js           # Frontend JavaScript
├── server.js               # Express server & API routes
├── package.json            # Dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── README.md               # This file
└── DEPLOYMENT.md           # Deployment guide
```

## 🎨 Features in Detail

### Current Weather Display
- Large temperature display
- Weather icon and description
- "Feels like" temperature
- Humidity percentage
- Wind speed
- Atmospheric pressure
- Cloud coverage
- Sunrise and sunset times

### 5-Day Forecast
- Daily weather predictions
- Temperature trends
- Weather conditions
- Rain probability
- Weather icons

### Air Quality Index
- Real-time AQI data
- Quality labels (Good, Fair, Moderate, Poor, Very Poor)
- Pollution components (CO, NO2, O3, PM2.5, PM10)

### User Experience
- Search by city name
- Geolocation button for current location
- Recent searches history (stored in localStorage)
- Loading spinner during data fetch
- Error messages for invalid cities or API issues
- Responsive design for all devices

## 🛠️ Development

### Hot Reload Development

The project includes `nodemon` for automatic server restart during development:

```bash
npm run dev
```

### Testing the API

Use curl or Postman to test endpoints:

```bash
# Get weather for London
curl http://localhost:3000/api/weather/London

# Get forecast for New York
curl http://localhost:3000/api/forecast/"New%20York"

# Get weather by coordinates
curl http://localhost:3000/api/weather/coord/51.5085/-0.1257

# Health check
curl http://localhost:3000/api/health
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Heroku
- Vercel
- AWS
- DigitalOcean
- Docker

## 🔐 Security Considerations

- API keys should never be committed to version control
- Always use environment variables for sensitive data
- Implement rate limiting for production
- Use HTTPS in production
- Validate and sanitize all user inputs

## 🐛 Troubleshooting

### "Invalid API key" Error
- Ensure your API key is correctly copied from OpenWeatherMap
- Check that the API key is in the `.env` file
- Verify the API key hasn't expired or been revoked

### "City not found" Error
- Check the spelling of the city name
- Try using the city name with country code (e.g., "London, GB")

### CORS Issues
- CORS is enabled by default for development
- Adjust CORS settings in `server.js` if needed

### Geolocation Not Working
- Geolocation requires HTTPS in production
- Check browser permissions for location access
- Some browsers require explicit user permission

## 📊 Performance Optimization

- API responses are cached in the browser's localStorage
- Recent searches are stored locally to reduce API calls
- Images are optimized with lazy loading
- CSS is minified for production

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather API
- [Express.js](https://expressjs.com/) for the web framework
- [Axios](https://axios-http.com/) for HTTP client

## 📞 Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Open an [Issue](https://github.com/PunkMontis/weather-dashboard/issues)
3. Submit a [Discussion](https://github.com/PunkMontis/weather-dashboard/discussions)

## 🌟 Roadmap

- [ ] Dark mode toggle
- [ ] Multiple city comparison
- [ ] Weather alerts and notifications
- [ ] Historical weather data
- [ ] Custom themes
- [ ] Mobile app version (React Native)
- [ ] Weather maps integration
- [ ] UV index display
- [ ] Pollen count data
- [ ] Weather changelog

---

**Made with ❤️ by PunkMontis**
