import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme } from '../theme';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // Always follow system theme automatically
  useEffect(() => {
    const isDark = systemColorScheme === 'dark';
    setTheme(isDark ? darkTheme : lightTheme);
  }, [systemColorScheme]);

  return {
    theme,
  };
}