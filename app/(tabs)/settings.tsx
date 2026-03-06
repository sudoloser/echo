import React from 'react';
import { StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Moon, Sun, Monitor } from 'lucide-react-native';

import { Text, View } from '@/components/Themed';
import { useAppSettings } from '@/context/AppSettingsContext';
import Colors from '@/constants/Colors';

export default function SettingsScreen() {
  const { theme, setTheme, userAgent, setUserAgent, colorScheme } = useAppSettings();
  const tintColor = Colors[colorScheme].tint;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeRow}>
          <ThemeButton
            label="Light"
            active={theme === 'light'}
            onPress={() => setTheme('light')}
            icon={<Sun size={20} color={theme === 'light' ? 'white' : tintColor} />}
            tintColor={tintColor}
          />
          <ThemeButton
            label="Dark"
            active={theme === 'dark'}
            onPress={() => setTheme('dark')}
            icon={<Moon size={20} color={theme === 'dark' ? 'white' : tintColor} />}
            tintColor={tintColor}
          />
          <ThemeButton
            label="System"
            active={theme === 'system'}
            onPress={() => setTheme('system')}
            icon={<Monitor size={20} color={theme === 'system' ? 'white' : tintColor} />}
            tintColor={tintColor}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LRCLIB Configuration</Text>
        <Text style={styles.label}>User-Agent</Text>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text, borderColor: tintColor }]}
          value={userAgent}
          onChangeText={setUserAgent}
          placeholder="Enter User-Agent"
          placeholderTextColor="#888"
        />
        <Text style={styles.hint}>
          LRCLIB requires a descriptive User-Agent. Include your app name and a contact link or
          email.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Echo</Text>
        <Text style={styles.aboutText}>
          Echo is a minimalist lyric editor for syncing and publishing lyrics to LRCLIB.
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

function ThemeButton({
  label,
  active,
  onPress,
  icon,
  tintColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  tintColor: string;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.themeButton,
        active && { backgroundColor: tintColor, borderColor: tintColor },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.themeButtonLabel, active && { color: 'white' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'transparent',
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  themeButtonLabel: {
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  version: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 10,
  },
});
