export interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isCurrentLocation?: boolean;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  conditionCode: number; // WMO weather code
}

export type TemperatureUnit = 'C' | 'F';

export type RootStackParamList = {
  SavedCities: undefined;
  AddCity: undefined;
  WeatherDetail: {
    city?: City;
    useCurrentLocation?: boolean;
  };
};
