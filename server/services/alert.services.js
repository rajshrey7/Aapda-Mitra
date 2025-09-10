const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.WEATHER_API;

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

module.exports = { checkWeatherAlert };