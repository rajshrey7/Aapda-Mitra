import axios from "axios";
import dotenv from "dotenv"
dotenv.config();

const apiKey = process.env.WEATHER_API;

export async function checkWeatherAlert(location) {
    const apiUri = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=1&aqi=no&alerts=yes`

    try {
        const res = await axios.get(apiUri);

        console.log(res.data);

        const alert = res.data.alerts.alert;

        let isAlert = alert.length > 0 ? true : false;
        
        return { isAlert, alert };
    } catch (error) {
        console.log(error);
        return {isAlert: false};
    }
}