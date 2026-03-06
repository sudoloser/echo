import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import {
  Play,
  Pause,
  Square,
  Plus,
  Save,
  FileMusic,
  Share,
  Trash2,
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';

import { Text, View } from '@/components/Themed';
import { useAppSettings } from '@/context/AppSettingsContext';
import Colors from '@/constants/Colors';
import {
  LyricLine,
  formatLyricsToLRC,
  parseLRCToLyrics,
  publishLyrics,
} from '@/lib/lrclib';

export default function EditorScreen() {
  const { colorScheme, userAgent } = useAppSettings();
  const tintColor = Colors[colorScheme].tint;

  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<{ uri: string; name: string } | null>(null);

  // Lyrics state
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [rawLRC, setRawLRC] = useState('');
  const [isSyncMode, setIsSyncMode] = useState(false);
  
  // FAB / Syncing state
  const [syncState, setSyncState] = useState<'idle' | 'capturing_start' | 'capturing_end'>('idle');
  const [currentLineStart, setCurrentLineStart] = useState<number | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [pendingText, setPendingText] = useState('');

  // Metadata state
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setAudioFile({ uri: asset.uri, name: asset.name });

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: asset.uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const stopPlayback = async () => {
    if (!sound) return;
    await sound.stopAsync();
  };

  const onSliderValueChange = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value * 1000);
    }
  };

  const handleFABPress = () => {
    if (syncState === 'idle') {
      setSyncState('capturing_start');
      setCurrentLineStart(position);
    } else if (syncState === 'capturing_start') {
      setSyncState('capturing_end');
      setShowTextInput(true);
    }
  };

  const saveLyricLine = () => {
    if (currentLineStart !== null) {
      const newLine: LyricLine = {
        id: Math.random().toString(36).substr(2, 9),
        start: currentLineStart,
        end: position,
        text: pendingText,
      };
      const updatedLyrics = [...lyrics, newLine].sort((a, b) => a.start - b.start);
      setLyrics(updatedLyrics);
      setRawLRC(formatLyricsToLRC(updatedLyrics));
    }
    setPendingText('');
    setShowTextInput(false);
    setSyncState('idle');
    setCurrentLineStart(null);
  };

  const deleteLyricLine = (id: string) => {
    const updatedLyrics = lyrics.filter((l) => l.id !== id);
    setLyrics(updatedLyrics);
    setRawLRC(formatLyricsToLRC(updatedLyrics));
  };

  const handleRawLRCChange = (text: string) => {
    setRawLRC(text);
    // Optionally try to parse it immediately or on toggle
  };

  useEffect(() => {
    if (isSyncMode) {
      setLyrics(parseLRCToLyrics(rawLRC));
    }
  }, [isSyncMode]);

  const handlePublish = async () => {
    if (!trackName || !artistName) {
      Alert.alert('Metadata Required', 'Please enter at least Track Name and Artist Name.');
      return;
    }

    setIsPublishing(true);
    try {
      await publishLyrics(
        trackName,
        artistName,
        albumName,
        duration,
        rawLRC,
        userAgent
      );
      Alert.alert('Success', 'Lyrics published to LRCLIB!');
      setShowMetadataModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unknown error occurred.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Audio Controls */}
      <View style={styles.audioControls}>
        <TouchableOpacity onPress={pickAudio} style={styles.fileButton}>
          <FileMusic color={tintColor} size={24} />
          <Text style={styles.fileName} numberOfLines={1}>
            {audioFile ? audioFile.name : 'Load MP3'}
          </Text>
        </TouchableOpacity>

        <View style={styles.sliderRow}>
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={onSliderValueChange}
            minimumTrackTintColor={tintColor}
            maximumTrackTintColor="#ccc"
            thumbTintColor={tintColor}
          />
          <Text style={styles.timeText}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>

        <View style={styles.playbackButtons}>
          <TouchableOpacity onPress={togglePlayback} disabled={!sound}>
            {isPlaying ? (
              <Pause color={tintColor} size={32} />
            ) : (
              <Play color={tintColor} size={32} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={stopPlayback} disabled={!sound}>
            <Square color={tintColor} size={32} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync Toggle */}
      <View style={styles.toggleRow}>
        <Text>Raw Text</Text>
        <Switch
          value={isSyncMode}
          onValueChange={setIsSyncMode}
          trackColor={{ false: '#767577', true: tintColor }}
        />
        <Text>Sync Mode</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setShowMetadataModal(true)}>
          <Share color={tintColor} size={24} />
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {isSyncMode ? (
          <ScrollView style={styles.lyricList}>
            {lyrics.map((line) => (
              <View key={line.id} style={styles.lyricLine}>
                <View style={styles.lyricLineInfo}>
                  <Text style={styles.lyricTimestamp}>[{formatTime(line.start)}]</Text>
                  <Text style={styles.lyricText}>{line.text}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteLyricLine(line.id)}>
                  <Trash2 color="#ff4444" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <TextInput
            style={[styles.rawInput, { color: Colors[colorScheme].text }]}
            multiline
            value={rawLRC}
            onChangeText={handleRawLRCChange}
            placeholder="Paste raw LRC or plain text here..."
            placeholderTextColor="#888"
          />
        )}
      </View>

      {/* FAB */}
      {isSyncMode && sound && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: tintColor }]}
          onPress={handleFABPress}
        >
          {syncState === 'idle' ? (
            <Plus color="white" size={32} />
          ) : syncState === 'capturing_start' ? (
            <Text style={styles.fabText}>END</Text>
          ) : (
            <Save color="white" size={32} />
          )}
        </TouchableOpacity>
      )}

      {/* Text Input Modal for FAB Sync */}
      <Modal visible={showTextInput} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Lyric Text</Text>
            <TextInput
              style={[styles.textInput, { color: Colors[colorScheme].text, borderColor: tintColor }]}
              value={pendingText}
              onChangeText={setPendingText}
              autoFocus
              placeholder="Type the lyric..."
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: tintColor }]}
              onPress={saveLyricLine}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Metadata / Publish Modal */}
      <Modal visible={showMetadataModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Publish to LRCLIB</Text>
            <TextInput
              style={[styles.textInput, { color: Colors[colorScheme].text, borderColor: tintColor }]}
              placeholder="Track Name"
              placeholderTextColor="#888"
              value={trackName}
              onChangeText={setTrackName}
            />
            <TextInput
              style={[styles.textInput, { color: Colors[colorScheme].text, borderColor: tintColor }]}
              placeholder="Artist Name"
              placeholderTextColor="#888"
              value={artistName}
              onChangeText={setArtistName}
            />
            <TextInput
              style={[styles.textInput, { color: Colors[colorScheme].text, borderColor: tintColor }]}
              placeholder="Album Name"
              placeholderTextColor="#888"
              value={albumName}
              onChangeText={setAlbumName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#888', marginRight: 10 }]}
                onPress={() => setShowMetadataModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: tintColor, flex: 1 }]}
                onPress={handlePublish}
                disabled={isPublishing}
              >
                <Text style={styles.modalButtonText}>
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  audioControls: {
    marginBottom: 20,
    gap: 10,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  fileName: {
    flex: 1,
    fontSize: 16,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeText: {
    fontSize: 12,
    minWidth: 80,
    textAlign: 'right',
  },
  playbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  contentArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    overflow: 'hidden',
  },
  rawInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  lyricList: {
    flex: 1,
  },
  lyricLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  lyricLineInfo: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  lyricTimestamp: {
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  lyricText: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    gap: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
});
