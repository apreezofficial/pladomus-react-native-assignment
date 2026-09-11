import React from 'react';
import { StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../hooks/useTheme';

interface Props {
  name: string;
  size?: number;
  color?: string;
}

// Map icon names to react-native-vector-icons
const getVectorIcon = (name: string, size: number, color: string) => {
  const iconProps = { size, color, style: styles.icon };

  switch (name) {
    // Weather icons
    case 'sunny':
      return <Ionicons name="sunny" {...iconProps} />;
    case 'cloudy':
      return <Ionicons name="cloudy" {...iconProps} />;
    case 'rainy':
      return <Ionicons name="rainy" {...iconProps} />;
    case 'snowy':
      return <Ionicons name="snow" {...iconProps} />;
    case 'stormy':
      return <Ionicons name="thunderstorm" {...iconProps} />;
    case 'windy':
      return <Feather name="wind" {...iconProps} />;
    case 'humidity':
      return <Ionicons name="water" {...iconProps} />;
    
    // Navigation icons
    case 'back':
      return <Ionicons name="chevron-back" {...iconProps} />;
    case 'forward':
      return <Ionicons name="chevron-forward" {...iconProps} />;
    case 'up':
      return <Ionicons name="chevron-up" {...iconProps} />;
    case 'down':
      return <Ionicons name="chevron-down" {...iconProps} />;
    case 'add':
      return <Ionicons name="add" {...iconProps} />;
    case 'close':
      return <Ionicons name="close" {...iconProps} />;
    case 'check':
      return <Ionicons name="checkmark" {...iconProps} />;
    case 'refresh':
      return <Ionicons name="refresh" {...iconProps} />;
    
    // Location icons
    case 'location':
      return <Ionicons name="location" {...iconProps} />;
    case 'location-outline':
      return <Ionicons name="location-outline" {...iconProps} />;
    case 'map':
      return <Ionicons name="map" {...iconProps} />;
    
    // Settings icons
    case 'settings':
      return <Ionicons name="settings" {...iconProps} />;
    case 'theme-light':
      return <Ionicons name="sunny" {...iconProps} />;
    case 'theme-dark':
      return <Ionicons name="moon" {...iconProps} />;
    case 'theme-auto':
      return <MaterialIcons name="brightness-auto" {...iconProps} />;
    
    // Action icons
    case 'search':
      return <Ionicons name="search" {...iconProps} />;
    case 'star':
      return <Ionicons name="star" {...iconProps} />;
    case 'heart':
      return <Ionicons name="heart" {...iconProps} />;
    case 'share':
      return <Ionicons name="share-social" {...iconProps} />;
    case 'more':
      return <Ionicons name="ellipsis-horizontal" {...iconProps} />;
    
    // Status icons
    case 'loading':
      return <MaterialIcons name="hourglass-empty" {...iconProps} />;
    case 'error':
      return <Ionicons name="alert-circle" {...iconProps} />;
    case 'success':
      return <Ionicons name="checkmark-circle" {...iconProps} />;
    case 'info':
      return <Ionicons name="information-circle" {...iconProps} />;
    
    default:
      return <MaterialIcons name="help" {...iconProps} />;
  }
};

export function Icon({ name, size = 20, color }: Props) {
  const { theme } = useTheme();
  const iconColor = color || theme.colors.text;

  return getVectorIcon(name, size, iconColor);
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});