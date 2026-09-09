import React, { useState, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from 'react-native-geolocation-service';
import { RootStackParamList } from '../types';
import { geocodeCity } from '../services/weatherService';
import { useCities } from '../hooks/useCities';

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
  const { addCity } = useCities();
  const [cityInput, setCityInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [locating, setLocating] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      navigation.navigate('WeatherDetail', { useCurrentLocation: true });
    } catch (e: any) {
      Alert.alert('Location error', e?.message ?? 'Could not access location.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View 
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            style={styles.backBtn}
            activeOpacity={0.8}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add city</Text>
        </View>

        <View style={styles.divider} />

        {/* City name input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>City name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lisbon"
            placeholderTextColor="#BBBBBB"
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
          style={[styles.addBtn, (adding || locating) && styles.btnDisabled]}
          onPress={handleAddCity}
          disabled={adding || locating}
          accessibilityLabel="Add city"
          activeOpacity={0.8}>
          {adding ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.addBtnText}>Add city</Text>
          )}
        </TouchableOpacity>

        {/* Divider with "or" */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>

        {/* Use my location button */}
        <TouchableOpacity
          style={[styles.locationBtn, (adding || locating) && styles.btnDisabled]}
          onPress={handleUseLocation}
          disabled={adding || locating}
          accessibilityLabel="Use my current location"
          activeOpacity={0.8}>
          {locating ? (
            <ActivityIndicator color="#3D5AFE" />
          ) : (
            <Text style={styles.locationBtnText}>Use my current location</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F8',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
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
  backArrow: {
    fontSize: 20,
    color: '#E07B39',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F8',
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#E07B39',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A2E',
    backgroundColor: '#FAFAFA',
  },
  addBtn: {
    backgroundColor: '#3D5AFE',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
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
    backgroundColor: '#E0E0E0',
  },
  orText: {
    color: '#999',
    fontSize: 13,
  },
  locationBtn: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  locationBtnText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '600',
  },
});
