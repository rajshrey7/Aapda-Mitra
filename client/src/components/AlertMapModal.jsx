import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiNavigation, FiClock, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const AlertMapModal = ({ alert, isOpen, onClose }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [showDirections, setShowDirections] = useState(false);

  const API_KEY = 'AIzaSyCKTTfJD5_TERQvfVR-XimF7c2GJnBekC8';

  // Get alert coordinates or use default location
  const getAlertCoordinates = () => {
    if (alert?.coordinates) {
      const lat = parseFloat(alert.coordinates.lat || alert.coordinates.latitude);
      const lng = parseFloat(alert.coordinates.lng || alert.coordinates.longitude);
      
      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    
    // Fallback to location string parsing or default coordinates
    if (alert?.location) {
      // Try to parse location string (e.g., "Delhi, India" -> coordinates)
      // This is a simplified version - in production, you'd use geocoding
      const locationMap = {
        'Delhi, India': { lat: 28.6139, lng: 77.2090 },
        'Mumbai, India': { lat: 19.0760, lng: 72.8777 },
        'Bangalore, India': { lat: 12.9716, lng: 77.5946 },
        'Chennai, India': { lat: 13.0827, lng: 80.2707 },
        'Kolkata, India': { lat: 22.5726, lng: 88.3639 },
        'Hyderabad, India': { lat: 17.3850, lng: 78.4867 },
        'Pune, India': { lat: 18.5204, lng: 73.8567 },
        'Ahmedabad, India': { lat: 23.0225, lng: 72.5714 }
      };
      
      return locationMap[alert.location] || { lat: 28.6139, lng: 77.2090 };
    }
    
    return { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
  };

  const alertCoords = getAlertCoordinates();
  
  // Debug logging
  console.log('AlertMapModal - Alert data:', alert);
  console.log('AlertMapModal - Alert coordinates:', alertCoords);
  console.log('AlertMapModal - Coordinates type:', typeof alertCoords?.lat, typeof alertCoords?.lng);
  console.log('AlertMapModal - Coordinates values:', alertCoords?.lat, alertCoords?.lng);

  // Load Google Maps
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.onload = () => setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps API');

    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    console.log('Map initialization check:', {
      isLoaded,
      hasMapRef: !!mapRef.current,
      hasMap: !!map,
      isOpen,
      alertCoords,
      hasValidCoords: alertCoords && alertCoords.lat && alertCoords.lng
    });
    
    if (isLoaded && mapRef.current && !map && isOpen && alertCoords && alertCoords.lat && alertCoords.lng) {
      try {
        console.log('Initializing map with coordinates:', alertCoords);
        console.log('Map center will be set to:', alertCoords);
        
        // Test with hardcoded coordinates to verify map works
        const testCoords = { lat: 28.6139, lng: 77.2090 }; // Delhi
        console.log('Using test coordinates for map center:', testCoords);
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: testCoords, // Use hardcoded coordinates first
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeId: 'roadmap'
        });
        
        // Verify the map center after initialization
        setTimeout(() => {
          console.log('Map center after initialization:', mapInstance.getCenter()?.toJSON());
        }, 1000);

      // Add alert marker
      console.log('Creating alert marker at position:', alertCoords);
      console.log('Using test coordinates for marker:', testCoords);
      const alertMarker = new window.google.maps.Marker({
        position: testCoords, // Use test coordinates for marker too
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
      console.log('Alert marker created:', alertMarker);

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; color: #ef4444; font-size: 16px;">
              ${alert?.title || 'Alert'}
            </h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
              ${alert?.description || 'No description available'}
            </p>
            <p style="margin: 0; color: #888; font-size: 12px;">
              <strong>Location:</strong> ${alert?.location || 'Unknown'}
            </p>
            <p style="margin: 4px 0 0 0; color: #888; font-size: 12px;">
              <strong>Severity:</strong> ${alert?.severity || 'Unknown'}
            </p>
          </div>
        `
      });

      alertMarker.addListener('click', () => {
        infoWindow.open(mapInstance, alertMarker);
      });

        // Initialize directions service
        setDirectionsService(new window.google.maps.DirectionsService());
        setDirectionsRenderer(new window.google.maps.DirectionsRenderer({
          draggable: false,
          suppressMarkers: true
        }));

        setMap(mapInstance);
        
        // Ensure map stays centered on alert coordinates
        mapInstance.addListener('center_changed', () => {
          const currentCenter = mapInstance.getCenter()?.toJSON();
          console.log('Map center changed to:', currentCenter);
          console.log('Expected alert coordinates:', alertCoords);
        });
        
        // Force center the map on alert coordinates after a short delay
        setTimeout(() => {
          console.log('Forcing map center to test coordinates:', testCoords);
          console.log('Map instance before setCenter:', mapInstance);
          console.log('Map center before setCenter:', mapInstance.getCenter()?.toJSON());
          
          mapInstance.setCenter(testCoords);
          mapInstance.setZoom(14);
          
          console.log('Map center after setCenter:', mapInstance.getCenter()?.toJSON());
        }, 500);
        
        // Additional force center after map is fully loaded
        setTimeout(() => {
          console.log('Second attempt to center map:', testCoords);
          mapInstance.setCenter(testCoords);
          mapInstance.setZoom(14);
        }, 2000);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to initialize map');
      }
    }
  }, [isLoaded, isOpen, alertCoords]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, [map]);

  // Center map on alert when modal opens
  useEffect(() => {
    if (isOpen && map && alertCoords) {
      console.log('Modal opened, centering map on alert:', alertCoords);
      setTimeout(() => {
        centerMapOnAlert();
      }, 100);
    }
  }, [isOpen, map, alertCoords]);

  // Show directions
  const showDirectionsToAlert = () => {
    if (!map || !directionsService || !directionsRenderer || !userLocation || !alertCoords) return;

    try {
      directionsRenderer.setMap(map);

      const request = {
        origin: userLocation,
        destination: alertCoords,
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          setShowDirections(true);
        } else {
          console.error('Directions request failed:', status);
        }
      });
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

  // Force center map on alert location
  const centerMapOnAlert = () => {
    if (map) {
      const testCoords = { lat: 28.6139, lng: 77.2090 }; // Delhi
      console.log('Force centering map on test coordinates:', testCoords);
      map.setCenter(testCoords);
      map.setZoom(14);
    }
  };

  if (!isOpen || !alert) return null;

  // Ensure we have valid coordinates before rendering
  if (!alertCoords || !alertCoords.lat || !alertCoords.lng) {
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
                Invalid Location Data
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This alert doesn't have valid location coordinates to display on the map.
              </p>
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
            <div className="flex items-center space-x-2">
              <button
                onClick={centerMapOnAlert}
                className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
                title="Center on Alert Location"
              >
                <FiMapPin className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row">
            {/* Map */}
            <div className="flex-1 relative">
              <div 
                ref={mapRef} 
                className="w-full h-96 lg:h-[500px]"
                style={{ minHeight: '300px' }}
              />
              
              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                {userLocation && (
                  <button
                    onClick={showDirectionsToAlert}
                    className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                    title="Get Directions"
                  >
                    <FiNavigation className="w-5 h-5" />
                  </button>
                )}
                {showDirections && (
                  <button
                    onClick={clearDirections}
                    className="p-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                    title="Clear Directions"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Alert Details */}
            <div className="w-full lg:w-80 p-6 bg-gray-50 dark:bg-gray-900">
              {/* Debug Panel */}
              <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info</h4>
                <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                  <div>Alert Coords: {JSON.stringify(alertCoords)}</div>
                  <div>Test Coords: {JSON.stringify({ lat: 28.6139, lng: 77.2090 })}</div>
                  <div>Map Status: {map ? 'Loaded' : 'Not Loaded'}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-5 h-5 text-red-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Location</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.location || 'Unknown Location'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Coordinates: {alertCoords?.lat?.toFixed(4) || 'N/A'}, {alertCoords?.lng?.toFixed(4) || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiInfo className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Description</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.description || 'No description available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiClock className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Alert Time</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                {alert.instructions && alert.instructions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Instructions</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {alert.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {userLocation && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={showDirectionsToAlert}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiNavigation className="w-4 h-4" />
                      <span>Get Directions</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertMapModal;
