import React, { useEffect, useRef, useState } from 'react';

const SimpleMapTest = () => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initMap = () => {
      if (window.google && window.google.maps && mapRef.current) {
        try {
          new window.google.maps.Map(mapRef.current, {
            center: { lat: 28.6139, lng: 77.2090 },
            zoom: 10
          });
          setMapLoaded(true);
          console.log('Simple map loaded successfully');
        } catch (err) {
          console.error('Map initialization error:', err);
          setError(err.message);
        }
      }
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCKTTfJD5_TERQvfVR-XimF7c2GJnBekC8';
      script.onload = () => {
        console.log('Google Maps script loaded');
        initMap();
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setError('Failed to load Google Maps');
      };
      document.head.appendChild(script);
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="text-red-800 font-bold">Map Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Simple Map Test</h3>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '400px',
          border: '2px solid #ccc',
          backgroundColor: '#f0f0f0'
        }}
      />
      <p className="mt-2 text-sm text-gray-600">
        Status: {mapLoaded ? 'Map loaded successfully!' : 'Loading map...'}
      </p>
    </div>
  );
};

export default SimpleMapTest;
