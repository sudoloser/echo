import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

export const ACCENT_COLORS = {
  slate: '#0f172a',
  indigo: '#4f46e5',
  rose: '#e11d48',
  amber: '#d97706',
  emerald: '#059669',
  violet: '#7c3aed',
};

export type AccentKey = keyof typeof ACCENT_COLORS;

interface AppSettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentKey: AccentKey;
  setAccentKey: (key: AccentKey) => void;
  userAgent: string;
  setUserAgent: (ua: string) => void;
  pauseOnEnd: boolean;
  setPauseOnEnd: (value: boolean) => void;
  rewindAmount: number;
  setRewindAmount: (value: number) => void;
  solverUrl: string;
  setSolverUrl: (url: string) => void;
  solverKey: string;
  setSolverKey: (key: string) => void;
  colorScheme: 'light' | 'dark';
  isInitialized: boolean;
}

const STORAGE_KEYS = {
  THEME: '@echo_settings_theme',
  ACCENT: '@echo_settings_accent',
  USER_AGENT: '@echo_settings_user_agent',
  PAUSE_ON_END: '@echo_settings_pause_on_end',
  REWIND_AMOUNT: '@echo_settings_rewind_amount',
  SOLVER_URL: '@echo_settings_solver_url',
  SOLVER_KEY: '@echo_settings_solver_key',
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

// Default values that can be "injected" at build time via environment variables
// Use process.env for web/build-time injection
const DEFAULT_SOLVER_URL = process.env.EXPO_PUBLIC_SOLVER_URL || '';
const DEFAULT_SOLVER_KEY = process.env.EXPO_PUBLIC_SOLVER_KEY || '';

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useNativeColorScheme() ?? 'light';
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setThemeState] = useState<Theme>('system');
  const [accentKey, setAccentKeyState] = useState<AccentKey>('slate');
  const [userAgent, setUserAgentState] = useState('Echo Lyric Editor (https://github.com/sudoloser/echo)');
  const [pauseOnEnd, setPauseOnEndState] = useState(true);
  const [rewindAmount, setRewindAmountState] = useState(1.5);
  const [solverUrl, setSolverUrlState] = useState(DEFAULT_SOLVER_URL);
  const [solverKey, setSolverKeyState] = useState(DEFAULT_SOLVER_KEY);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedTheme, savedAccent, savedUA, savedPause, savedRewind, savedSolver, savedKey] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.ACCENT),
          AsyncStorage.getItem(STORAGE_KEYS.USER_AGENT),
          AsyncStorage.getItem(STORAGE_KEYS.PAUSE_ON_END),
          AsyncStorage.getItem(STORAGE_KEYS.REWIND_AMOUNT),
          AsyncStorage.getItem(STORAGE_KEYS.SOLVER_URL),
          AsyncStorage.getItem(STORAGE_KEYS.SOLVER_KEY),
        ]);

        if (savedTheme) setThemeState(savedTheme as Theme);
        if (savedAccent) setAccentKeyState(savedAccent as AccentKey);
        if (savedUA) setUserAgentState(savedUA);
        if (savedPause) setPauseOnEndState(savedPause === 'true');
        if (savedSolver) setSolverUrlState(savedSolver);
        if (savedKey) setSolverKeyState(savedKey);
        if (savedRewind) {
          const val = parseFloat(savedRewind);
          if (!isNaN(val)) setRewindAmountState(val);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, []);

  // Persistent Setters
  const setTheme = async (value: Theme) => {
    setThemeState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, value);
  };

  const setAccentKey = async (value: AccentKey) => {
    setAccentKeyState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCENT, value);
  };

  const setUserAgent = async (value: string) => {
    setUserAgentState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_AGENT, value);
  };

  const setPauseOnEnd = async (value: boolean) => {
    setPauseOnEndState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.PAUSE_ON_END, value.toString());
  };

  const setRewindAmount = async (value: number) => {
    setRewindAmountState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.REWIND_AMOUNT, value.toString());
  };

  const setSolverUrl = async (value: string) => {
    setSolverUrlState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.SOLVER_URL, value);
  };

  const setSolverKey = async (value: string) => {
    setSolverKeyState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.SOLVER_KEY, value);
  };

  const colorScheme = theme === 'system' ? systemColorScheme : theme;

  return (
    <AppSettingsContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        accentKey,
        setAccentKey,
        userAgent, 
        setUserAgent, 
        pauseOnEnd, 
        setPauseOnEnd, 
        rewindAmount,
        setRewindAmount,
        solverUrl,
        setSolverUrl,
        solverKey,
        setSolverKey,
        colorScheme,
        isInitialized
      }}
    >
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
