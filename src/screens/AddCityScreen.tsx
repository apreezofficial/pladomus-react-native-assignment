import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
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
  // iOS — Geolocation.requestAuthorization handles it
  const auth = await Geolocation.requestAuthorization('whenInUse');
  return auth === 'granted';
}

export function AddCityScreen() {
  const navigation = useNavigation<Nav>();
  const { addCity, reload } = useCities();
  const { theme } = useTheme();
  const [cityInput, setCityInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleAddCity = async () => {
    const trimmed = cityInput.trim();
    if (!trimmed) {
      Alert.alert('Enter a city name');
      return;
    }
    setAdding(true);
    try {
      const result = await geocodeCity(trimmed);
      if (!result) {
        Alert.alert(
          'City not found',
          `Could not find "${trimmed}". Try a different spelling.`,
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
          
          // Save current location as a city
          await saveCurrentLocation(latitude, longitude, 'My Location');
          await reload(); // Refresh the cities list
          
          navigation.navigate('WeatherDetail', { useCurrentLocation: true });
        },
        (error) => {
          Alert.alert('Location error', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
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
        <View 
          style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.titleRow, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              style={styles.backBtn}
              activeOpacity={0.8}>
              <Icon name="back" size={20} color={theme.colors.accent} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>Add city</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* City name input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.colors.accent }]}>City name</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: theme.colors.border, 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text 
            }]}
            placeholder="e.g. Lisbon"
            placeholderTextColor={theme.colors.textSecondary}
            value={cityInput}
            onChangeText={setCityInput}
            onSubmitEditing={handleAddCity}
            returnKeyType="done"
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="City name input"
          />
        </View>

        {/* Add city button */}
        <TouchableOpacity
          style={[
            styles.addBtn, 
            { backgroundColor: theme.colors.primary }, 
            (adding || locating) && styles.btnDisabled
          ]}
          onPress={handleAddCity}
          disabled={adding || locating}
          accessibilityLabel="Add city"
          activeOpacity={0.8}>
          {adding ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="add" size={16} color="#FFF" />
              <Text style={styles.addBtnText}>Add city</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider with "or" */}
        <View style={styles.orRow}>
          <View style={[styles.orLine, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.orText, { color: theme.colors.textSecondary }]}>or</Text>
          <View style={[styles.orLine, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* Use my location button */}
        <TouchableOpacity
          style={[
            styles.locationBtn, 
            { borderColor: theme.colors.border }, 
            (adding || locating) && styles.btnDisabled
          ]}
          onPress={handleUseLocation}
          disabled={adding || locating}
          accessibilityLabel="Use my current location"
          activeOpacity={0.8}>
          {locating ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Icon name="location" size={16} color={theme.colors.primary} />
              <Text style={[styles.locationBtnText, { color: theme.colors.text }]}>Use my current location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
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
  orText: {
    fontSize: 13,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
  },
  locationBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
