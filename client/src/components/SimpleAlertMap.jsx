import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiAlertTriangle, FiNavigation, FiShield, FiClock, FiMap, FiInfo, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import FallbackMap from './FallbackMap';

const SimpleAlertMap = ({ isOpen, onClose, alert }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [escapeRoute, setEscapeRoute] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    route: true,
    tips: false
  });
  const [useFallback, setUseFallback] = useState(false);

  // Get alert coordinates or use default
  const getAlertCoordinates = () => {
    if (alert?.coordinates) {
      // Handle both {lat, lng} and {lat, lon} formats
      const lat = parseFloat(alert.coordinates.lat || alert.coordinates.latitude);
      const lng = parseFloat(alert.coordinates.lng || alert.coordinates.longitude || alert.coordinates.lon);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log('Using alert coordinates:', { lat, lng });
        return { lat, lng };
      }
    }
    
    // Fallback to location string parsing
    if (alert?.location) {
      const locationMap = {
        'Punjab, India': { lat: 31.1471, lng: 75.3412 },
        'Delhi, India': { lat: 28.6139, lng: 77.2090 },
        'Mumbai, India': { lat: 19.0760, lng: 72.8777 },
        'Bangalore, India': { lat: 12.9716, lng: 77.5946 },
        'Chennai, India': { lat: 13.0827, lng: 80.2707 },
        'Kolkata, India': { lat: 22.5726, lng: 88.3639 },
        'Hyderabad, India': { lat: 17.3850, lng: 78.4867 },
        'Pune, India': { lat: 18.5204, lng: 73.8567 },
        'Ahmedabad, India': { lat: 23.0225, lng: 72.5714 }
      };
      
      const coords = locationMap[alert.location];
      if (coords) {
        console.log('Using location-based coordinates:', coords);
        return coords;
      }
    }
    
    // Default fallback
    console.log('Using default coordinates (Delhi)');
    return { lat: 28.6139, lng: 77.2090 };
  };

  const alertCoords = getAlertCoordinates();

  // Calculate escape route
  const calculateEscapeRoute = (start, alertLocation) => {
    if (!directionsService || !directionsRenderer) return;

    try {
      // Calculate a safe escape direction (opposite to alert location)
      const bearing = window.google.maps.geometry.spherical.computeHeading(
        new window.google.maps.LatLng(start.lat, start.lng),
        new window.google.maps.LatLng(alertLocation.lat, alertLocation.lng)
      );

      // Calculate escape point (3km away in opposite direction)
      const escapePoint = window.google.maps.geometry.spherical.computeOffset(
        new window.google.maps.LatLng(start.lat, start.lng),
        3000, // 3km
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
          setEscapeRoute({
            distance: result.routes[0].legs[0].distance.text,
            duration: result.routes[0].legs[0].duration.text,
            steps: result.routes[0].legs[0].steps
          });
          console.log('Escape route calculated:', result.routes[0].legs[0]);
        } else {
          console.error('Directions request failed:', status);
        }
      });
    } catch (error) {
      console.error('Error calculating escape route:', error);
    }
  };

  // Show directions on map
  const showDirectionsOnMap = () => {
    if (!map || !directionsRenderer || !escapeRoute) return;

    try {
      directionsRenderer.setMap(map);
      setShowDirections(true);
    } catch (error) {
      console.error('Error showing directions:', error);
    }
  };

  // Clear directions
  const clearDirections = () => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setShowDirections(false);
    }
  };

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get emergency tips based on alert type
  const getEmergencyTips = (alertType) => {
    const tips = {
      earthquake: [
        'Drop, cover, and hold on',
        'Stay away from windows and heavy objects',
        'If outdoors, move to open area away from buildings',
        'If in vehicle, stop and stay inside',
        'Be prepared for aftershocks'
      ],
      flood: [
        'Move to higher ground immediately',
        'Avoid walking or driving through floodwaters',
        'Stay away from downed power lines',
        'Listen to emergency broadcasts',
        'Evacuate if instructed by authorities'
      ],
      fire: [
        'Evacuate immediately if ordered',
        'Close all doors and windows',
        'Turn off gas and electricity',
        'Wear protective clothing',
        'Follow evacuation routes'
      ],
      cyclone: [
        'Stay indoors and away from windows',
        'Secure outdoor objects',
        'Listen to weather updates',
        'Have emergency supplies ready',
        'Evacuate if in low-lying areas'
      ],
      tsunami: [
        'Move to higher ground immediately',
        'Stay away from beaches and coastal areas',
        'Listen to tsunami warnings',
        'Do not return until authorities say it\'s safe',
        'Follow evacuation routes'
      ]
    };
    return tips[alertType] || [
      'Follow emergency instructions',
      'Stay calm and alert',
      'Listen to authorities',
      'Have emergency supplies ready',
      'Evacuate if necessary'
    ];
  };

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log('SimpleAlertMap: Google Maps API already loaded');
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      console.log('SimpleAlertMap: Script already exists, waiting for load...');
      existingScript.onload = () => {
        console.log('SimpleAlertMap: Existing script loaded');
        // Wait a bit more to ensure Google Maps is fully initialized
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            console.log('SimpleAlertMap: Google Maps API is ready (existing script)');
            setIsLoaded(true);
          } else {
            console.error('SimpleAlertMap: Google Maps API not ready after existing script load');
            setError('Google Maps API failed to initialize properly');
          }
        }, 100);
      };
      existingScript.onerror = () => {
        console.error('SimpleAlertMap: Existing script failed to load');
        setError('Failed to load Google Maps API');
      };
      return;
    }

    console.log('SimpleAlertMap: Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCKTTfJD5_TERQvfVR-XimF7c2GJnBekC8&libraries=places,geometry,marker&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('SimpleAlertMap: Script loaded successfully');
      // Wait a bit more to ensure Google Maps is fully initialized
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log('SimpleAlertMap: Google Maps API is ready');
          setIsLoaded(true);
        } else {
          console.error('SimpleAlertMap: Google Maps API not ready after script load');
          setError('Google Maps API failed to initialize properly');
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      console.error('SimpleAlertMap: Script loading error:', error);
      console.log('SimpleAlertMap: This might be due to ad blockers or browser extensions blocking Google Maps');
      setUseFallback(true);
      setError(null); // Clear error to show fallback
    };

    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (isLoaded && mapRef.current && !map && isOpen) {
      // Double-check that Google Maps is actually ready
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        console.log('SimpleAlertMap: Google Maps not ready yet, retrying in 500ms...');
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            console.log('SimpleAlertMap: Google Maps is now ready, retrying map initialization');
            // Trigger re-render by updating a state or calling the effect again
            setIsLoaded(true);
          }
        }, 500);
        return;
      }
      
      try {
        console.log('Initializing simple map with coordinates:', alertCoords);
        console.log('Alert data:', alert);
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: alertCoords,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeId: 'roadmap',
          mapId: 'DEMO_MAP_ID' // Add Map ID for Advanced Markers
        });

        // Add marker using AdvancedMarkerElement
        const markerContent = document.createElement('div');
        markerContent.innerHTML = `
          <div style="
            width: 40px; 
            height: 40px; 
            background: #ef4444; 
            border: 3px solid #ffffff; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              width: 0; 
              height: 0; 
              border-left: 8px solid transparent; 
              border-right: 8px solid transparent; 
              border-bottom: 12px solid #ffffff;
              transform: translateY(-3px);
            "></div>
            <div style="
              position: absolute;
              width: 12px;
              height: 12px;
              background: #ffffff;
              border-radius: 50%;
            "></div>
          </div>
        `;

        // Check if AdvancedMarkerElement is available, fallback to regular Marker
        let marker;
        if (window.google?.maps?.marker?.AdvancedMarkerElement) {
          marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: alertCoords,
            map: mapInstance,
            title: alert?.title || 'Alert Location',
            content: markerContent
          });
        } else {
          // Fallback to regular Marker with custom icon
          marker = new window.google.maps.Marker({
            position: alertCoords,
            map: mapInstance,
            title: alert?.title || 'Alert Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
                  <path d="M20 8L24 16H16L20 8Z" fill="#ffffff"/>
                  <circle cx="20" cy="20" r="6" fill="#ffffff"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            }
          });
        }

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; color: #ef4444; font-size: 16px;">
                ${alert?.title || 'Alert Location'}
              </h3>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                ${alert?.description || 'Emergency alert in this area'}
              </p>
              <p style="margin: 0; color: #888; font-size: 12px;">
                Coordinates: ${alertCoords.lat.toFixed(4)}, ${alertCoords.lng.toFixed(4)}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        setMap(mapInstance);
        
        // Initialize directions service
        setDirectionsService(new window.google.maps.DirectionsService());
        setDirectionsRenderer(new window.google.maps.DirectionsRenderer({
          draggable: false,
          suppressMarkers: true
        }));
        
        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(userPos);
              console.log('User location detected:', userPos);
              
              // Calculate escape route
              calculateEscapeRoute(userPos, alertCoords);
            },
            (error) => {
              console.log('Geolocation error:', error);
              // Use default location for escape route calculation
              const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi
              setUserLocation(defaultLocation);
              calculateEscapeRoute(defaultLocation, alertCoords);
            }
          );
        } else {
          // Use default location
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          calculateEscapeRoute(defaultLocation, alertCoords);
        }
        
        // Verify map center
        setTimeout(() => {
          const center = mapInstance.getCenter()?.toJSON();
          console.log('Map center after initialization:', center);
          console.log('Expected center:', alertCoords);
        }, 1000);

      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to initialize map: ' + error.message);
      }
    }
  }, [isLoaded, isOpen, alert]);

  if (!isOpen || !alert) return null;

  // Show fallback map if Google Maps is blocked
  if (useFallback) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Alert Location
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alert.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Fallback Map Content */}
            <FallbackMap 
              alert={alert}
              userLocation={userLocation}
              escapeRoute={escapeRoute}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              showDirections={showDirections}
              clearDirections={clearDirections}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (error) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Map Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Quick Fix:</strong> Disable ad blockers for this site or try refreshing the page.
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Alert Location
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alert.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Map */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: {error ? 'Error' : isLoaded ? 'Map Loaded' : 'Loading Map...'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Center: {alertCoords.lat.toFixed(4)}, {alertCoords.lng.toFixed(4)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Location: {alert?.location || 'Unknown'}
              </p>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Error: {error}
                </p>
              )}
            </div>
            <div 
              ref={mapRef} 
              className="w-full h-96 border border-gray-300 rounded-lg relative"
              style={{ minHeight: '300px' }}
            >
              {!isLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading Map...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900">
                  <div className="text-center">
                    <div className="text-red-500 text-4xl mb-2">⚠️</div>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Escape Route Section */}
          {escapeRoute && (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {/* Escape Route */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                  <div 
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection('route')}
                  >
                    <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-200 dark:bg-green-800/50 rounded-lg flex items-center justify-center">
                        <FiMap className="w-4 h-4" />
                      </div>
                      <span>Escape Route</span>
                    </h3>
                    {expandedSections.route ? (
                      <FiChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiChevronRight className="w-5 h-5 text-green-600 dark:text-green-400" />
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Distance:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">{escapeRoute.distance}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">{escapeRoute.duration}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={showDirectionsOnMap}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                          >
                            <FiNavigation className="w-4 h-4" />
                            <span>Show Route</span>
                          </button>
                          {showDirections && (
                            <button
                              onClick={clearDirections}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                            >
                              <FiX className="w-4 h-4" />
                              <span>Clear</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Emergency Tips */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                  <div 
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleSection('tips')}
                  >
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800/50 rounded-lg flex items-center justify-center">
                        <FiShield className="w-4 h-4" />
                      </div>
                      <span>Emergency Tips</span>
                    </h3>
                    {expandedSections.tips ? (
                      <FiChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <FiChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedSections.tips && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <ul className="space-y-2">
                            {getEmergencyTips(alert?.type).map((tip, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                <FiInfo className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SimpleAlertMap;
