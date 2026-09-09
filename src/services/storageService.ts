import AsyncStorage from '@react-native-async-storage/async-storage';
import { City, TemperatureUnit } from '../types';

const CITIES_KEY = '@weather_app/cities';
const UNIT_KEY = '@weather_app/unit';
const CURRENT_LOCATION_KEY = '@weather_app/current_location';

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

// Current location functions
export async function saveCurrentLocation(latitude: number, longitude: number, name?: string): Promise<City> {
  const locationCity: City = {
    id: 'current_location',
    name: name || 'My Location',
    latitude,
    longitude,
    isCurrentLocation: true,
  };
  
  await AsyncStorage.setItem(CURRENT_LOCATION_KEY, JSON.stringify(locationCity));
  
  // Also add to cities list if not already there
  const cities = await loadCities();
  const existingIndex = cities.findIndex(c => c.isCurrentLocation);
  
  let updated: City[];
  if (existingIndex >= 0) {
    // Update existing current location
    updated = [...cities];
    updated[existingIndex] = locationCity;
  } else {
    // Add as first city
    updated = [locationCity, ...cities];
  }
  
  await saveCities(updated);
  return locationCity;
}

export async function loadCurrentLocation(): Promise<City | null> {
  try {
    const raw = await AsyncStorage.getItem(CURRENT_LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function removeCurrentLocation(): Promise<City[]> {
  await AsyncStorage.removeItem(CURRENT_LOCATION_KEY);
  const cities = await loadCities();
  const updated = cities.filter(c => !c.isCurrentLocation);
  await saveCities(updated);
  return updated;
}
