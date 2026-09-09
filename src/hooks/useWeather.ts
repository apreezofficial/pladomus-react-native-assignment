import { useState, useCallback } from 'react';
import { fetchWeather } from '../services/weatherService';
import { WeatherData } from '../types';

interface UseWeatherResult {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: (lat: number, lon: number) => Promise<void>;
}

export function useWeather(
  latitude: number | null,
  longitude: number | null,
): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, []);

  return { weather, loading, error, refresh };
}
