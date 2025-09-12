import React, { useState, useEffect } from 'react';

const GoogleMapsTest = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    const checkGoogleMaps = () => {
      const results = {
        google: !!window.google,
        maps: !!window.google?.maps,
        map: !!window.google?.maps?.Map,
        marker: !!window.google?.maps?.marker,
        advancedMarker: !!window.google?.maps?.marker?.AdvancedMarkerElement,
        places: !!window.google?.maps?.places,
        geometry: !!window.google?.maps?.geometry
      };

      setTestResults(results);
      setIsLoaded(true);

      if (!results.google) {
        setError('Google Maps API not loaded');
      } else if (!results.advancedMarker) {
        setError('AdvancedMarkerElement not available - marker library may not be loaded');
      }
    };

    if (window.google) {
      checkGoogleMaps();
    } else {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCKTTfJD5_TERQvfVR-XimF7c2GJnBekC8&libraries=places,geometry,marker&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setTimeout(checkGoogleMaps, 100); // Small delay to ensure everything is loaded
      };
      script.onerror = () => {
        setError('Failed to load Google Maps API');
      };
      
      document.head.appendChild(script);
    }
  }, []);

  const testAdvancedMarker = () => {
    if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      try {
        const testContent = document.createElement('div');
        testContent.innerHTML = '<div style="width: 20px; height: 20px; background: red; border-radius: 50%;"></div>';
        
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: 28.6139, lng: 77.2090 },
          content: testContent
        });
        
        console.log('AdvancedMarkerElement test successful:', marker);
        alert('AdvancedMarkerElement test successful! Check console for details.');
      } catch (err) {
        console.error('AdvancedMarkerElement test failed:', err);
        alert('AdvancedMarkerElement test failed: ' + err.message);
      }
    } else {
      alert('AdvancedMarkerElement not available');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Google Maps API Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoaded && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">API Availability Check</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(testResults).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">{key}:</span>
                <span className={value ? 'text-green-600' : 'text-red-600'}>
                  {value ? 'Available' : 'Not Available'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={testAdvancedMarker}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test AdvancedMarkerElement
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                userAgent: navigator.userAgent,
                googleMapsVersion: window.google?.maps?.version,
                libraries: window.google?.maps?.libraries,
                testResults
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!isLoaded && !error && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Google Maps API...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsTest;
