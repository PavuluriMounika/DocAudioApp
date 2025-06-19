import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  TextInput, // added for search
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

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
  const [filteredAudioList, setFilteredAudioList] = useState<AudioItem[]>([]); // for search
  const [searchQuery, setSearchQuery] = useState(''); // for search
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPlayerScreen, setShowPlayerScreen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioItem | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // useEffect – Load Saved Audios
  useEffect(() => {
    loadAudios();
    return () => {
      sound?.unloadAsync();
    };
  }, []);
  //  Search Functionality
  useEffect(() => {
    //  filter list based on search input
    const results = audioList.filter(audio =>
      audio.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAudioList(results);
  }, [searchQuery, audioList]);
  // loadAudios()
  const loadAudios = async () => {
    const stored = await AsyncStorage.getItem('audioList');
    if (stored) {
      const parsed = JSON.parse(stored);
      setAudioList(parsed);
      setFilteredAudioList(parsed); //  show all initially
    }
  };
  //  saveAudio()
  const saveAudio = async (newAudio: AudioItem) => {
    const updated = [...audioList, newAudio];
    setAudioList(updated);
    setFilteredAudioList(updated);
    await AsyncStorage.setItem('audioList', JSON.stringify(updated));
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (err: any) {
      Alert.alert('Recording error', err.message);
    }
  };

  const stopRecording = async () => {
    try {
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI() || '';
      const info = await recording?.getStatusAsync();
      const duration = info?.durationMillis || 0;
      const size = (info?.durationMillis! * 0.00027).toFixed(1); // rough estimate

      const audio: AudioItem = {
        id: Date.now().toString(),
        name: `Audio_${audioList.length + 1}.mp3`,
        uri,
        duration,
        size: `${size}mb`,
      };

      await saveAudio(audio);
      setRecording(null);
    } catch (err: any) {
      Alert.alert('Stop recording error', err.message);
    }
  };

  const formatDuration = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  };

  const openPlayer = async (item: AudioItem) => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: item.uri },
      { shouldPlay: true }
    );

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setCurrentTime(status.positionMillis || 0);
        if (status.didJustFinish) {
          setPlayingId(null);
          setCurrentTime(0);
        }
      }
    });

    setSound(newSound);
    setCurrentAudio(item);
    setPlayingId(item.id);
    setShowPlayerScreen(true);
  };

  const togglePlayback = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const goBack = async () => {
    await sound?.stopAsync();
    setShowPlayerScreen(false);
    setPlayingId(null);
    setCurrentTime(0);
  };

  const renderItem = ({ item }: { item: AudioItem }) => (
    <View style={styles.card}>
      <Ionicons name="mic-outline" size={30} color="#3EA9F5" />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {formatDuration(item.duration)}  -  {item.size}
        </Text>
      </View>
      <TouchableOpacity onPress={() => openPlayer(item)}>
        <Ionicons name="play" size={26} color="#9B8AFB" />
      </TouchableOpacity>
    </View>
  );

  if (showPlayerScreen && currentAudio) {
    const totalDuration = currentAudio.duration;

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.titleSmall}>Your library</Text>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2780/2780151.png' }}
          style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 20 }}
        />
        <Text style={[styles.titleLarge, { alignSelf: 'center' }]}>My Audio</Text>

        <Slider
          style={{ width: '90%', alignSelf: 'center', marginTop: 20 }}
          minimumValue={0}
          maximumValue={totalDuration}
          value={currentTime}
          onSlidingComplete={async (value) => {
            await sound?.setPositionAsync(value);
          }}
          minimumTrackTintColor="#4db5ff"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#4db5ff"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
          <Text style={styles.meta}>{formatDuration(currentTime)}</Text>
          <Text style={styles.meta}>{formatDuration(totalDuration)}</Text>
        </View>

        <TouchableOpacity
          onPress={togglePlayback}
          style={{ backgroundColor: '#66cfff', padding: 20, borderRadius: 50, marginTop: 30, alignSelf: 'center' }}
        >
          <Ionicons name="pause" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

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

      {/*  Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search audio..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredAudioList}
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

  //  New style
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
});
