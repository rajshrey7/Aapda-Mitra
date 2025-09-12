import React, { useState, useEffect } from 'react';

const DynamicContentTest = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testHazards = ['earthquake', 'fire', 'thunderstorm', 'heatwave'];

  const testContent = async (hazardType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/learning-modules/content/${hazardType}?ageGroup=8-16`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setContent({ hazardType, data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dynamic Content Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {testHazards.map((hazard) => (
          <button
            key={hazard}
            onClick={() => testContent(hazard)}
            disabled={loading}
            className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test {hazard.charAt(0).toUpperCase() + hazard.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading content...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {content && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            {content.hazardType.charAt(0).toUpperCase() + content.hazardType.slice(1)} Content
          </h2>
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(content.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DynamicContentTest;
