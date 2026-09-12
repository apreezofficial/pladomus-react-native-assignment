import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  PermissionsAndroid,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from 'react-native-geolocation-service';
import { RootStackParamList } from '../types';
import { useWeather } from '../hooks/useWeather';
import { useUnit } from '../hooks/useUnit';
import { formatTemp } from '../services/weatherService';
import { LottieWeatherIcon } from '../components/LottieWeatherIcon';
import { LoadingAnimation } from '../components/LoadingAnimation';
import { Icon } from '../components/Icon';
import { useTheme } from '../hooks/useTheme';

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
  const { theme } = useTheme();

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>(city?.name ?? 'My Location');
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // useRef — these must persist across renders. Recreating them (the old
  // way, with `new Animated.Value(...)` directly in the component body)
  // meant any re-render — including a unit toggle, which doesn't change
  // `weather` — swapped in a fresh, un-animated Value and made the whole
  // weather card flash invisible.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const hasAnimatedIn = useRef(false);

  const acquireCoords = useCallback(async () => {
    if (city) {
      const cityCoords = { lat: city.latitude, lon: city.longitude };
      setCoords(cityCoords);
      setLocationName(city.name);
      setLocationError(null);
      refresh(cityCoords.lat, cityCoords.lon);
      setInitialLoadComplete(true);
      return;
    }

    if (useCurrentLocation) {
      setLocationError(null);
      try {
        const granted = await requestLocationPermission();
        if (!granted) {
          setLocationError('Location permission denied.');
          setInitialLoadComplete(true);
          return;
        }

        Geolocation.getCurrentPosition(
          position => {
            const currentCoords = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            setCoords(currentCoords);
            setLocationName('My Location');
            refresh(currentCoords.lat, currentCoords.lon);
            setInitialLoadComplete(true);
          },
          err => {
            setLocationError(err.message);
            setInitialLoadComplete(true);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } catch (e: any) {
        setLocationError(e?.message ?? 'Location error');
        setInitialLoadComplete(true);
      }
    }
  }, [city, useCurrentLocation, refresh]);

  useEffect(() => {
    acquireCoords();
  }, [acquireCoords]);

  useEffect(() => {
    // Only play the intro animation once per screen visit, not every
    // time `weather` gets a new object reference (e.g. pull-to-refresh).
    if (weather && initialLoadComplete && !hasAnimatedIn.current) {
      hasAnimatedIn.current = true;
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [weather, initialLoadComplete, fadeAnim, scaleAnim, slideAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (coords) {
      await refresh(coords.lat, coords.lon);
    } else {
      await acquireCoords();
    }
    setRefreshing(false);
  }, [coords, refresh, acquireCoords]);

  const handleRetry = () => {
    if (coords) {
      refresh(coords.lat, coords.lon);
    } else {
      acquireCoords();
    }
  };

  const renderContent = () => {
    if (locationError) {
      return (
        <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
          <Icon name="location" size={60} color={theme.colors.accent} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{locationError}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
            onPress={acquireCoords}>
            <Icon name="refresh" size={16} color="#FFF" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading || (!weather && !error && !locationError)) {
      return (
        <LoadingAnimation
          message={city ? `Loading weather for ${city.name}…` : 'Getting your location and weather…'}
        />
      );
    }

    if (error) {
      return (
        <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
          <Icon name="error" size={60} color={theme.colors.accent} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleRetry}>
            <Icon name="refresh" size={16} color="#FFF" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!weather) return null;

    const feelsStr =
      unit === 'F'
        ? `${Math.round((weather.feelsLike * 9) / 5 + 32)}°`
        : `${weather.feelsLike}°`;

    return (
      <Animated.View
        style={[
          styles.weatherContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}>
        <LottieWeatherIcon conditionCode={weather.conditionCode} size={120} />

        <Text style={[styles.temperature, { color: theme.colors.text }]}>
          {formatTemp(weather.temperature, unit)}
        </Text>

        <Text style={[styles.condition, { color: theme.colors.textSecondary }]}>
          {weather.condition}, feels like {feelsStr}
        </Text>

        <View style={styles.tiles}>
          <View style={[styles.tile, { backgroundColor: theme.colors.card }]}>
            <Icon name="humidity" size={24} color={theme.colors.primary} />
            <Text style={[styles.tileValue, { color: theme.colors.text }]}>{weather.humidity}%</Text>
            <Text style={[styles.tileLabel, { color: theme.colors.textSecondary }]}>Humidity</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: theme.colors.card }]}>
            <Icon name="windy" size={24} color={theme.colors.primary} />
            <Text style={[styles.tileValue, { color: theme.colors.text }]}>{weather.windSpeed} mph</Text>
            <Text style={[styles.tileLabel, { color: theme.colors.textSecondary }]}>Wind</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          activeOpacity={0.8}>
          <Icon name="back" size={20} color={theme.colors.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {locationName}
        </Text>
        <TouchableOpacity
          onPress={toggleUnit}
          style={styles.unitBtn}
          accessibilityLabel={`Switch to ${unit === 'F' ? 'Celsius' : 'Fahrenheit'}`}
          activeOpacity={0.8}>
          <Text style={[styles.unitBtnText, { color: theme.colors.primary }]}>
            {unit === 'F' ? '°C' : '°F'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, minWidth: 36, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  unitBtn: { minWidth: 36, alignItems: 'flex-end', padding: 4 },
  unitBtnText: { fontSize: 16, fontWeight: '600' },
  divider: { height: 1 },
  scrollContent: { flexGrow: 1, paddingTop: 48, paddingHorizontal: 24, paddingBottom: 40 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 300,
    paddingHorizontal: 24,
  },
  errorText: { fontSize: 16, textAlign: 'center', fontWeight: '500' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  weatherContent: { alignItems: 'center', gap: 16 },
  temperature: { fontSize: 64, fontWeight: '800', marginTop: 16 },
  condition: { fontSize: 17, textAlign: 'center', fontWeight: '500' },
  tiles: { flexDirection: 'row', gap: 16, marginTop: 32, width: '100%' },
  tile: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tileValue: { fontSize: 22, fontWeight: '700' },
  tileLabel: { fontSize: 13, fontWeight: '500' },
});