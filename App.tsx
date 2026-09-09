import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from './src/hooks/useTheme';

import { RootStackParamList } from './src/types';
import { SavedCitiesScreen } from './src/screens/SavedCitiesScreen';
import { AddCityScreen } from './src/screens/AddCityScreen';
import { WeatherDetailScreen } from './src/screens/WeatherDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { theme } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
        translucent={false}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 300,
              contentStyle: { backgroundColor: theme.colors.background },
            }}>
            <Stack.Screen 
              name="SavedCities" 
              component={SavedCitiesScreen}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen 
              name="AddCity" 
              component={AddCityScreen}
              options={{
                animation: 'slide_from_right',
                animationDuration: 250,
              }}
            />
            <Stack.Screen 
              name="WeatherDetail" 
              component={WeatherDetailScreen}
              options={{
                animation: 'slide_from_bottom',
                animationDuration: 300,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
