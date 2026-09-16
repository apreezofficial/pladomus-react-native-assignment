import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, City } from '../types';
import { useCities } from '../hooks/useCities';
import { useUnit } from '../hooks/useUnit';
import { useTheme } from '../hooks/useTheme';
import { fetchWeather, formatTemp } from '../services/weatherService';
import { DOT_COLORS_LIGHT, DOT_COLORS_DARK } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SavedCities'>;

type TempState = 'loading' | 'error' | number;

interface CityWithTemp extends City {
  temperature: TempState;
}

const ItemSeparator = ({ theme }: { theme: any }) => (
  <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
);

const AnimatedCityRow = ({
  item,
  index,
  onPress,
  onDelete,
  temperature,
  unit,
  theme,
}: {
  item: CityWithTemp;
  index: number;
  onPress: () => void;
  onDelete: () => void;
  temperature: TempState;
  unit: 'C' | 'F';
  theme: any;
}) => {
  // useRef so these values persist across re-renders instead of being
  // recreated (and snapped back to their start value) every time the
  // parent re-renders, e.g. when temps finish loading.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dotColors = theme.isDark ? DOT_COLORS_DARK : DOT_COLORS_LIGHT;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTemp = () => {
    if (temperature === 'loading') {
      return <View style={[styles.shimmerTemp, { backgroundColor: theme.isDark ? '#2B3343' : '#E7EBF3' }]} />;
    }
    if (temperature === 'error') {
      return (
        <Text style={[styles.cityTempError, { color: theme.colors.textSecondary }]}>
          --
        </Text>
      );
    }
    return (
      <Text style={[styles.cityTemp, { color: theme.colors.accent }]}>
        {formatTemp(temperature, unit)}
      </Text>
    );
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}>
      <TouchableOpacity
        style={[styles.cityRow, { backgroundColor: theme.colors.surface }]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityLabel={`View weather for ${item.name}`}>
        <View style={styles.cityLeft}>
          {item.isCurrentLocation ? (
            <View style={[styles.locationIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.locationIconText}>📍</Text>
            </View>
          ) : (
            <View
              style={[styles.dot, { backgroundColor: dotColors[index % dotColors.length] }]}
            />
          )}
          <Text style={[styles.cityName, { color: theme.colors.text }]}>{item.name}</Text>
        </View>

        <View style={styles.cityRight}>
          {renderTemp()}
          {/* Visible delete affordance — long-press still works, but this
              makes the action discoverable without relying on it. */}
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.deleteBtn}
            accessibilityLabel={`Remove ${item.name}`}>
            <Text style={[styles.deleteBtnText, { color: theme.colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export function SavedCitiesScreen() {
  const navigation = useNavigation<Nav>();
  const { cities, loading, removeCity, reload } = useCities();
  const { unit } = useUnit();
  const { theme } = useTheme();
  const [temps, setTemps] = useState<Record<string, TempState>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [sortByTemp, setSortByTemp] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const fetchAllTemps = useCallback(async (cityList: City[]) => {
    // Mark all as loading up front so a re-fetch doesn't leave stale
    // numbers next to a spinner-less "loading forever" state.
    setTemps(prev => {
      const next = { ...prev };
      cityList.forEach(c => {
        next[c.id] = 'loading';
      });
      return next;
    });

    const entries = await Promise.allSettled(
      cityList.map(city => fetchWeather(city.latitude, city.longitude)),
    );
    setTemps(prev => {
      const next = { ...prev };
      entries.forEach((result, i) => {
        next[cityList[i].id] =
          result.status === 'fulfilled' ? result.value.temperature : 'error';
      });
      return next;
    });
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
    temperature: temps[c.id] ?? 'loading',
  }));

  const displayList = sortByTemp
    ? [...citiesWithTemp].sort((a, b) => {
        const aNum = typeof a.temperature === 'number' ? a.temperature : -Infinity;
        const bNum = typeof b.temperature === 'number' ? b.temperature : -Infinity;
        return bNum - aNum;
      })
    : citiesWithTemp;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
        ]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Saved cities</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              { backgroundColor: theme.colors.background },
              sortByTemp && [styles.sortBtnActive, { backgroundColor: theme.colors.primary }],
            ]}
            onPress={() => setSortByTemp(v => !v)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.sortBtnText,
                { color: theme.colors.textSecondary },
                sortByTemp && styles.sortBtnTextActive,
              ]}>
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
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {loading && cities.length === 0 ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2].map(item => (
            <View
              key={item}
              style={[
                styles.skeletonRow,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}>
              <View style={[styles.skeletonCircle, { backgroundColor: theme.isDark ? '#2B3343' : '#E7EBF3' }]} />
              <View style={styles.skeletonTextBlock}>
                <View style={[styles.skeletonLine, { backgroundColor: theme.isDark ? '#2B3343' : '#E7EBF3' }]} />
                <View style={[styles.skeletonLineSmall, { backgroundColor: theme.isDark ? '#2B3343' : '#E7EBF3' }]} />
              </View>
              <View style={[styles.skeletonTemp, { backgroundColor: theme.isDark ? '#2B3343' : '#E7EBF3' }]} />
            </View>
          ))}
        </View>
      ) : cities.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏙️</Text>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>No cities saved yet</Text>
          <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
            Tap the + button above to add your first city
          </Text>
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
            keyExtractor={item => item.id}
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
                onDelete={() => handleDelete(item)}
                temperature={item.temperature}
                unit={unit}
                theme={theme}
              />
            )}
            ItemSeparatorComponent={() => <ItemSeparator theme={theme} />}
          />
        </View>
      )}
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
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sortBtnActive: {},
  sortBtnText: { fontSize: 12, fontWeight: '600' },
  sortBtnTextActive: { color: '#FFF' },
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
  addBtnText: { color: '#FFFFFF', fontSize: 24, lineHeight: 28, fontWeight: '700' },
  divider: { height: 1 },
  shimmerTemp: {
    width: 46,
    height: 18,
    borderRadius: 9,
  },
  skeletonList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  skeletonCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  skeletonTextBlock: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    width: '70%',
    height: 14,
    borderRadius: 7,
  },
  skeletonLineSmall: {
    width: '45%',
    height: 10,
    borderRadius: 5,
  },
  skeletonTemp: {
    width: 46,
    height: 18,
    borderRadius: 9,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 4 },
  emptyText: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  emptySubText: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
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
  emptyAddBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  list: { marginTop: 16, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  listContent: { paddingVertical: 4 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cityLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cityRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  locationIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIconText: { fontSize: 10, lineHeight: 16 },
  cityName: { fontSize: 16, fontWeight: '600' },
  cityTemp: { fontSize: 15, fontWeight: '500' },
  cityTempError: { fontSize: 15, fontWeight: '500' },
  deleteBtn: { padding: 2 },
  deleteBtnText: { fontSize: 14, fontWeight: '600' },
  separator: { height: 1, marginLeft: 38 },
});