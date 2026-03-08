import { ACCENT_COLORS, AccentKey, CustomTheme } from '@/constants/Theme';

/**
 * Generates the theme color palette based on the selected accent and custom theme settings.
 */
export const getThemeColors = (accentKey: AccentKey = 'slate', customTheme?: CustomTheme) => {
  // Determine the primary tint color
  const tintColor = (accentKey === 'custom' && customTheme) 
    ? customTheme.tint?.slice(0, 7) 
    : (ACCENT_COLORS[accentKey as keyof typeof ACCENT_COLORS] || ACCENT_COLORS.slate);

  // Check if we are using a "Full Custom Theme" (background/text modified) 
  // or just a "Custom Accent" (only tint modified, or defaults preserved).
  const isFullCustom = accentKey === 'custom' && customTheme && (
    (customTheme.background && customTheme.background !== '#ffffff' && customTheme.background !== '#020617') || 
    (customTheme.text && customTheme.text !== '#000000' && customTheme.text !== '#f8fafc')
  );

  if (isFullCustom && customTheme) {
    const safeSecondary = customTheme.secondaryText?.slice(0, 7) || '#666666';
    const safeTint = customTheme.tint?.slice(0, 7) || '#0f172a';
    const safeText = customTheme.text?.slice(0, 7) || '#000000';
    const safeBackground = customTheme.background?.slice(0, 7) || '#ffffff';

    const themeColors = {
      text: safeText,
      background: safeBackground,
      tint: safeTint,
      tabIconDefault: safeSecondary,
      tabIconSelected: safeTint,
      border: safeSecondary + '33', // 20% opacity
      secondaryText: safeSecondary,
    };
    return {
      light: themeColors,
      dark: themeColors,
    };
  }

  // Standard themes with dynamic accent support
  return {
    light: {
      text: '#0f172a',
      background: '#ffffff',
      tint: tintColor,
      tabIconDefault: '#94a3b8',
      tabIconSelected: tintColor,
      border: '#e2e8f0', // Slate 200
      secondaryText: '#64748b', // Slate 500
    },
    dark: {
      text: '#f8fafc',
      background: '#020617', // Slate 950
      // For the default 'slate' accent in dark mode, we prefer white text/tint
      tint: (accentKey === 'slate' && tintColor === ACCENT_COLORS.slate) ? '#f8fafc' : tintColor,
      tabIconDefault: '#475569',
      tabIconSelected: (accentKey === 'slate' && tintColor === ACCENT_COLORS.slate) ? '#f8fafc' : tintColor,
      border: '#1e293b', // Slate 800
      secondaryText: '#94a3b8', // Slate 400
    },
  };
};
