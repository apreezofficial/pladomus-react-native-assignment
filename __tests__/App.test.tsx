/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      Screen: () => null,
    }),
  };
});

jest.mock('../src/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      isDark: false,
      colors: {
        background: '#ffffff',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#111111',
        textSecondary: '#666666',
        primary: '#3d5afe',
        accent: '#e07b39',
        border: '#e8eaf0',
      },
    },
  }),
}));

jest.mock('../src/screens/SavedCitiesScreen', () => ({
  SavedCitiesScreen: () => null,
}));

jest.mock('../src/screens/AddCityScreen', () => ({
  AddCityScreen: () => null,
}));

jest.mock('../src/screens/WeatherDetailScreen', () => ({
  WeatherDetailScreen: () => null,
}));

import App from '../App';
import { WeatherDetailScreen } from '../src/screens/WeatherDetailScreen';
import { useRoute } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useRoute: jest.fn(),
    useNavigation: () => ({ goBack: jest.fn() }),
  };
});

jest.mock('../src/hooks/useWeather', () => ({
  useWeather: () => ({
    weather: null,
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

jest.mock('../src/hooks/useUnit', () => ({
  useUnit: () => ({ unit: 'C', toggleUnit: jest.fn() }),
}));

jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
  getCurrentPosition: jest.fn(),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('WeatherDetailScreen does not crash without route params', async () => {
  (useRoute as jest.Mock).mockReturnValue({ params: undefined });

  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<WeatherDetailScreen />);
  });
});
