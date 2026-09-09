import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from 'react-native-geolocation-service';
import { RootStackParamList } from '../types';
import { useWeather } from '../hooks/useWeather';
import { useUnit } from '../hooks/useUnit';
import { formatTemp } from '../services/weatherService';
import { WeatherIcon } from '../components/WeatherIcon';

type Nav = NativeStackNavigationProp<RootStackParamList, 'WeatherDetail'>;
type Route = RouteProp<RootStackParamList, 'WeatherDetail'>;

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Allow this app to access your location to show local weather.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  const auth = await Geolocation.requestAuthorization('whenInUse');
  return auth === 'granted';
}

export function WeatherDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { city, useCurrentLocation } = route.params;

  const { unit, toggleUnit } = useUnit();
  const { weather, loading, error, refresh } = useWeather(null, null);

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>(city?.name ?? 'My Location');
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const acquireCoords = useCallback(async () => {
    if (city) {
      setCoords({ lat: city.latitude, lon: city.longitude });
      setLocationName(city.name);
      return;
    }

    if (useCurrentLocation) {
      setLocationError(null);
      try {
        const granted = await requestLocationPermission();
        if (!granted) {
          setLocationError('Location permission denied.');
          return;
        }

        Geolocation.getCurrentPosition(
          position => {
            setCoords({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
            setLocationName('My Location');
          },
          err => {
            setLocationError(err.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } catch (e: any) {
        setLocationError(e?.message ?? 'Location error');
      }
    }
  }, [city, useCurrentLocation]);

  useEffect(() => {
    acquireCoords();
  }, [acquireCoords]);

  useEffect(() => {
    if (coords) {
      refresh(coords.lat, coords.lon);
    }
  }, [coords, refresh]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (coords) {
      await refresh(coords.lat, coords.lon);
    } else {
      await acquireCoords();
    }
    setRefreshing(false);
  }, [coords, refresh, acquireCoords]);

  const renderContent = () => {
    if (locationError) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={acquireCoords}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading || (!weather && !error)) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3D5AFE" />
          <Text style={styles.loadingText}>Loading weather…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => coords && refresh(coords.lat, coords.lon)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!weather) return null;

    // Build feels-like display without redundant unit symbol
    const feelsStr = unit === 'F'
      ? `${Math.round((weather.feelsLike * 9) / 5 + 32)}°`
      : `${weather.feelsLike}°`;

    return (
      <View style={styles.weatherContent}>
        <WeatherIcon conditionCode={weather.conditionCode} size={100} />

        <Text style={styles.temperature}>
          {formatTemp(weather.temperature, unit)}
        </Text>

        <Text style={styles.condition}>
          {weather.condition}, feels like {feelsStr}
        </Text>

        <View style={styles.tiles}>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>{weather.humidity}%</Text>
            <Text style={styles.tileLabel}>Humidity</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>{weather.windSpeed} mph</Text>
            <Text style={styles.tileLabel}>Wind</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {locationName}
        </Text>
        <TouchableOpacity
          onPress={toggleUnit}
          style={styles.unitBtn}
          accessibilityLabel={`Switch to ${unit === 'F' ? 'Celsius' : 'Fahrenheit'}`}>
          <Text style={styles.unitBtnText}>{unit === 'F' ? '°C' : '°F'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3D5AFE"
          />
        }>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 4,
    minWidth: 36,
  },
  backArrow: {
    fontSize: 20,
    color: '#E07B39',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  unitBtn: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
  unitBtnText: {
    fontSize: 16,
    color: '#3D5AFE',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAF0',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 300,
  },
  loadingText: {
    fontSize: 15,
    color: '#888',
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#D32F2F',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#3D5AFE',
    borderRadius: 10,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  weatherContent: {
    alignItems: 'center',
    gap: 12,
  },
  temperature: {
    fontSize: 56,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 16,
  },
  condition: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tiles: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    width: '100%',
  },
  tile: {
    flex: 1,
    backgroundColor: '#EEF1FB',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
  },
  tileValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  tileLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
});
