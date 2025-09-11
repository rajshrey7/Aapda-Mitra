import React, { useEffect, useRef, useState } from 'react';

const MapTest = () => {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);

  // Use a different API key or check if the current one works
  const API_KEY = 'AIzaSyCKTTfJD5_TERQvfVR-XimF7c2GJnBekC8';

  useEffect(() => {
    console.log('MapTest: Starting map initialization...');
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('MapTest: Google Maps already loaded');
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      console.log('MapTest: Script already exists, waiting for load...');
      existingScript.onload = () => {
        console.log('MapTest: Existing script loaded');
        setIsLoaded(true);
      };
      return;
    }

    console.log('MapTest: Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('MapTest: Script loaded successfully');
      setIsLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error('MapTest: Script loading error:', error);
      setError('Failed to load Google Maps API. Please check your API key.');
    };

    document.head.appendChild(script);

    return () => {
      console.log('MapTest: Cleanup');
      const scriptToRemove = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (scriptToRemove && scriptToRemove === script) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      console.log('MapTest: Initializing map...');
      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 28.6139, lng: 77.2090 }, // Delhi coordinates
          zoom: 10,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        });
        console.log('MapTest: Map initialized successfully');
        setMap(mapInstance);
      } catch (error) {
        console.error('MapTest: Map initialization error:', error);
        setError('Failed to initialize map: ' + error.message);
      }
    }
  }, [isLoaded, map]);

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Map Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="text-sm text-gray-600">
          <p>Debug info:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Google Maps loaded: {window.google ? 'Yes' : 'No'}</li>
            <li>Script loaded: {isLoaded ? 'Yes' : 'No'}</li>
            <li>Map instance: {map ? 'Created' : 'Not created'}</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-blue-600">Loading Google Maps...</span>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>Debug info:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Google Maps loaded: {window.google ? 'Yes' : 'No'}</li>
            <li>Script loading: In progress...</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Map Test</h3>
      <div 
        ref={mapRef} 
        className="w-full h-96 border border-gray-300 rounded-lg"
        style={{ minHeight: '400px' }}
      />
      <div className="mt-4 text-sm text-gray-600">
        <p>Debug info:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Google Maps loaded: {window.google ? 'Yes' : 'No'}</li>
          <li>Script loaded: {isLoaded ? 'Yes' : 'No'}</li>
          <li>Map instance: {map ? 'Created' : 'Not created'}</li>
          <li>Map container: {mapRef.current ? 'Available' : 'Not available'}</li>
        </ul>
      </div>
    </div>
  );
};

export default MapTest;
