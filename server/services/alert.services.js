const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.WEATHER_API;

// Geocoding function to get coordinates from location string
async function geocodeLocation(location) {
    try {
        // Using OpenCage Geocoding API (free tier available)
        const geocodeApiKey = process.env.OPENCAGE_API_KEY || 'your-opencage-api-key';
        const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${geocodeApiKey}&limit=1`;
        
        const response = await axios.get(geocodeUrl);
        const results = response.data.results;
        
        if (results && results.length > 0) {
            const { lat, lng } = results[0].geometry;
            return { lat, lng };
        }
        
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

// Enhanced function to get coordinates with fallback
async function getLocationCoordinates(location) {
    // First try geocoding
    const geocoded = await geocodeLocation(location);
    if (geocoded) {
        return geocoded;
    }
    
    // Fallback to known locations
    const knownLocations = {
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
    
    return knownLocations[location] || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
}

async function checkWeatherAlert(location) {
    const apiUri = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=1&aqi=no&alerts=yes`;

    try {
        const res = await axios.get(apiUri);

        const alert = res?.data?.alerts?.alert || [];

        const isAlert = Array.isArray(alert) && alert.length > 0;
        
        return { isAlert, alert };
    } catch (error) {
        console.log(error);
        return { isAlert: false };
    }
}

module.exports = { 
    checkWeatherAlert, 
    geocodeLocation, 
    getLocationCoordinates 
};