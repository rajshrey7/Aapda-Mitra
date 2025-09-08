// server/services/weatherService.js
// Weather service with OpenWeather integration (free API) and NDMA fallback

const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5'; // ✅ switched to free tier
    this.ndmaFallbackMode = !this.apiKey || process.env.NDMA_FALLBACK_MODE === 'true';
  }

  async getWeatherData(lat, lon) {
    if (this.ndmaFallbackMode) {
      return this.generateFallbackWeather(lat, lon);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return response.data;
    } catch (error) {
      console.error('OpenWeather API error:', error.message);
      return this.generateFallbackWeather(lat, lon);
    }
  }

  async getNearbyAlerts(lat, lon, radius = 50) {
    try {
      const weatherData = await this.getWeatherData(lat, lon);
      const alerts = [];
  
      if (!weatherData || !weatherData.weather) {
        return this.generateFallbackAlerts(lat, lon, radius);
      }
  
      const condition = weatherData.weather[0]?.main?.toLowerCase() || '';
      const description = weatherData.weather[0]?.description || '';
      const temp = weatherData.main?.temp || 0;
      const wind = weatherData.wind?.speed || 0;
      const rain = weatherData.rain?.['1h'] || 0;
  
      // 🌧️ Heavy Rain / Flood
      if (rain > 10 || condition.includes('rain')) {
        alerts.push({
          id: `rain_${Date.now()}`,
          type: 'flood',
          severity: rain > 20 ? 'high' : 'moderate',
          title: 'Heavy Rainfall Alert',
          description: `Detected ${rain}mm rain. Condition: ${description}`,
          location: `${lat}, ${lon}`,
          coordinates: { lat, lon },
          source: 'Derived (OpenWeather)',
          isActive: true,
          createdAt: new Date()
        });
      }
  
      // 🌬️ Strong Wind / Cyclone
      if (wind > 15 || condition.includes('storm')) {
        alerts.push({
          id: `wind_${Date.now()}`,
          type: 'cyclone',
          severity: wind > 25 ? 'high' : 'moderate',
          title: 'Strong Wind Alert',
          description: `Winds at ${wind} m/s detected.`,
          location: `${lat}, ${lon}`,
          coordinates: { lat, lon },
          source: 'Derived (OpenWeather)',
          isActive: true,
          createdAt: new Date()
        });
      }
  
      // ☀️ Heatwave
      if (temp > 40) {
        alerts.push({
          id: `heat_${Date.now()}`,
          type: 'heatwave',
          severity: 'high',
          title: 'Heatwave Alert',
          description: `Temperature at ${temp}°C. Stay hydrated.`,
          location: `${lat}, ${lon}`,
          coordinates: { lat, lon },
          source: 'Derived (OpenWeather)',
          isActive: true,
          createdAt: new Date()
        });
      }
  
      // ❄️ Coldwave
      if (temp < 5) {
        alerts.push({
          id: `cold_${Date.now()}`,
          type: 'coldwave',
          severity: 'moderate',
          title: 'Coldwave Alert',
          description: `Temperature at ${temp}°C. Keep warm.`,
          location: `${lat}, ${lon}`,
          coordinates: { lat, lon },
          source: 'Derived (OpenWeather)',
          isActive: true,
          createdAt: new Date()
        });
      }
  
      // If nothing triggered → fallback
      return alerts.length > 0 ? alerts : this.generateFallbackAlerts(lat, lon, radius);
  
    } catch (error) {
      console.error('Get nearby alerts error:', error.message);
      return this.generateFallbackAlerts(lat, lon, radius);
    }
    
  }
  

  async getWeatherForecast(lat, lon, days = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8 // 8 data points = 24 hrs
        }
      });

      return response.data.list.map(entry => ({
        date: new Date(entry.dt * 1000),
        temp: entry.main.temp,
        weather: entry.weather[0],
        humidity: entry.main.humidity,
        wind_speed: entry.wind.speed
      }));
    } catch (error) {
      console.error('Get weather forecast error:', error.message);
      return [];
    }
  }

  // --- Keep your existing fallback + utilities unchanged ---
  generateFallbackWeather(lat, lon) { /* ... */ }
  generateFallbackAlerts(lat, lon, radius) { /* ... */ }
  mapWeatherEventToAlertType(event) { /* ... */ }
  mapSeverity(tags) { /* ... */ }
  calculateDistance(lat1, lon1, lat2, lon2) { /* ... */ }
  deg2rad(deg) { /* ... */ }
  async getHistoricalWeather(lat, lon, date) { /* ... */ }
}

module.exports = WeatherService;
