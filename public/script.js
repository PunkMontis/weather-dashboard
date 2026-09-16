// ============================================================
// WEATHER DASHBOARD - FRONTEND SCRIPT
// ============================================================

// Configuration
const API_BASE = 'http://localhost:3000/api';
const STORAGE_KEY = 'weatherDashboard_recentSearches';
const MAX_RECENT = 5;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const errorMsg = document.getElementById('errorMsg');
const loadingSpinner = document.getElementById('loadingSpinner');
const weatherContainer = document.getElementById('weatherContainer');
const forecastContainer = document.getElementById('forecastContainer');
const recentList = document.getElementById('recentList');

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 5000);
}

function showLoading(show = true) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

function addToRecentSearches(city) {
    let recent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    recent = recent.filter(item => item.toLowerCase() !== city.toLowerCase());
    recent.unshift(city);
    recent = recent.slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    displayRecentSearches();
}

function displayRecentSearches() {
    const recent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    if (recent.length === 0) {
        recentList.innerHTML = '<div class="empty-state">No recent searches yet</div>';
        return;
    }

    recentList.innerHTML = recent
        .map(city => `<div class="recent-item" onclick="searchWeather('${city}')">${city}</div>`)
        .join('');
}

// ============================================================
// API CALLS
// ============================================================

async function fetchWeatherData(city) {
    try {
        showLoading(true);
        errorMsg.style.display = 'none';

        const response = await fetch(`${API_BASE}/weather/${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        displayWeatherData(data);
        addToRecentSearches(city);
        
        // Fetch forecast
        fetchForecastData(city);
        
        // Fetch air quality
        fetchAirQuality(data.coord.lat, data.coord.lon);
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
    } finally {
        showLoading(false);
    }
}

async function fetchForecastData(city) {
    try {
        const response = await fetch(`${API_BASE}/forecast/${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch forecast');
        }

        const data = await response.json();
        displayForecastData(data.forecast);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

async function fetchAirQuality(lat, lon) {
    try {
        const response = await fetch(`${API_BASE}/air-quality/${lat}/${lon}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch air quality');
        }

        const data = await response.json();
        document.getElementById('aqi').textContent = data.aqiLabel;
    } catch (error) {
        console.error('Air quality error:', error);
        document.getElementById('aqi').textContent = 'N/A';
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading(true);
        errorMsg.style.display = 'none';

        const response = await fetch(`${API_BASE}/weather/coord/${lat}/${lon}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather for your location');
        }

        const data = await response.json();
        displayWeatherData(data);
        
        // Fetch forecast
        const forecastResponse = await fetch(`${API_BASE}/forecast/${encodeURIComponent(data.city)}`);
        if (forecastResponse.ok) {
            const forecastData = await forecastResponse.json();
            displayForecastData(forecastData.forecast);
        }
        
        // Fetch air quality
        await fetchAirQuality(data.coord.lat, data.coord.lon);
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
    } finally {
        showLoading(false);
    }
}

// ============================================================
// DISPLAY FUNCTIONS
// ============================================================

function displayWeatherData(data) {
    document.getElementById('cityName').textContent = data.city;
    document.getElementById('countryCode').textContent = data.country;
    document.getElementById('temperature').textContent = `${Math.round(data.temperature)}°C`;
    document.getElementById('feelsLike').textContent = `${Math.round(data.feelsLike)}°C`;
    document.getElementById('description').textContent = data.description;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.windSpeed} m/s`;
    document.getElementById('pressure').textContent = `${data.pressure} hPa`;
    document.getElementById('clouds').textContent = `${data.clouds}%`;
    document.getElementById('sunrise').textContent = formatTime(data.sunrise);
    document.getElementById('sunset').textContent = formatTime(data.sunset);
    
    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.src = getWeatherIconUrl(data.icon);
    weatherIcon.alt = data.description;
    
    weatherContainer.style.display = 'block';
}

function displayForecastData(forecast) {
    // Group forecast by day
    const forecastByDay = {};
    
    forecast.forEach(item => {
        const date = formatDate(item.datetime);
        if (!forecastByDay[date]) {
            forecastByDay[date] = [];
        }
        forecastByDay[date].push(item);
    });

    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = '';

    // Display one forecast per day (at noon)
    Object.entries(forecastByDay).slice(0, 5).forEach(([date, items]) => {
        const noonForecast = items.find(item => {
            const hour = new Date(item.datetime).getHours();
            return hour >= 12 && hour < 15;
        }) || items[0];

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-time">${date}</div>
            <img src="${getWeatherIconUrl(noonForecast.icon)}" alt="${noonForecast.description}" class="forecast-icon">
            <div class="forecast-temp">${Math.round(noonForecast.temperature)}°C</div>
            <div class="forecast-description">${noonForecast.description}</div>
            <div class="forecast-rain">💧 ${noonForecast.rainProbability}%</div>
        `;
        forecastList.appendChild(forecastItem);
    });

    forecastContainer.style.display = 'block';
}

// ============================================================
// EVENT LISTENERS
// ============================================================

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        searchWeather(city);
        searchInput.value = '';
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
            showLoading(false);
            showError('Unable to get your location: ' + error.message);
        }
    );
});

// ============================================================
// SEARCH FUNCTION
// ============================================================

function searchWeather(city) {
    fetchWeatherData(city);
}

// ============================================================
// INITIALIZATION
// ============================================================

// Display recent searches on page load
displayRecentSearches();

// Load default city on startup
window.addEventListener('load', () => {
    // Optional: Load a default city
    // searchWeather('London');
});

// Handle API URL based on environment
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // For production, adjust API_BASE as needed
    console.log('Running in production mode');
}
