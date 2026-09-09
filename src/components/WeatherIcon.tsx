import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  conditionCode: number;
  size?: number;
}

// Returns a color representing the weather condition
function getIconColor(code: number): string {
  if (code === 0 || code === 1) return '#F5A623'; // sunny/clear → orange
  if (code === 2 || code === 3) return '#9B9B9B'; // cloudy → gray
  if (code >= 51 && code <= 67) return '#4A90E2'; // rain → blue
  if (code >= 71 && code <= 77) return '#B0C4DE'; // snow → light steel
  if (code >= 80 && code <= 82) return '#5B9BD5'; // showers → medium blue
  if (code >= 95) return '#7B68EE'; // thunderstorm → purple
  return '#9B9B9B';
}

export function WeatherIcon({ conditionCode, size = 80 }: Props) {
  const color = getIconColor(conditionCode);

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  circle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
