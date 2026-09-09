import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './src/types';
import { SavedCitiesScreen } from './src/screens/SavedCitiesScreen';
import { AddCityScreen } from './src/screens/AddCityScreen';
import { WeatherDetailScreen } from './src/screens/WeatherDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#FFFFFF"
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,    // all screens have custom headers
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#F0F2F8' },
          }}>
          <Stack.Screen name="SavedCities" component={SavedCitiesScreen} />
          <Stack.Screen name="AddCity" component={AddCityScreen} />
          <Stack.Screen name="WeatherDetail" component={WeatherDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
