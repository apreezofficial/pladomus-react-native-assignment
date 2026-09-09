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
    background: '#F0F2F8',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#666666',
    primary: '#3D5AFE',
    accent: '#E07B39',
    border: '#E8EAF0',
    dot: {
      orange: '#F5A623',
      gray: '#9B9B9B',
      blue: '#4A90E2',
      green: '#50C878',
      purple: '#9B59B6',
    },
    weather: {
      sunny: '#F5A623',
      cloudy: '#9B9B9B',
      rainy: '#4A90E2',
      snowy: '#B0C4DE',
      stormy: '#7B68EE',
    },
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#0F1419',
    surface: '#1A1F2E',
    card: '#252A38',
    text: '#E8EAF0',
    textSecondary: '#9CA3AF',
    primary: '#5B73FF',
    accent: '#FF8A4A',
    border: '#2A2F3E',
    dot: {
      orange: '#FFB347',
      gray: '#B8BCC8',
      blue: '#6BB6FF',
      green: '#72D897',
      purple: '#B784D4',
    },
    weather: {
      sunny: '#FFB347',
      cloudy: '#B8BCC8',
      rainy: '#6BB6FF',
      snowy: '#C8D8E8',
      stormy: '#A888FF',
    },
  },
};

export const DOT_COLORS_LIGHT = ['#F5A623', '#9B9B9B', '#4A90E2', '#50C878', '#9B59B6'];
export const DOT_COLORS_DARK = ['#FFB347', '#B8BCC8', '#6BB6FF', '#72D897', '#B784D4'];