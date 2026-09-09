import { useState, useEffect, useCallback } from 'react';
import { loadUnit, saveUnit } from '../services/storageService';
import { TemperatureUnit } from '../types';

export function useUnit() {
  const [unit, setUnit] = useState<TemperatureUnit>('F');

  useEffect(() => {
    loadUnit().then(setUnit);
  }, []);

  const toggleUnit = useCallback(async () => {
    const next: TemperatureUnit = unit === 'F' ? 'C' : 'F';
    setUnit(next);
    await saveUnit(next);
  }, [unit]);

  return { unit, toggleUnit };
}
