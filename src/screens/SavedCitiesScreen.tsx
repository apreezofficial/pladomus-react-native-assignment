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
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, City } from '../types';
import { useCities } from '../hooks/useCities';
import { useUnit } from '../hooks/useUnit';
import { fetchWeather, formatTemp } from '../services/weatherService';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SavedCities'>;

// Assign a deterministic dot color based on city index
const DOT_COLORS = ['#F5A623', '#9B9B9B', '#4A90E2', '#50C878', '#9B59B6'];

interface CityWithTemp extends City {
  temperature: number | null;
}

export function SavedCitiesScreen() {
  const navigation = useNavigation<Nav>();
  const { cities, loading, removeCity, reload } = useCities();
  const { unit } = useUnit();
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved cities</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.sortBtn, sortByTemp && styles.sortBtnActive]}
            onPress={() => setSortByTemp(v => !v)}>
            <Text style={[styles.sortBtnText, sortByTemp && styles.sortBtnTextActive]}>
              {sortByTemp ? '↕ Temp' : '↕ Sort'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddCity')}
            accessibilityLabel="Add city">
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {loading && cities.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#3D5AFE" />
      ) : cities.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No cities saved yet.</Text>
          <Text style={styles.emptySubText}>Tap + to add your first city.</Text>
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3D5AFE"
            />
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.cityRow}
              onPress={() => navigation.navigate('WeatherDetail', { city: item })}
              onLongPress={() => handleDelete(item)}
              accessibilityLabel={`View weather for ${item.name}`}
              accessibilityHint="Long press to remove">
              <View style={styles.cityLeft}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: DOT_COLORS[index % DOT_COLORS.length] },
                  ]}
                />
                <Text style={styles.cityName}>{item.name}</Text>
              </View>
              <Text style={styles.cityTemp}>
                {item.id in temps
                  ? temps[item.id] !== null
                    ? formatTemp(temps[item.id]!, unit)
                    : '—'
                  : '…'}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3D5AFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAF0',
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
  },
  list: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
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
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  cityTemp: {
    fontSize: 15,
    color: '#E07B39',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F2F8',
    marginLeft: 38,
  },
});
