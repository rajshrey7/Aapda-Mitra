import React, { useEffect, useRef, useState } from 'react';

const MapTest = () => {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Google Maps API
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCKTTfJD5_TERQvfVR-XimF7c2GJnBekC8&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps API');

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      try {
        console.log('Creating test map...');
        const testCoords = { lat: 28.6139, lng: 77.2090 }; // Delhi
        
        const map = new window.google.maps.Map(mapRef.current, {
          center: testCoords,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeId: 'roadmap'
        });

        // Add marker
        const marker = new window.google.maps.Marker({
          position: testCoords,
          map: map,
          title: 'Test Location - Delhi',
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

        console.log('Test map created successfully');
        console.log('Map center:', map.getCenter()?.toJSON());
        
        // Verify center after a delay
        setTimeout(() => {
          console.log('Map center after delay:', map.getCenter()?.toJSON());
        }, 1000);

      } catch (error) {
        console.error('Error creating test map:', error);
        setError('Failed to create map');
      }
    }
  }, [isLoaded]);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        <h3 className="font-bold">Map Test Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Google Maps Test</h2>
      <div className="mb-4">
        <p>Status: {isLoaded ? 'Loaded' : 'Loading...'}</p>
        <p>Expected Center: Delhi (28.6139, 77.2090)</p>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-96 border border-gray-300 rounded-lg"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default MapTest;