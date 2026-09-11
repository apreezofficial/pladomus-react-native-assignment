import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  conditionCode: number;
  size?: number;
}

// Returns a color representing the weather condition
function getIconColor(code: number, theme: any): string {
  const colors = theme.colors.weather;
  
  if (code === 0 || code === 1) return colors.sunny; // sunny/clear
  if (code === 2 || code === 3) return colors.cloudy; // cloudy
  if (code >= 51 && code <= 67) return colors.rainy; // rain
  if (code >= 71 && code <= 77) return colors.snowy; // snow
  if (code >= 80 && code <= 82) return colors.rainy; // showers
  if (code >= 95) return colors.stormy; // thunderstorm
  return colors.cloudy;
}

export function WeatherIcon({ conditionCode, size = 80 }: Props) {
  const { theme } = useTheme();
  const color = getIconColor(conditionCode, theme);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat the animation
        setTimeout(pulse, 2000);
      });
    };
    
    pulse();
  }, []);

  return (
    <Animated.View
      style={[
        styles.circle,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          backgroundColor: color,
          transform: [{ scale: pulseAnim }],
        },
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
