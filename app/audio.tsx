// import { View, Text, StyleSheet } from 'react-native';

// export default function AudioScreen() {
//     return (
//         <View style={styles.container}>
//             <Text style={styles.text}>🎵 Audio Screen</Text>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     text: { fontSize: 24 },
// });
// app/(tabs)/audio.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type AudioItem = {
  id: string;
  name: string;
  uri: string;
  duration: number;
  size: string;
};

export default function AudioScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioList, setAudioList] = useState<AudioItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAudios();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadAudios = async () => {
    const stored = await AsyncStorage.getItem('audioList');
    if (stored) {
      setAudioList(JSON.parse(stored));
    }
  };

  const saveAudio = async (newAudio: AudioItem) => {
    const updated = [...audioList, newAudio];
    setAudioList(updated);
    await AsyncStorage.setItem('audioList', JSON.stringify(updated));
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (err) {
      Alert.alert('Recording error', err.message);
    }
  };

  const stopRecording = async () => {
    try {
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI() || '';
      const info = await recording?.getStatusAsync();

      const duration = info?.durationMillis || 0;
      const size = (info?.durationMillis! * 0.007).toFixed(1); // rough estimate

      const audio: AudioItem = {
        id: Date.now().toString(),
        name: `Audio_${Date.now()}.mp3`,
        uri,
        duration,
        size: `${size} mb`,
      };

      await saveAudio(audio);
      setRecording(null);
    } catch (err) {
      Alert.alert('Stop recording error', err.message);
    }
  };

  const formatDuration = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  const playAudio = async (item: AudioItem) => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingId(null);
      clearInterval(intervalRef.current!);
    }

    const { sound: newSound, status } = await Audio.Sound.createAsync(
      { uri: item.uri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded) {
          setCurrentTime(status.positionMillis || 0);
        }
      }
    );

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.positionMillis) {
        setCurrentTime(status.positionMillis);
      }
      if (status.didJustFinish) {
        setPlayingId(null);
        setCurrentTime(0);
        clearInterval(intervalRef.current!);
      }
    });

    setPlayingId(item.id);
    setSound(newSound);
  };

  const stopAudio = async () => {
    await sound?.stopAsync();
    setPlayingId(null);
    setCurrentTime(0);
    clearInterval(intervalRef.current!);
  };

  const renderItem = ({ item }: { item: AudioItem }) => (
    <View style={styles.card}>
      <Ionicons name="mic-outline" size={28} color="#5A9" />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {formatDuration(item.duration)} - {item.size}
        </Text>
        {playingId === item.id && (
          <Text style={styles.meta}>
            Playing: {formatDuration(currentTime)} / {formatDuration(item.duration)}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() =>
          playingId === item.id ? stopAudio() : playAudio(item)
        }
      >
        <Ionicons
          name={playingId === item.id ? 'stop' : 'play'}
          size={28}
          color="#88F"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titleSmall}>Your library</Text>
      <View style={styles.headerRow}>
        <Text style={styles.titleLarge}>Audio Library</Text>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={recording ? stopRecording : startRecording}
        >
          <Ionicons name={recording ? 'stop' : 'add'} size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={audioList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fdfcff' },
  titleSmall: { fontSize: 16, color: '#333', alignSelf: 'center' },
  titleLarge: { fontSize: 28, fontWeight: '600', color: '#333' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  recordButton: {
    backgroundColor: '#0A2A66',
    borderRadius: 30,
    padding: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ECEAFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '500', color: '#333' },
  meta: { fontSize: 14, color: '#555' },
});
