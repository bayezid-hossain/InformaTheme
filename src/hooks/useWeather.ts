import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({ temp: 22, condition: 'Clear', location: 'Bhaluka' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      // 1. Get Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // 2. Get Location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 3. Get City Name (Reverse Geocode)
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let cityName = geocode[0]?.city || geocode[0]?.subregion || 'Current Location';

      // 4. Fetch Weather
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const data = await res.json();
      
      if (data.current_weather) {
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          condition: getWeatherCondition(data.current_weather.weathercode),
          location: cityName
        });
      }
    } catch (e) {
      console.error('[useWeather] fetch failed:', e);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // every 30 mins
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, refresh: fetchWeather, errorMsg };
}

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Clear';
}
