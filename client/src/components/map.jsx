import React, { useEffect, useRef, useState } from 'react';

const GoogleMapsComponent = ({
  center = { lat: 37.7749, lng: -122.4194 },
  zoom = 10,
  height = '400px',
  width = '100%',
  markers = [],
  onMapClick = null,
  mapOptions = {}
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const markersRef = useRef([]);

  const API_KEY = 'AIzaSyCKTTfJD5_TERQvfVR-XimF7c2GJnBekC8';

  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      setError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript === script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        mapId: 'DEMO_MAP_ID', // Add Map ID for Advanced Markers
        streetViewControl: true,
        fullscreenControl: true,
        ...mapOptions
      });

      if (onMapClick) {
        mapInstance.addListener('click', (event) => {
          onMapClick({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          });
        });
      }

      setMap(mapInstance);
    }
  }, [isLoaded, center, zoom, onMapClick, mapOptions]);

  useEffect(() => {
    if (map && markers.length > 0) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      markers.forEach((markerData) => {
        // Create marker content element
        const markerContent = document.createElement('div');
        markerContent.innerHTML = `
          <div style="
            width: 30px; 
            height: 30px; 
            background: #3b82f6; 
            border: 2px solid #ffffff; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 0; 
              height: 0; 
              border-left: 6px solid transparent; 
              border-right: 6px solid transparent; 
              border-bottom: 8px solid #ffffff;
              transform: translateY(-2px);
            "></div>
          </div>
        `;

        // Check if AdvancedMarkerElement is available, fallback to regular Marker
        let marker;
        if (window.google?.maps?.marker?.AdvancedMarkerElement) {
          marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: markerData.position,
            map: map,
            title: markerData.title || '',
            content: markerContent
          });
        } else {
          // Fallback to regular Marker with custom icon
          marker = new window.google.maps.Marker({
            position: markerData.position,
            map: map,
            title: markerData.title || '',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="12" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
                  <path d="M15 6L18 12H12L15 6Z" fill="#ffffff"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(30, 30),
              anchor: new window.google.maps.Point(15, 15)
            }
          });
        }

        if (markerData.infoWindow) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.infoWindow
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }

        markersRef.current.push(marker);
      });
    }
  }, [map, markers]);

  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  if (error) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666',
          fontSize: '16px'
        }}
      >
        Error loading Google Maps: {error}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666',
          fontSize: '16px'
        }}
      >
        Loading Google Maps...
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width, 
        height,
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }} 
    />
  );
};

const MapExample = () => {
  const [clickedLocation, setClickedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });

  const sampleMarkers = [
    {
      position: { lat: 37.7749, lng: -122.4194 },
      title: 'San Francisco',
      infoWindow: '<div><h3>San Francisco</h3><p>The Golden City</p></div>'
    },
    {
      position: { lat: 37.7849, lng: -122.4094 },
      title: 'Another Location',
      infoWindow: '<div><h3>Custom Marker</h3><p>Click on markers to see info windows!</p></div>'
    }
  ];

  const handleMapClick = (location) => {
    setClickedLocation(location);
    console.log('Map clicked at:', location);
  };

  const goToNewYork = () => {
    setMapCenter({ lat: 40.7128, lng: -74.0060 });
  };

  const goToLondon = () => {
    setMapCenter({ lat: 51.5074, lng: -0.1278 });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Google Maps React Component</h1>
      
      <div className="mb-4 space-x-4">
        <button 
          onClick={goToNewYork}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go to New York
        </button>
        <button 
          onClick={goToLondon}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Go to London
        </button>
      </div>

      <GoogleMapsComponent
        center={mapCenter}
        zoom={12}
        height="500px"
        markers={sampleMarkers}
        onMapClick={handleMapClick}
        mapOptions={{
          mapTypeId: 'roadmap',
          disableDefaultUI: false
        }}
      />

      {clickedLocation && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold text-gray-700">Last clicked location:</h3>
          <p className="text-gray-600">
            Latitude: {clickedLocation.lat.toFixed(6)}<br/>
            Longitude: {clickedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Features included:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Custom markers with info windows</li>
          <li>Click event handling</li>
          <li>Dynamic center and zoom updates</li>
          <li>Customizable map options</li>
          <li>Loading and error states</li>
          <li>Responsive design</li>
        </ul>
      </div>
    </div>
  );
};

export default MapExample;