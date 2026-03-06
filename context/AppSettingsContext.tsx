import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface AppSettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userAgent: string;
  setUserAgent: (ua: string) => void;
  colorScheme: 'light' | 'dark';
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useNativeColorScheme() ?? 'light';
  const [theme, setTheme] = useState<Theme>('system');
  const [userAgent, setUserAgent] = useState('Echo Lyric Editor (https://github.com/sudoloser/echo)');

  const colorScheme = theme === 'system' ? systemColorScheme : theme;

  return (
    <AppSettingsContext.Provider value={{ theme, setTheme, userAgent, setUserAgent, colorScheme }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
