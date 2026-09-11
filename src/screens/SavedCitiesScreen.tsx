import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, City } from '../types';
import { useCities } from '../hooks/useCities';
import { useUnit } from '../hooks/useUnit';
import { useTheme } from '../hooks/useTheme';
import { fetchWeather, formatTemp } from '../services/weatherService';
import { DOT_COLORS_LIGHT, DOT_COLORS_DARK } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SavedCities'>;

interface CityWithTemp extends City {
  temperature: number | null;
}

// Move separator component outside render to avoid re-creation
const ItemSeparator = ({ theme }: { theme: any }) => (
  <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
);

// Animated City Row Component
const AnimatedCityRow = ({ 
  item, 
  index, 
  onPress, 
  onLongPress, 
  temperature,
  unit,
  theme,
}: {
  item: CityWithTemp;
  index: number;
  onPress: () => void;
  onLongPress: () => void;
  temperature: number | null;
  unit: 'C' | 'F';
  theme: any;
}) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const dotColors = theme.isDark ? DOT_COLORS_DARK : DOT_COLORS_LIGHT;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, // Stagger animation
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}>
      <TouchableOpacity
        style={[styles.cityRow, { backgroundColor: theme.colors.surface }]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
        accessibilityLabel={`View weather for ${item.name}`}
        accessibilityHint="Long press to remove">
        <View style={styles.cityLeft}>
          {item.isCurrentLocation ? (
            <Animated.View
              style={[
                styles.locationIcon,
                { 
                  backgroundColor: theme.colors.primary,
                  transform: [{ scale: fadeAnim }],
                },
              ]}>
              <Text style={styles.locationIconText}>📍</Text>
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.dot,
                { 
                  backgroundColor: dotColors[index % dotColors.length],
                  transform: [{ scale: fadeAnim }],
                },
              ]}
            />
          )}
          <Text style={[styles.cityName, { color: theme.colors.text }]}>{item.name}</Text>
        </View>
        <Text style={[styles.cityTemp, { color: theme.colors.accent }]}>
          {temperature !== null ? formatTemp(temperature, unit) : '…'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export function SavedCitiesScreen() {
  const navigation = useNavigation<Nav>();
  const { cities, loading, removeCity, reload } = useCities();
  const { unit } = useUnit();
  const { theme, toggleTheme, getThemeModeLabel } = useTheme();
  const [temps, setTemps] = useState<Record<string, number | null>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [sortByTemp, setSortByTemp] = useState(false);

  // Reload list whenever screen comes into focus (after adding a city)
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  // Fetch temperatures for all cities
  const fetchAllTemps = useCallback(async (cityList: City[]) => {
    const entries = await Promise.allSettled(
      cityList.map(city => fetchWeather(city.latitude, city.longitude)),
    );
    const map: Record<string, number | null> = {};
    entries.forEach((result, i) => {
      map[cityList[i].id] =
        result.status === 'fulfilled' ? result.value.temperature : null;
    });
    setTemps(map);
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      fetchAllTemps(cities);
    }
  }, [cities, fetchAllTemps]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const handleDelete = (city: City) => {
    Alert.alert('Remove city', `Remove ${city.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeCity(city.id),
      },
    ]);
  };

  const citiesWithTemp: CityWithTemp[] = cities.map(c => ({
    ...c,
    temperature: temps[c.id] ?? null,
  }));

  const displayList = sortByTemp
    ? [...citiesWithTemp].sort((a, b) => {
        if (a.temperature === null) return 1;
        if (b.temperature === null) return -1;
        return b.temperature - a.temperature;
      })
    : citiesWithTemp;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated Header */}
      <View 
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          }
        ]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Saved cities</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.8}>
            <Text style={[styles.themeBtnText, { color: theme.colors.text }]}>
              {getThemeModeLabel()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortByTemp && { backgroundColor: theme.colors.primary }]}
            onPress={() => setSortByTemp(v => !v)}
            activeOpacity={0.8}>
            <Text style={[styles.sortBtnText, sortByTemp && styles.sortBtnTextActive]}>
              {sortByTemp ? '↕ Temp' : '↕ Sort'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddCity')}
            accessibilityLabel="Add city"
            activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {loading && cities.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
      ) : cities.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>No cities saved yet</Text>
          <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>Tap the + button above to add your first city</Text>
          <TouchableOpacity
            style={[styles.emptyAddBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddCity')}
            activeOpacity={0.8}>
            <Text style={styles.emptyAddBtnText}>+ Add City</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.list, { backgroundColor: theme.colors.card }]}>
          <FlatList
            data={displayList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            renderItem={({ item, index }) => (
              <AnimatedCityRow
                item={item}
                index={index}
                onPress={() => navigation.navigate('WeatherDetail', { city: item })}
                onLongPress={() => handleDelete(item)}
                temperature={temps[item.id] ?? null}
                unit={unit}
                theme={theme}
              />
            )}
            ItemSeparatorComponent={() => <ItemSeparator theme={theme} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  themeBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F0F2F8',
  },
  sortBtnActive: {
    backgroundColor: '#3D5AFE',
  },
  sortBtnText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sortBtnTextActive: {
    color: '#FFF',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAddBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listContent: {
    paddingVertical: 4,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIconText: {
    fontSize: 10,
    lineHeight: 16,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityTemp: {
    fontSize: 15,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginLeft: 38,
  },
});
