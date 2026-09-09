import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  message?: string;
  size?: number;
}

export function LoadingAnimation({ message = 'Loading weather…', size = 60 }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LottieView
        source={require('../assets/lottie/loading.json')}
        autoPlay={true}
        loop={true}
        style={{ width: size, height: size }}
      />
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 200,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});