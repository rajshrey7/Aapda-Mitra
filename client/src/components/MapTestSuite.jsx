import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MapPin } from 'lucide-react';

const MapTestSuite = () => {
  const [tests, setTests] = useState([]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    setTests([]);
    
    const testResults = [];

    // Test 1: Google Maps API Loading
    try {
      const mapsLoaded = window.google && window.google.maps;
      testResults.push({
        name: 'Google Maps API Loading',
        status: mapsLoaded ? 'pass' : 'fail',
        message: mapsLoaded ? 'Google Maps API loaded successfully' : 'Google Maps API not loaded'
      });
    } catch (error) {
      testResults.push({
        name: 'Google Maps API Loading',
        status: 'fail',
        message: `Error: ${error.message}`
      });
    }

    // Test 2: Weather API Endpoint
    try {
      const response = await fetch('/api/alerts/weather?location=28.6139,77.2090');
      const data = await response.json();
      testResults.push({
        name: 'Weather API Endpoint',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'Weather API responding correctly' : `API Error: ${data.message || 'Unknown error'}`
      });
    } catch (error) {
      testResults.push({
        name: 'Weather API Endpoint',
        status: 'fail',
        message: `Network Error: ${error.message}`
      });
    }

    // Test 3: Active Alerts API Endpoint
    try {
      const response = await fetch('/api/alerts/active');
      const data = await response.json();
      testResults.push({
        name: 'Active Alerts API Endpoint',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'Active alerts API responding correctly' : `API Error: ${data.message || 'Unknown error'}`
      });
    } catch (error) {
      testResults.push({
        name: 'Active Alerts API Endpoint',
        status: 'fail',
        message: `Network Error: ${error.message}`
      });
    }

    // Test 4: Geolocation API
    try {
      if (navigator.geolocation) {
        testResults.push({
          name: 'Geolocation API',
          status: 'pass',
          message: 'Geolocation API available'
        });
      } else {
        testResults.push({
          name: 'Geolocation API',
          status: 'fail',
          message: 'Geolocation API not available'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Geolocation API',
        status: 'fail',
        message: `Error: ${error.message}`
      });
    }

    // Test 5: Map Container Element
    try {
      const mapContainer = document.querySelector('[data-testid="map-container"]');
      testResults.push({
        name: 'Map Container Element',
        status: mapContainer ? 'pass' : 'fail',
        message: mapContainer ? 'Map container element found' : 'Map container element not found'
      });
    } catch (error) {
      testResults.push({
        name: 'Map Container Element',
        status: 'fail',
        message: `Error: ${error.message}`
      });
    }

    setTests(testResults);
    setRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'fail':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Map Test Suite</h1>
        <p className="text-gray-600">Comprehensive testing for disaster map functionality</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Test Controls</h2>
          <button
            onClick={runTests}
            disabled={running}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <MapPin className="w-5 h-5" />
            <span>{running ? 'Running Tests...' : 'Run All Tests'}</span>
          </button>
        </div>

        {running && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Running comprehensive tests...</span>
          </div>
        )}
      </div>

      {tests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
          {tests.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm opacity-80 mt-1">{test.message}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'pass').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.status === 'fail').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {tests.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Quick Links</h4>
        <div className="space-x-4">
          <a href="/disaster-map" className="text-blue-600 hover:text-blue-800 underline">
            Disaster Map
          </a>
          <a href="/simple-map" className="text-blue-600 hover:text-blue-800 underline">
            Simple Map Test
          </a>
          <a href="/map-test" className="text-blue-600 hover:text-blue-800 underline">
            Advanced Map Test
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapTestSuite;
