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

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
