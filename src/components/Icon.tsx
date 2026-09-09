import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  name: string;
  size?: number;
  color?: string;
}

// Unicode icon mappings for common icons
const ICON_MAP: Record<string, string> = {
  // Weather
  'sunny': '☀️',
  'cloudy': '☁️',
  'rainy': '🌧️',
  'snowy': '❄️',
  'stormy': '⛈️',
  'windy': '💨',
  'humidity': '💧',
  
  // Navigation  
  'back': '‹',
  'forward': '›',
  'up': '▲',
  'down': '▼',
  'add': '➕',
  'close': '✕',
  'check': '✓',
  'refresh': '↻',
  
  // Location
  'location': '📍',
  'location-outline': '📌',
  'map': '🗺️',
  
  // Settings
  'settings': '⚙️',
  'theme-light': '☀️',
  'theme-dark': '🌙',
  'theme-auto': '🌓',
  
  // Actions
  'search': '🔍',
  'star': '⭐',
  'heart': '❤️',
  'share': '📤',
  'more': '⋯',
  
  // Status
  'loading': '⏳',
  'error': '⚠️',
  'success': '✅',
  'info': 'ℹ️',
};

export function Icon({ name, size = 20, color }: Props) {
  const { theme } = useTheme();
  const iconCharacter = ICON_MAP[name] || '?';
  const iconColor = color || theme.colors.text;

  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color: iconColor,
          lineHeight: size + 2,
        },
      ]}
    >
      {iconCharacter}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    fontWeight: 'normal',
  },
});