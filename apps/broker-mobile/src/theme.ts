import { ViewStyle } from 'react-native';

export const colors = {
  primary: '#1d4ed8',
  primaryLight: '#eff6ff',
  dark: '#0a1628',
  text: '#0f172a',
  textSub: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  bg: '#f8fafc',
  bgCard: '#ffffff',
  success: '#059669',
  successLight: '#ecfdf5',
  warning: '#d97706',
  warningLight: '#fffbeb',
  error: '#dc2626',
  errorLight: '#fef2f2',
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
};

export const shadow: Record<string, ViewStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  blue: {
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};
