const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================
const handleError = (error, res, defaultMessage = 'An error occurred') => {
  console.error('Error:', error.message);
  
  if (error.response) {
    // API returned an error
    if (error.response.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    } else if (error.response.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
  }
  
  res.status(500).json({ error: defaultMessage });
};

// ============================================================
// API ROUTES
// ============================================================

// GET - Current weather by city name
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { units = 'metric', lang = 'en' } = req.query;

    if (!city || city.trim() === '') {
      return res.status(400).json({ error: 'City name is required' });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather`;
    const response = await axios.get(url, {
      params: {
        q: city,
        appid: API_KEY,
        units: units,
        lang: lang
      }
    });

    const data = response.data;
    const weatherData = {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      clouds: data.clouds.all,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timezone: data.timezone,
      coord: data.coord
    };

    res.json(weatherData);
  } catch (error) {
    handleError(error, res, 'Failed to fetch weather data');
  }
});

// GET - 5-day forecast by city name
app.get('/api/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { units = 'metric', lang = 'en' } = req.query;

    if (!city || city.trim() === '') {
      return res.status(400).json({ error: 'City name is required' });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast`;
    const response = await axios.get(url, {
      params: {
        q: city,
        appid: API_KEY,
        units: units,
        lang: lang
      }
    });

    const data = response.data;
    const forecastList = data.list.slice(0, 40); // 5 days * 8 (3-hour intervals)
    
    const forecast = forecastList.map(item => ({
      datetime: new Date(item.dt * 1000),
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: item.wind.speed,
      clouds: item.clouds.all,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      rainProbability: (item.pop * 100).toFixed(0)
    }));

    res.json({
      city: data.city.name,
      country: data.city.country,
      forecast: forecast
    });
  } catch (error) {
    handleError(error, res, 'Failed to fetch forecast data');
  }
});

// GET - Weather by coordinates
app.get('/api/weather/coord/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const { units = 'metric', lang = 'en' } = req.query;

    const url = `https://api.openweathermap.org/data/2.5/weather`;
    const response = await axios.get(url, {
      params: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        appid: API_KEY,
        units: units,
        lang: lang
      }
    });

    const data = response.data;
    const weatherData = {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      clouds: data.clouds.all,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timezone: data.timezone,
      coord: data.coord
    };

    res.json(weatherData);
  } catch (error) {
    handleError(error, res, 'Failed to fetch weather data');
  }
});

// GET - Air quality data
app.get('/api/air-quality/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;

    const url = `https://api.openweathermap.org/data/2.5/air_pollution`;
    const response = await axios.get(url, {
      params: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        appid: API_KEY
      }
    });

    const data = response.data.list[0];
    const aqi = data.main.aqi;
    const aqiLabels = {
      1: 'Good',
      2: 'Fair',
      3: 'Moderate',
      4: 'Poor',
      5: 'Very Poor'
    };

    res.json({
      aqi: aqi,
      aqiLabel: aqiLabels[aqi] || 'Unknown',
      components: data.components
    });
  } catch (error) {
    handleError(error, res, 'Failed to fetch air quality data');
  }
});

// GET - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Weather Dashboard API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🌦️  Weather Dashboard Server Running`);
  console.log(`📍 Listening on http://localhost:${PORT}`);
  console.log(`🔑 API Key configured: ${API_KEY ? '✓' : '✗'}`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`   GET  /api/weather/:city`);
  console.log(`   GET  /api/forecast/:city`);
  console.log(`   GET  /api/weather/coord/:lat/:lon`);
  console.log(`   GET  /api/air-quality/:lat/:lon`);
  console.log(`   GET  /api/health\n`);
});
