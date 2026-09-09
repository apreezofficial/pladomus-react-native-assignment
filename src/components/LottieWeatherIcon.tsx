import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WeatherIcon } from './WeatherIcon';
import { useTheme } from '../hooks/useTheme';

interface Props {
  conditionCode: number;
  size?: number;
  autoPlay?: boolean;
}

export function LottieWeatherIcon({ conditionCode, size = 80 }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Using enhanced WeatherIcon until Lottie build issues are resolved */}
      <WeatherIcon conditionCode={conditionCode} size={size * 0.9} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});