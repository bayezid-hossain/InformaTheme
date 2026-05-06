import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({ temp: 22, condition: 'Clear', location: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      // 1. Get Permission
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // 2. Get Location
      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
      }
      if (!location) return;
      const { latitude, longitude } = location.coords;

      // 3. Get City Name (Reverse Geocode)
      let cityName = 'Current Location';
      try {
        let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        cityName = geocode[0]?.city || geocode[0]?.subregion || 'Current Location';
      } catch (err) {
        console.warn('[useWeather] reverseGeocode failed:', err);
      }

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
    } catch (e: any) {
      console.warn('[useWeather] fetch failed (network offline/transient drop):', e?.message || e);
    }
  }, []);

  useEffect(() => {
    // 1. Initial fetch on mount
    fetchWeather();

    // 2. Global observer: Poll for permission state transitions (transitions to 'granted')
    let active = true;
    const checkPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      const granted = status === 'granted';
      if (active) {
        if (permissionGranted === false && granted === true) {
          // It was just granted! Fetch weather instantly!
          fetchWeather();
        }
        setPermissionGranted(granted);
      }
    };

    const permInterval = setInterval(checkPermission, 1500);

    // 3. Regular 30 minute periodic weather fetch
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);

    // 4. Handle AppState transitions back to 'active'
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        fetchWeather();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      active = false;
      clearInterval(permInterval);
      clearInterval(weatherInterval);
      subscription.remove();
    };
  }, [permissionGranted, fetchWeather]);

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
