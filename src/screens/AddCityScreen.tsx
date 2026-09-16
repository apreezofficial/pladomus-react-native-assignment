import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from 'react-native-geolocation-service';
import { RootStackParamList } from '../types';
import { geocodeCity } from '../services/weatherService';
import { useCities } from '../hooks/useCities';
import { useTheme } from '../hooks/useTheme';
import { saveCurrentLocation } from '../services/storageService';
import { Icon } from '../components/Icon';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddCity'>;

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location to show local weather.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  const auth = await Geolocation.requestAuthorization('whenInUse');
  return auth === 'granted';
}

// Small helper for tactile press feedback — every tappable in this
// screen uses it so nothing feels dead on tap.
function PressableScale({
  onPress,
  disabled,
  style,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, disabled && { opacity: 0.6 }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AddCityScreen() {
  const navigation = useNavigation<Nav>();
  const { addCity, reload } = useCities();
  const { theme } = useTheme();
  const [cityInput, setCityInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const trimmedInput = cityInput.trim();
  const canAdd = trimmedInput.length > 0 && !adding && !locating;

  const handleAddCity = async () => {
    if (!trimmedInput) {
      inputRef.current?.focus();
      return;
    }
    setAdding(true);
    try {
      const result = await geocodeCity(trimmedInput);
      if (!result) {
        Alert.alert(
          'City not found',
          `Could not find "${trimmedInput}". Try a different spelling.`,
        );
        return;
      }
      await addCity({
        id: `${result.name}_${result.latitude}_${result.longitude}`,
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setAdding(false);
    }
  };

  const handleUseLocation = async () => {
    setLocating(true);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert(
          'Permission denied',
          'Location permission is needed to use your current location.',
        );
        return;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await saveCurrentLocation(latitude, longitude, 'My Location');
          await reload();
          navigation.navigate('WeatherDetail', { useCurrentLocation: true });
        },
        (error) => {
          Alert.alert('Location error', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (e: any) {
      Alert.alert('Location error', e?.message ?? 'Could not access location.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header — outside the card, gives the screen room to breathe */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}
            activeOpacity={0.8}>
            <Icon name="back" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>Add a city</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Search for a place or drop a pin on where you are
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          {/* City input with leading icon + clear affordance */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: theme.colors.accent }]}>City name</Text>
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor: cityInput ? theme.colors.primary : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}>
              <Icon name="search" size={16} color={theme.colors.textSecondary} />
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="e.g. Lisbon"
                placeholderTextColor={theme.colors.textSecondary}
                value={cityInput}
                onChangeText={setCityInput}
                onSubmitEditing={handleAddCity}
                returnKeyType="done"
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
                accessibilityLabel="City name input"
              />
              {cityInput.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCityInput('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Clear input">
                  <Icon name="close" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <PressableScale
            onPress={handleAddCity}
            disabled={!canAdd}
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}>
            {adding ? (
              <Text style={styles.addBtnText}>Adding…</Text>
            )}
          </PressableScale>

          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.orPill, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.orText, { color: theme.colors.textSecondary }]}>OR</Text>
            </View>
            <View style={[styles.orLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <PressableScale
            onPress={handleUseLocation}
            disabled={adding || locating}
            style={[styles.locationBtn, { borderColor: theme.colors.border }]}>
            {locating ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Icon name="location" size={16} color={theme.colors.primary} />
                <Text style={[styles.locationBtnText, { color: theme.colors.text }]}>
                  Use my current location
                </Text>
              </>
            )}
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  inputSection: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 20,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  orText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 15,
  },
  locationBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});