import { useState, useEffect, useCallback } from 'react';
import {
  loadCities,
  addCity as addCityToStorage,
  removeCity as removeCityFromStorage,
} from '../services/storageService';
import { City } from '../types';

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const saved = await loadCities();
    setCities(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addCity = useCallback(async (city: City) => {
    const updated = await addCityToStorage(city);
    setCities(updated);
  }, []);

  const removeCity = useCallback(async (id: string) => {
    const updated = await removeCityFromStorage(id);
    setCities(updated);
  }, []);

  return { cities, loading, addCity, removeCity, reload };
}
