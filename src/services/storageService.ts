import AsyncStorage from '@react-native-async-storage/async-storage';
import { City, TemperatureUnit } from '../types';

const CITIES_KEY = '@weather_app/cities';
const UNIT_KEY = '@weather_app/unit';

export async function loadCities(): Promise<City[]> {
  try {
    const raw = await AsyncStorage.getItem(CITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCities(cities: City[]): Promise<void> {
  await AsyncStorage.setItem(CITIES_KEY, JSON.stringify(cities));
}

export async function addCity(city: City): Promise<City[]> {
  const cities = await loadCities();
  // prevent duplicates by id
  if (cities.find(c => c.id === city.id)) {
    return cities;
  }
  const updated = [...cities, city];
  await saveCities(updated);
  return updated;
}

export async function removeCity(id: string): Promise<City[]> {
  const cities = await loadCities();
  const updated = cities.filter(c => c.id !== id);
  await saveCities(updated);
  return updated;
}

export async function loadUnit(): Promise<TemperatureUnit> {
  try {
    const raw = await AsyncStorage.getItem(UNIT_KEY);
    return (raw as TemperatureUnit) ?? 'F';
  } catch {
    return 'F';
  }
}

export async function saveUnit(unit: TemperatureUnit): Promise<void> {
  await AsyncStorage.setItem(UNIT_KEY, unit);
}
