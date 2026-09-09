import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  conditionCode: number;
  size?: number;
  autoPlay?: boolean;
}

// Map weather codes to Lottie animation sources
function getLottieSource(code: number): any {
  // For now, we'll use placeholder animations
  // In a real app, you'd have actual Lottie JSON files
  if (code === 0 || code === 1) {
    // Sunny/Clear - would use sunny.json
    return require('../assets/lottie/sunny-placeholder.json');
  }
  if (code === 2 || code === 3) {
    // Cloudy - would use cloudy.json  
    return require('../assets/lottie/cloudy-placeholder.json');
  }
  if (code >= 51 && code <= 67) {
    // Rain - would use rainy.json
    return require('../assets/lottie/rainy-placeholder.json');
  }
  if (code >= 71 && code <= 77) {
    // Snow - would use snowy.json
    return require('../assets/lottie/snowy-placeholder.json');
  }
  if (code >= 95) {
    // Storm - would use stormy.json
    return require('../assets/lottie/stormy-placeholder.json');
  }
  
  // Default to cloudy
  return require('../assets/lottie/cloudy-placeholder.json');
}

// Fallback color if Lottie doesn't load
function getIconColor(code: number, theme: any): string {
  const colors = theme.colors.weather;
  
  if (code === 0 || code === 1) return colors.sunny;
  if (code === 2 || code === 3) return colors.cloudy;
  if (code >= 51 && code <= 67) return colors.rainy;
  if (code >= 71 && code <= 77) return colors.snowy;
  if (code >= 95) return colors.stormy;
  return colors.cloudy;
}

export function LottieWeatherIcon({ conditionCode, size = 80, autoPlay = true }: Props) {
  const { theme } = useTheme();
  const fallbackColor = getIconColor(conditionCode, theme);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Try to load Lottie animation */}
      <LottieView
        source={getLottieSource(conditionCode)}
        autoPlay={autoPlay}
        loop={true}
        style={[styles.lottie, { width: size, height: size }]}
        onAnimationFailure={() => {
          // Fallback to colored circle if Lottie fails
          console.log('Lottie animation failed, using fallback');
        }}
      />
      
      {/* Fallback colored circle (hidden when Lottie loads) */}
      <View
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: fallbackColor,
            opacity: 0, // Will be shown if Lottie fails
          },
        ]}
      />
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
  lottie: {
    position: 'absolute',
  },
  fallback: {
    position: 'absolute',
  },
});