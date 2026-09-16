import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  message?: string;
  size?: number;
}

function ShimmerBar({
  width,
  height,
  radius = 10,
  style,
}: {
  width: number;
  height: number;
  radius?: number;
  style?: any;
}) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.isDark ? '#2B3343' : '#E7EBF3',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function LoadingAnimation({ message = 'Loading weather…' }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <ShimmerBar width={64} height={64} radius={32} />
        <View style={styles.textBlock}>
          <ShimmerBar width={160} height={18} radius={9} />
          <ShimmerBar width={220} height={12} radius={6} style={{ marginTop: 12 }} />
          <ShimmerBar width={180} height={12} radius={6} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
}

export function ShimmerPlaceholder({
  width,
  height,
  radius = 12,
  style,
}: {
  width: number;
  height: number;
  radius?: number;
  style?: any;
}) {
  return <ShimmerBar width={width} height={height} radius={radius} style={style} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 240,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  textBlock: {
    flex: 1,
    marginTop: 2,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});