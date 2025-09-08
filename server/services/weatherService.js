// server/services/weatherService.js
// Weather service with OpenWeather integration and NDMA fallback

const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/3.0/onecall';
    this.ndmaFallbackMode = !this.apiKey || process.env.NDMA_FALLBACK_MODE === 'true';
  }

  async getWeatherData(lat, lon) {
    if (this.ndmaFallbackMode) {
      return this.generateFallbackWeather(lat, lon);
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          exclude: 'minutely'
        }
      });

      return response.data;
    } catch (error) {
      console.error('OpenWeather API error:', error);
      return this.generateFallbackWeather(lat, lon);
    }
  }

  async getNearbyAlerts(lat, lon, radius = 50) {
    try {
      const weatherData = await this.getWeatherData(lat, lon);
      const alerts = [];

      // Check for severe weather conditions
      if (weatherData.alerts) {
        for (const alert of weatherData.alerts) {
          alerts.push({
            id: `weather_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: this.mapWeatherEventToAlertType(alert.event),
            severity: this.mapSeverity(alert.tags),
            title: alert.event,
            description: alert.description,
            location: `${lat}, ${lon}`,
            coordinates: { lat, lon },
            source: 'OpenWeather',
            startTime: new Date(alert.start * 1000),
            endTime: new Date(alert.end * 1000),
            isActive: true,
            createdAt: new Date()
          });
        }
      }

      // Check current weather for immediate threats
      const current = weatherData.current;
      if (current) {
        // Heavy rain alert
        if (current.rain && current.rain['1h'] > 10) {
          alerts.push({
            id: `rain_${Date.now()}`,
            type: 'flood',
            severity: 'moderate',
            title: 'Heavy Rainfall Alert',
            description: `Heavy rainfall detected: ${current.rain['1h']}mm in the last hour`,
            location: `${lat}, ${lon}`,
            coordinates: { lat, lon },
            source: 'OpenWeather',
            isActive: true,
            createdAt: new Date()
          });
        }

        // Strong wind alert
        if (current.wind_speed > 15) {
          alerts.push({
            id: `wind_${Date.now()}`,
            type: 'cyclone',
            severity: 'moderate',
            title: 'Strong Wind Alert',
            description: `Strong winds detected: ${current.wind_speed} m/s`,
            location: `${lat}, ${lon}`,
            coordinates: { lat, lon },
            source: 'OpenWeather',
            isActive: true,
            createdAt: new Date()
          });
        }

        // Extreme temperature alert
        if (current.temp > 40 || current.temp < 0) {
          alerts.push({
            id: `temp_${Date.now()}`,
            type: 'heatwave',
            severity: current.temp > 40 ? 'high' : 'moderate',
            title: 'Extreme Temperature Alert',
            description: `Extreme temperature: ${current.temp}°C`,
            location: `${lat}, ${lon}`,
            coordinates: { lat, lon },
            source: 'OpenWeather',
            isActive: true,
            createdAt: new Date()
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Get nearby alerts error:', error);
      return this.generateFallbackAlerts(lat, lon, radius);
    }
  }

  async generateFallbackAlerts(lat, lon, radius = 50) {
    // NDMA fallback alerts for demonstration
    const fallbackAlerts = [
      {
        id: `ndma_earthquake_${Date.now()}`,
        type: 'earthquake',
        severity: 'moderate',
        title: 'Earthquake Preparedness Alert',
        description: 'Regular earthquake preparedness reminder. Ensure emergency kits are ready.',
        location: 'Punjab Region',
        coordinates: { lat: 31.1471, lon: 75.3412 },
        source: 'NDMA_FALLBACK',
        isActive: true,
        createdAt: new Date(),
        instructions: [
          'Drop, Cover, and Hold On',
          'Stay indoors until shaking stops',
          'Check for injuries and damage',
          'Listen to emergency broadcasts'
        ]
      },
      {
        id: `ndma_flood_${Date.now()}`,
        type: 'flood',
        severity: 'low',
        title: 'Flood Preparedness Alert',
        description: 'Monsoon season reminder. Stay prepared for potential flooding.',
        location: 'River Areas, Punjab',
        coordinates: { lat: 30.7333, lon: 76.7794 },
        source: 'NDMA_FALLBACK',
        isActive: true,
        createdAt: new Date(),
        instructions: [
          'Avoid walking through floodwaters',
          'Move to higher ground if needed',
          'Turn off electricity and gas',
          'Listen to weather updates'
        ]
      },
      {
        id: `ndma_fire_${Date.now()}`,
        type: 'fire',
        severity: 'low',
        title: 'Fire Safety Alert',
        description: 'Fire safety reminder. Check smoke detectors and fire extinguishers.',
        location: 'All Schools',
        coordinates: { lat, lon },
        source: 'NDMA_FALLBACK',
        isActive: true,
        createdAt: new Date(),
        instructions: [
          'Test smoke detectors monthly',
          'Keep fire extinguishers accessible',
          'Practice fire evacuation drills',
          'Know emergency exits'
        ]
      }
    ];

    // Filter alerts based on radius (simplified)
    return fallbackAlerts.filter(alert => {
      const distance = this.calculateDistance(lat, lon, alert.coordinates.lat, alert.coordinates.lon);
      return distance <= radius;
    });
  }

  generateFallbackWeather(lat, lon) {
    // Generate mock weather data for demonstration
    return {
      lat,
      lon,
      timezone: 'Asia/Kolkata',
      current: {
        dt: Math.floor(Date.now() / 1000),
        temp: 25 + Math.random() * 15, // 25-40°C
        humidity: 60 + Math.random() * 30, // 60-90%
        wind_speed: 5 + Math.random() * 10, // 5-15 m/s
        weather: [{
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }]
      },
      alerts: []
    };
  }

  mapWeatherEventToAlertType(event) {
    const eventMap = {
      'Tornado': 'cyclone',
      'Hurricane': 'cyclone',
      'Storm': 'cyclone',
      'Flood': 'flood',
      'Flash Flood': 'flood',
      'Heavy Rain': 'flood',
      'Earthquake': 'earthquake',
      'Fire': 'fire',
      'Wildfire': 'fire',
      'Heat Wave': 'heatwave',
      'Cold Wave': 'coldwave',
      'Snow': 'snow',
      'Ice': 'ice'
    };

    return eventMap[event] || 'general';
  }

  mapSeverity(tags) {
    if (tags.includes('Extreme')) return 'critical';
    if (tags.includes('Severe')) return 'high';
    if (tags.includes('Moderate')) return 'moderate';
    return 'low';
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  async getWeatherForecast(lat, lon, days = 5) {
    try {
      const weatherData = await this.getWeatherData(lat, lon);
      
      if (weatherData.daily) {
        return weatherData.daily.slice(0, days).map(day => ({
          date: new Date(day.dt * 1000),
          temp: {
            min: day.temp.min,
            max: day.temp.max
          },
          weather: day.weather[0],
          humidity: day.humidity,
          wind_speed: day.wind_speed,
          pop: day.pop // Probability of precipitation
        }));
      }

      return [];
    } catch (error) {
      console.error('Get weather forecast error:', error);
      return [];
    }
  }

  async getHistoricalWeather(lat, lon, date) {
    // This would require a different API endpoint for historical data
    // For now, return mock data
    return {
      date,
      temp: 25 + Math.random() * 15,
      humidity: 60 + Math.random() * 30,
      wind_speed: 5 + Math.random() * 10,
      weather: {
        main: 'Clear',
        description: 'clear sky'
      }
    };
  }
}

module.exports = WeatherService;
