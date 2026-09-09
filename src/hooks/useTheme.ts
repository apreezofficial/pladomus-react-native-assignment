import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, lightTheme, darkTheme } from '../theme';

const THEME_KEY = '@weather_app/theme_mode';

type ThemeMode = 'auto' | 'light' | 'dark';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // Load saved theme mode
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved) {
        setThemeMode(saved as ThemeMode);
      }
    });
  }, []);

  // Update theme when mode or system preference changes
  useEffect(() => {
    const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');
    setTheme(isDark ? darkTheme : lightTheme);
  }, [themeMode, systemColorScheme]);

  const toggleTheme = useCallback(async () => {
    const modes: ThemeMode[] = ['auto', 'light', 'dark'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    setThemeMode(nextMode);
    await AsyncStorage.setItem(THEME_KEY, nextMode);
  }, [themeMode]);

  const getThemeModeLabel = useCallback(() => {
    switch (themeMode) {
      case 'auto': return '🌓 Auto';
      case 'light': return '☀️ Light';
      case 'dark': return '🌙 Dark';
      default: return '🌓 Auto';
    }
  }, [themeMode]);

  return {
    theme,
    themeMode,
    toggleTheme,
    getThemeModeLabel,
  };
}