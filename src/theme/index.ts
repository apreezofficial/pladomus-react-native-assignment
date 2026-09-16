export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    accent: string;
    border: string;
    dot: {
      orange: string;
      gray: string;
      blue: string;
      green: string;
      purple: string;
    };
    weather: {
      sunny: string;
      cloudy: string;
      rainy: string;
      snowy: string;
      stormy: string;
    };
  };
}

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#EEF4FF',
    surface: 'rgba(255,255,255,0.72)',
    card: 'rgba(255,255,255,0.8)',
    text: '#111827',
    textSecondary: '#52607A',
    primary: '#4F46E5',
    accent: '#F97316',
    border: 'rgba(148,163,184,0.28)',
    dot: {
      orange: '#F59E0B',
      gray: '#94A3B8',
      blue: '#60A5FA',
      green: '#34D399',
      purple: '#A78BFA',
    },
    weather: {
      sunny: '#FBBF24',
      cloudy: '#94A3B8',
      rainy: '#3B82F6',
      snowy: '#A5B4FC',
      stormy: '#7C3AED',
    },
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#07111F',
    surface: 'rgba(15,23,42,0.82)',
    card: 'rgba(15,23,42,0.9)',
    text: '#E5EEF9',
    textSecondary: '#A7B6CC',
    primary: '#7C9BFF',
    accent: '#F59E0B',
    border: 'rgba(148,163,184,0.22)',
    dot: {
      orange: '#FBBF24',
      gray: '#C4CBD5',
      blue: '#7DD3FC',
      green: '#6EE7B7',
      purple: '#C4B5FD',
    },
    weather: {
      sunny: '#FBBF24',
      cloudy: '#CBD5E1',
      rainy: '#60A5FA',
      snowy: '#BFDBFE',
      stormy: '#A78BFA',
    },
  },
};

export const DOT_COLORS_LIGHT = ['#F5A623', '#9B9B9B', '#4A90E2', '#50C878', '#9B59B6'];
export const DOT_COLORS_DARK = ['#FFB347', '#B8BCC8', '#6BB6FF', '#72D897', '#B784D4'];