import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

export type LayoutSlot = 'editor' | 'player' | 'controls';

export interface LayoutConfig {
  slots: {
    editor: { visible: boolean; flex: number; minSize?: number };
    player: { visible: boolean; flex: number; minSize?: number };
    controls: { visible: boolean; flex: number; minSize?: number };
  };
  direction: 'column' | 'row';
  rightColumn?: 'vertical' | 'horizontal';
}

export const LAYOUT_PRESETS: Record<string, LayoutConfig> = {
  default: {
    slots: {
      editor: { visible: true, flex: 1, minSize: 200 },
      player: { visible: false, flex: 0 },
      controls: { visible: false, flex: 0 },
    },
    direction: 'column',
  },
  'side-by-side': {
    slots: {
      editor: { visible: true, flex: 50, minSize: 300 },
      player: { visible: true, flex: 30, minSize: 200 },
      controls: { visible: true, flex: 20, minSize: 150 },
    },
    direction: 'row',
    rightColumn: 'vertical',
  },
  'editor-focused': {
    slots: {
      editor: { visible: true, flex: 60, minSize: 400 },
      player: { visible: true, flex: 25, minSize: 150 },
      controls: { visible: true, flex: 15, minSize: 100 },
    },
    direction: 'row',
    rightColumn: 'vertical',
  },
  'player-focused': {
    slots: {
      editor: { visible: true, flex: 30, minSize: 200 },
      player: { visible: true, flex: 50, minSize: 300 },
      controls: { visible: true, flex: 20, minSize: 150 },
    },
    direction: 'row',
    rightColumn: 'vertical',
  },
};

export const DEFAULT_CUSTOM_LAYOUT: LayoutConfig = {
  slots: {
    editor: { visible: true, flex: 50, minSize: 300 },
    player: { visible: true, flex: 30, minSize: 200 },
    controls: { visible: true, flex: 20, minSize: 150 },
  },
  direction: 'row',
  rightColumn: 'vertical',
};

export interface LayoutSlots {
  editor: React.ReactNode;
  player: React.ReactNode;
  controls: React.ReactNode;
}

interface LayoutRendererProps {
  preset?: string;
  customConfig?: LayoutConfig;
  slots: LayoutSlots;
}

export function LayoutRenderer({ preset, customConfig, slots }: LayoutRendererProps) {
  const isCustom = preset === 'custom';
  const config = isCustom && customConfig ? customConfig : (LAYOUT_PRESETS[preset || 'default'] || LAYOUT_PRESETS.default);
  const isRow = config.direction === 'row';

  if (isRow && config.rightColumn === 'vertical') {
    return (
      <View style={styles.rowContainer}>
        <View style={[styles.slot, { flex: config.slots.editor.flex, minWidth: config.slots.editor.minSize || 0 }]}>
          {slots.editor}
        </View>
        <View style={styles.columnContainer}>
          {config.slots.player.visible && (
            <View style={[styles.slot, { flex: config.slots.player.flex, minHeight: config.slots.player.minSize || 0 }]}>
              {slots.player}
            </View>
          )}
          {config.slots.controls.visible && (
            <View style={[styles.slot, { flex: config.slots.controls.flex, minHeight: config.slots.controls.minSize || 0 }]}>
              {slots.controls}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={isRow ? styles.rowContainer : styles.columnContainer}>
      {config.slots.editor.visible && (
        <View style={[styles.slot, { flex: config.slots.editor.flex, minWidth: config.slots.editor.minSize || 0, minHeight: config.slots.editor.minSize || 0 }]}>
          {slots.editor}
        </View>
      )}
      {config.slots.player.visible && (
        <View style={[styles.slot, { flex: config.slots.player.flex, minWidth: config.slots.player.minSize || 0, minHeight: config.slots.player.minSize || 0 }]}>
          {slots.player}
        </View>
      )}
      {config.slots.controls.visible && (
        <View style={[styles.slot, { flex: config.slots.controls.flex, minWidth: config.slots.controls.minSize || 0, minHeight: config.slots.controls.minSize || 0 }]}>
          {slots.controls}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  columnContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  slot: {
    minHeight: 0,
  },
});
