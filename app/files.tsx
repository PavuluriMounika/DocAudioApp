// // app/files.tsx
// import { View, Text, StyleSheet } from 'react-native';

// export default function FilesScreen() {
//     return (
//         <View style={styles.container}>
//             <Text style={styles.text}>📄 Files Screen</Text>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     text: { fontSize: 24 },
// });

// app/files.tsx
// app/files.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

type FileItem = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'unknown';
};

export default function FilesScreen() {
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'New document 1', type: 'pdf' },
    { id: '2', name: 'New document 2', type: 'pdf' },
    { id: '3', name: 'New document 3', type: 'pdf' },
  ]);

  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const fileType = getFileType(result.name);
        const newFile: FileItem = {
          id: Date.now().toString(),
          name: result.name,
          type: fileType,
        };

        setFiles((prev) => [...prev, newFile]);

        Alert.alert('Success ✅', 'File added successfully');
      } else {
        Alert.alert('Cancelled ❌', 'You didn’t select any file.');
      }
    } catch (error) {
      Alert.alert('Error ⚠️', 'Something went wrong while picking the file.');
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (filename: string): FileItem['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'unknown';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi'].includes(ext)) return 'video';
    return 'unknown';
  };

  const renderIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'pdf':
        return <Ionicons name="document-text-outline" size={28} color="#7D6FE3" />;
      case 'image':
        return <Ionicons name="image-outline" size={28} color="#7D6FE3" />;
      case 'video':
        return <Ionicons name="videocam-outline" size={28} color="#7D6FE3" />;
      default:
        return <Ionicons name="document-outline" size={28} color="#7D6FE3" />;
    }
  };

  const renderFileItem = ({ item }: { item: FileItem }) => (
    <View style={styles.card}>
      {renderIcon(item.type)}
      <Text style={styles.cardText}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titleSmall}>Your Documents</Text>

      <View style={styles.headerRow}>
        <Text style={styles.titleLarge}>Documents</Text>
        <TouchableOpacity style={styles.addButton} onPress={pickFile}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0A2A66" />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={renderFileItem}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fdfcff',
    },
    titleSmall: {
      fontSize: 16,
      color: '#333',
      marginBottom: 10,
      alignSelf: 'center',
    },
    titleLarge: {
      fontSize: 28,
      fontWeight: '600',
      color: '#333',
    },
    addButton: {
      backgroundColor: '#0A2A66',
      borderRadius: 25,
      padding: 10,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ECEAFF',
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
      elevation: 2,
    },
    cardText: {
      marginLeft: 10,
      fontSize: 16,
      color: '#444',
    },
  });
  