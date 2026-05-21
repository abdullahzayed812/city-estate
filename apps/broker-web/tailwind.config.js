/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1d4ed8',
        'primary-light': '#eff6ff',
        dark: '#0a1628',
        'text-main': '#0f172a',
        'text-sub': '#64748b',
        'text-muted': '#94a3b8',
        border: '#e2e8f0',
        bg: '#f8fafc',
        'bg-card': '#ffffff',
        success: '#059669',
        'success-light': '#ecfdf5',
        warning: '#d97706',
        'warning-light': '#fffbeb',
        error: '#dc2626',
        'error-light': '#fef2f2',
        purple: '#7c3aed',
        'purple-light': '#f5f3ff',
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        sm: '0 1px 4px rgba(0,0,0,0.04)',
        md: '0 2px 8px rgba(0,0,0,0.06)',
        lg: '0 4px 16px rgba(0,0,0,0.10)',
        blue: '0 6px 12px rgba(29,78,216,0.30)',
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
