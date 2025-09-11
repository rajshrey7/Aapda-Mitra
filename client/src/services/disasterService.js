import apiClient from '../config/api';

class DisasterService {
  // Get user's current location
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Get weather alerts for a specific location
  async getWeatherAlerts(lat, lng) {
    try {
      const response = await apiClient.get('/api/alerts/weather', {
        params: { lat, lng }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw error;
    }
  }

  // Get disaster alerts from your backend
  async getDisasterAlerts(lat, lng) {
    try {
      const response = await apiClient.get('/api/alerts', {
        params: { lat, lng }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching disaster alerts:', error);
      throw error;
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Process and categorize alerts
  processAlerts(alerts, userLocation) {
    if (!alerts || !Array.isArray(alerts)) return [];

    return alerts.map(alert => {
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        alert.lat || alert.position?.lat,
        alert.lng || alert.position?.lng
      );

      return {
        ...alert,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        severity: this.determineSeverity(alert),
        type: this.categorizeAlert(alert)
      };
    }).sort((a, b) => a.distance - b.distance); // Sort by distance
  }

  // Determine alert severity based on alert data
  determineSeverity(alert) {
    if (alert.severity) return alert.severity.toLowerCase();
    
    // Determine based on alert type or intensity
    if (alert.type === 'earthquake' && alert.magnitude > 5) return 'high';
    if (alert.type === 'flood' && alert.waterLevel > 2) return 'high';
    if (alert.type === 'fire' && alert.intensity > 7) return 'high';
    
    return 'medium';
  }

  // Categorize alert type
  categorizeAlert(alert) {
    if (alert.type) return alert.type.toLowerCase();
    
    // Categorize based on alert description or keywords
    const description = (alert.description || '').toLowerCase();
    
    if (description.includes('earthquake') || description.includes('seismic')) return 'earthquake';
    if (description.includes('flood') || description.includes('water')) return 'flood';
    if (description.includes('fire') || description.includes('blaze')) return 'fire';
    if (description.includes('storm') || description.includes('cyclone')) return 'storm';
    if (description.includes('landslide') || description.includes('mudslide')) return 'landslide';
    
    return 'other';
  }

  // Get escape route suggestions
  getEscapeRouteSuggestions(calamityType, userLocation) {
    const suggestions = {
      earthquake: {
        immediate: 'Drop, Cover, and Hold On. Stay indoors if safe.',
        evacuation: 'Move to open areas away from buildings, trees, and power lines.',
        direction: 'Away from the epicenter'
      },
      flood: {
        immediate: 'Move to higher ground immediately.',
        evacuation: 'Follow designated evacuation routes. Do not drive through flooded areas.',
        direction: 'Uphill and away from water bodies'
      },
      fire: {
        immediate: 'Evacuate immediately. Close doors behind you.',
        evacuation: 'Follow smoke-free routes. Cover your nose and mouth.',
        direction: 'Upwind and away from the fire'
      },
      storm: {
        immediate: 'Seek shelter in a sturdy building.',
        evacuation: 'Stay away from windows and doors. Go to the lowest floor.',
        direction: 'Away from the storm path'
      },
      landslide: {
        immediate: 'Move to higher ground immediately.',
        evacuation: 'Stay away from steep slopes and drainage areas.',
        direction: 'Away from slopes and valleys'
      }
    };

    return suggestions[calamityType] || suggestions.earthquake;
  }

  // Generate mock data for testing (remove in production)
  generateMockCalamities(userLocation) {
    const calamityTypes = ['earthquake', 'flood', 'fire', 'storm', 'landslide'];
    const severities = ['low', 'medium', 'high'];
    
    return calamityTypes.map((type, index) => ({
      id: index + 1,
      type,
      position: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.1,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.1
      },
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: this.getMockDescription(type),
      distance: Math.random() * 5 + 0.5
    }));
  }

  getMockDescription(type) {
    const descriptions = {
      earthquake: 'Seismic activity detected in the area',
      flood: 'Heavy rainfall causing flooding in nearby areas',
      fire: 'Wildfire reported in the vicinity',
      storm: 'Severe weather conditions approaching',
      landslide: 'Land instability detected on nearby slopes'
    };
    return descriptions[type] || 'Emergency situation reported';
  }
}

export default new DisasterService();
