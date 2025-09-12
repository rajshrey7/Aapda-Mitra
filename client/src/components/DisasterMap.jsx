import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, MapPin, Navigation, Shield, Zap, Wind, Droplets, Flame, RefreshCw, Clock, Route, Info, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import disasterService from '../services/disasterService';

const DisasterMap = () => {
  const { isDark, isLoading: themeLoading } = useTheme();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestCalamity, setNearestCalamity] = useState(null);
  const [escapeRoute, setEscapeRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    calamity: true,
    route: true,
    tips: false
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const markersRef = useRef([]);

  // Use Vite environment variable or fallback to demo key
  const API_KEY = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCKTTfJD5_TERQvfVR-XimF7c2GJnBekC8';
  
  // Debug logging
  console.log('DisasterMap: API Key loaded:', API_KEY ? 'Yes' : 'No');
  console.log('DisasterMap: Environment variables:', import.meta.env);

  // Sample calamity data - In real app, this would come from your API
  const calamityTypes = {
    earthquake: { icon: '🌍', color: '#ff6b6b', name: 'Earthquake' },
    flood: { icon: '🌊', color: '#4ecdc4', name: 'Flood' },
    fire: { icon: '🔥', color: '#ff8c42', name: 'Fire' },
    storm: { icon: '⛈️', color: '#6c5ce7', name: 'Storm' },
    landslide: { icon: '🏔️', color: '#a29bfe', name: 'Landslide' }
  };

  useEffect(() => {
    console.log('DisasterMap: Starting map initialization...');
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('DisasterMap: Google Maps already loaded');
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      console.log('DisasterMap: Script already exists, waiting for load...');
      existingScript.onload = () => {
        console.log('DisasterMap: Existing script loaded');
        // Wait a bit more to ensure Google Maps is fully initialized
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            console.log('DisasterMap: Google Maps API is ready (existing script)');
            setIsLoaded(true);
          } else {
            console.error('DisasterMap: Google Maps API not ready after existing script load');
            setError('Google Maps API failed to initialize properly');
          }
        }, 100);
      };
      existingScript.onerror = () => {
        console.error('DisasterMap: Existing script failed to load');
        setError('Failed to load Google Maps API');
      };
      return;
    }

    console.log('DisasterMap: Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('DisasterMap: Script loaded successfully');
      // Wait a bit more to ensure Google Maps is fully initialized
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log('DisasterMap: Google Maps API is ready');
          setIsLoaded(true);
        } else {
          console.error('DisasterMap: Google Maps API not ready after script load');
          setError('Google Maps API failed to initialize properly');
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      console.error('DisasterMap: Script loading error:', error);
      setError('Failed to load Google Maps API. Please check your API key and internet connection.');
    };

    document.head.appendChild(script);

    return () => {
      console.log('DisasterMap: Cleanup');
      const scriptToRemove = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (scriptToRemove && scriptToRemove === script) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      // Double-check that Google Maps is actually ready
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        console.log('DisasterMap: Google Maps not ready yet, retrying in 500ms...');
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            console.log('DisasterMap: Google Maps is now ready, retrying map initialization');
            // Trigger re-render by updating a state or calling the effect again
            setIsLoaded(true);
          }
        }, 500);
        return;
      }
      
      console.log('DisasterMap: Initializing map...');
      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeId: 'roadmap',
          styles: isDark ? [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }]
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }]
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }]
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }]
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }]
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }]
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }]
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }]
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }]
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }]
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }]
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }]
            }
          ] : []
        });

        console.log('DisasterMap: Map initialized successfully');
        setMap(mapInstance);
        setDirectionsService(new window.google.maps.DirectionsService());
        setDirectionsRenderer(new window.google.maps.DirectionsRenderer({
          draggable: false,
          suppressMarkers: true
        }));
      } catch (error) {
        console.error('DisasterMap: Map initialization error:', error);
        setError('Failed to initialize map: ' + error.message);
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    if (map && directionsRenderer) {
      directionsRenderer.setMap(map);
    }
  }, [map, directionsRenderer]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => {
        if (marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await disasterService.getCurrentLocation();
      
      setUserLocation(location);
      map.setCenter(location);
      map.setZoom(15);
      
      // Add user location marker
      addUserMarker(location);
      
      // Find nearest calamity
      await findNearestCalamity(location);
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Unable to retrieve your location. Please enable location services.');
      setLoading(false);
    }
  };

  const addUserMarker = (location) => {
    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <!-- Pulsing ring -->
            <circle cx="20" cy="20" r="18" fill="none" stroke="#3b82f6" stroke-width="2" opacity="0.6">
              <animate attributeName="r" values="18;24;18" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/>
            </circle>
            <!-- Main marker -->
            <circle cx="20" cy="20" r="14" fill="#3b82f6" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20" r="8" fill="white"/>
            <!-- Center dot -->
            <circle cx="20" cy="20" r="3" fill="#3b82f6"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      },
      animation: window.google.maps.Animation.BOUNCE
    });
    markersRef.current.push(marker);
  };

  const findNearestCalamity = async (userLocation) => {
    try {
      setLoading(true);
      console.log('Finding real calamities for location:', userLocation);
      
      let calamities = [];
      
      try {
        // Get real weather alerts from your API (using location string)
        const locationString = `${userLocation.lat},${userLocation.lng}`;
        const weatherResponse = await fetch(`/api/alerts/weather?location=${locationString}`);
        const weatherData = await weatherResponse.json();
        
        // Get active alerts from your API
        const alertsResponse = await fetch('/api/alerts/active');
        const alertsData = await alertsResponse.json();
        
        console.log('Weather alerts:', weatherData);
        console.log('Active alerts:', alertsData);
        
        // Process weather alerts
        if (weatherData.status === 'success' && weatherData.data.isAlert && weatherData.data.alerts) {
          const weatherAlerts = weatherData.data.alerts.map((alert, index) => ({
            id: `weather_${index}`,
            type: 'storm', // Weather alerts are typically storms
            position: { lat: userLocation.lat, lng: userLocation.lng },
            severity: 'medium',
            description: alert.description || alert.msg || 'Weather alert in your area',
            distance: 0.1 // Very close since it's for your location
          }));
          calamities.push(...weatherAlerts);
        }
        
        // Process active alerts
        if (alertsData.status === 'success' && alertsData.data) {
          const activeAlerts = alertsData.data.map(alert => ({
            id: alert.id,
            type: alert.type,
            position: { 
              lat: alert.coordinates?.lat || userLocation.lat + (Math.random() - 0.5) * 0.1, 
              lng: alert.coordinates?.lon || userLocation.lng + (Math.random() - 0.5) * 0.1 
            },
            severity: alert.severity || 'medium',
            description: alert.description || alert.title,
            distance: disasterService.calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              alert.coordinates?.lat || userLocation.lat, 
              alert.coordinates?.lon || userLocation.lng
            )
          }));
          calamities.push(...activeAlerts);
        }
        
        console.log('Processed calamities:', calamities);
        
      } catch (apiError) {
        console.error('API error:', apiError);
        if (retryCount < 3) {
          console.log(`Retrying... attempt ${retryCount + 1}`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            findNearestCalamity(userLocation);
          }, 2000);
          return;
        } else {
          setError(`Failed to fetch live data after ${retryCount} attempts: ${apiError.message}`);
          setLoading(false);
          return;
        }
      }

      if (calamities.length === 0) {
        console.log('No calamities found, showing no alerts message');
        setNearestCalamity(null);
        setLoading(false);
        return;
      }

      // Find nearest calamity
      const nearest = calamities.reduce((closest, current) => 
        current.distance < closest.distance ? current : closest
      );

      console.log('Nearest calamity:', nearest);
      setNearestCalamity(nearest);
      addCalamityMarkers(calamities);
      
      // Calculate escape route
      if (nearest) {
        calculateEscapeRoute(userLocation, nearest);
      }
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error finding calamities:', error);
      setLoading(false);
    }
  };

  const addCalamityMarkers = (calamities) => {
    calamities.forEach((calamity, index) => {
      const calamityInfo = calamityTypes[calamity.type];
      
      // Create animated marker with pulsing effect
      const marker = new window.google.maps.Marker({
        position: calamity.position,
        map: map,
        title: `${calamityInfo.name} - ${calamity.severity} severity`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <!-- Pulsing ring -->
              <circle cx="25" cy="25" r="22" fill="none" stroke="${calamityInfo.color}" stroke-width="2" opacity="0.6">
                <animate attributeName="r" values="22;28;22" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
              </circle>
              <!-- Main marker -->
              <circle cx="25" cy="25" r="18" fill="${calamityInfo.color}" stroke="white" stroke-width="3"/>
              <text x="25" y="31" text-anchor="middle" font-size="18" fill="white" font-weight="bold">${calamityInfo.icon}</text>
              <!-- Severity indicator -->
              <circle cx="35" cy="15" r="8" fill="white" stroke="${calamityInfo.color}" stroke-width="2"/>
              <text x="35" y="19" text-anchor="middle" font-size="10" fill="${calamityInfo.color}" font-weight="bold">${calamity.severity.charAt(0).toUpperCase()}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(50, 50),
          anchor: new window.google.maps.Point(25, 25)
        },
        animation: window.google.maps.Animation.DROP
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: ${calamityInfo.color};">
              ${calamityInfo.icon} ${calamityInfo.name}
            </h3>
            <p style="margin: 0 0 4px 0; font-weight: bold;">
              Severity: ${calamity.severity.toUpperCase()}
            </p>
            <p style="margin: 0 0 4px 0;">
              Distance: ${calamity.distance} km
            </p>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${calamity.description}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const calculateEscapeRoute = (start, calamity) => {
    if (!directionsService || !directionsRenderer) return;

    // Calculate a safe escape direction (opposite to calamity)
    const bearing = window.google.maps.geometry.spherical.computeHeading(
      new window.google.maps.LatLng(start.lat, start.lng),
      new window.google.maps.LatLng(calamity.position.lat, calamity.position.lng)
    );

    // Calculate escape point (2km away in opposite direction)
    const escapePoint = window.google.maps.geometry.spherical.computeOffset(
      new window.google.maps.LatLng(start.lat, start.lng),
      2000, // 2km
      bearing + 180 // Opposite direction
    );

    const request = {
      origin: new window.google.maps.LatLng(start.lat, start.lng),
      destination: escapePoint,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        setEscapeRoute({
          distance: result.routes[0].legs[0].distance.text,
          duration: result.routes[0].legs[0].duration.text,
          steps: result.routes[0].legs[0].steps
        });
      }
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Zap className="w-4 h-4" />;
      case 'low': return <Shield className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getCalamityIcon = (type) => {
    const icons = {
      earthquake: '🌍',
      flood: '🌊',
      fire: '🔥',
      storm: '⛈️',
      landslide: '🏔️'
    };
    return icons[type] || '⚠️';
  };

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Map</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                setError(null);
                setRetryCount(0);
                if (userLocation) {
                  findNearestCalamity(userLocation);
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Data Fetch
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isLoaded) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Disaster Map</h2>
          <p className="text-gray-600">Initializing Google Maps...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300"
    >
      <div className="w-full max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                Disaster Preparedness Map
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Real-time calamity detection with safest escape routes
              </p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 lg:mt-0 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
            >
              {lastUpdated && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live Data</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Map Section */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-3 order-2 xl:order-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Interactive Map</span>
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={getCurrentLocation}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Navigation className="w-5 h-5" />
                      )}
                      <span className="font-medium">
                        {loading ? 'Locating...' : 'Get My Location'}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setRetryCount(0);
                        setError(null);
                        getCurrentLocation();
                      }}
                      disabled={loading}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div 
                  ref={mapRef} 
                  data-testid="map-container"
                  className="w-full h-96 lg:h-[500px]"
                  style={{ 
                    minHeight: '400px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #e0e0e0'
                  }}
                />
                {loading && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center z-10">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300 font-medium">Analyzing location...</p>
                    </motion.div>
                  </div>
                )}
                {!isLoaded && (
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300">Loading Google Maps...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Information Panel */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 order-1 xl:order-2"
          >
            {/* User Location */}
            <AnimatePresence>
              {userLocation && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5 shadow-lg transition-colors duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800/50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span>Your Location</span>
                    </h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 transition-colors duration-300">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                        Lat: {userLocation.lat.toFixed(6)}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                        Lng: {userLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nearest Calamity */}
            <AnimatePresence>
              {nearestCalamity ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-2xl p-5 shadow-lg transition-colors duration-300"
                >
                  <div 
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection('calamity')}
                  >
                    <h3 className="font-bold text-red-800 dark:text-red-300 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-200 dark:bg-red-800/50 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span>Nearest Calamity</span>
                    </h3>
                    {expandedSections.calamity ? (
                      <ChevronDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedSections.calamity && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{getCalamityIcon(nearestCalamity.type)}</span>
                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{calamityTypes[nearestCalamity.type].name}</h4>
                            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(nearestCalamity.severity)}`}>
                              {getSeverityIcon(nearestCalamity.severity)}
                              <span>{nearestCalamity.severity.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2 transition-colors duration-300">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Distance:</span>
                            <span className="font-bold text-red-600 dark:text-red-400">{nearestCalamity.distance} km</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded p-2">
                            {nearestCalamity.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-2xl p-5 shadow-lg transition-colors duration-300"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-green-200 dark:bg-green-800/50 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-green-800 dark:text-green-300">No Active Alerts</h3>
                  </div>
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    Great! No active calamities detected in your area. Stay safe and prepared!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Escape Route */}
            <AnimatePresence>
              {escapeRoute && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-2xl p-5 shadow-lg transition-colors duration-300"
                >
                  <div 
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection('route')}
                  >
                    <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-200 dark:bg-green-800/50 rounded-lg flex items-center justify-center">
                        <Route className="w-4 h-4" />
                      </div>
                      <span>Escape Route</span>
                    </h3>
                    {expandedSections.route ? (
                      <ChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedSections.route && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2 transition-colors duration-300">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Distance:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">{escapeRoute.distance}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">{escapeRoute.duration}</span>
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 transition-colors duration-300">
                          <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-2 flex items-center space-x-1">
                            <Navigation className="w-4 h-4" />
                            <span>Route Steps:</span>
                          </p>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {escapeRoute.steps.slice(0, 3).map((step, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start space-x-2 text-xs text-green-600 dark:text-green-400"
                              >
                                <span className="w-5 h-5 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-xs flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                <span className="leading-relaxed">
                                  {step.instructions.replace(/<[^>]*>/g, '')}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Safety Tips */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-5 shadow-lg transition-colors duration-300"
            >
              <div 
                className="flex items-center justify-between mb-3 cursor-pointer"
                onClick={() => toggleSection('tips')}
              >
                <h3 className="font-bold text-yellow-800 dark:text-yellow-300 flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-200 dark:bg-yellow-800/50 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span>Safety Tips</span>
                </h3>
                {expandedSections.tips ? (
                  <ChevronDown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              
              <AnimatePresence>
                {expandedSections.tips && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 transition-colors duration-300">
                      <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
                        {[
                          "Stay calm and follow the escape route",
                          "Keep emergency supplies ready",
                          "Listen to local authorities",
                          "Have a communication plan",
                          "Know your evacuation routes"
                        ].map((tip, index) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <span className="w-1.5 h-1.5 bg-yellow-500 dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DisasterMap;

