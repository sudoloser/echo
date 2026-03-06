import React from 'react';
import { Tabs } from 'expo-router';
import { Music, Settings } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { useAppSettings } from '@/context/AppSettingsContext';

export default function TabLayout() {
  const { colorScheme } = useAppSettings();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Editor',
          tabBarIcon: ({ color }) => <Music color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
