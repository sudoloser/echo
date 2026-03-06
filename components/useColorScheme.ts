import { useAppSettings } from '@/context/AppSettingsContext';

export const useColorScheme = () => {
  try {
    const { colorScheme } = useAppSettings();
    return colorScheme;
  } catch (e) {
    // Fallback if context is not available (e.g. outside Provider)
    return 'light';
  }
};
