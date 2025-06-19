import 'react-native-get-random-values'; 
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
    TextInput,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

interface StoredFile {
    id: string;
    name: string;
    uri: string;
    mimeType: string;
}

export default function FilesScreen() {
    // state variables
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<StoredFile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    //  Loading Files on App Start
    useEffect(() => {
        const loadFiles = async () => {
            try {
                const saved = await AsyncStorage.getItem('uploaded_files');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setFiles(parsed);
                    setFilteredFiles(parsed);
                }
            } catch (e) {
                console.error("Failed to load files from AsyncStorage:", e);
                Alert.alert("Error", "Could not load saved files. They might be corrupted.");
                setFiles([]);
                setFilteredFiles([]);
            }
        };
        loadFiles();
    }, []);
    // Search Logic
    useEffect(() => {
        const results = files.filter(file =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFiles(results);
    }, [searchQuery, files]);
    //  Uploading a Document
    async function pickDocument() {
        const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });

        if (result.assets && result.assets.length > 0) {
            const file = result.assets[0];
            const fileName = file.name || 'Unnamed_File';
            const fileMime = file.mimeType || 'application/octet-stream';
            let fileUri = file.uri;

            if (Platform.OS === 'android') {
                const destPath = `${FileSystem.documentDirectory}${fileName}`;
                try {
                    const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
                    if (!dirInfo.exists) {
                        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory, { intermediates: true });
                    }
                    await FileSystem.copyAsync({ from: file.uri, to: destPath });
                    fileUri = destPath;
                } catch (error) {
                    console.error("File copy failed:", error);
                    Alert.alert('Error', 'File copy failed. Please try again.');
                    return;
                }
            }

            const storedFile: StoredFile = {
                id: uuidv4(),
                name: fileName,
                uri: fileUri,
                mimeType: fileMime,
            };

            const prev = await AsyncStorage.getItem('uploaded_files');
            const prevFiles = prev ? JSON.parse(prev) : [];
            const updatedFiles = [...prevFiles, storedFile];
            await AsyncStorage.setItem('uploaded_files', JSON.stringify(updatedFiles));
            setFiles(updatedFiles);
            setSearchQuery(''); // reset search after upload
        }
    }
        //Clear All Uploaded Files

    async function clearFiles() {
        Alert.alert(
            'Confirm Clear',
            'Are you sure you want to remove all uploaded files?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    onPress: async () => {
                        await AsyncStorage.removeItem('uploaded_files');
                        setFiles([]);
                        setFilteredFiles([]);
                        Alert.alert('Cleared', 'All uploaded files have been removed.');
                    },
                },
            ],
            { cancelable: true }
        );
    }
    // Open/View a File

    async function openFile(item: StoredFile) {
        if (Platform.OS === 'android') {
            try {
                const contentUri = await FileSystem.getContentUriAsync(item.uri);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1,
                    type: item.mimeType,
                });
            } catch (e: any) {
                console.error("Error opening file on Android:", e);
                Alert.alert("Error", `Cannot open this file on Android: ${e.message || 'Unknown error'}.`);
            }
        } else if (Platform.OS === 'ios') {
            Alert.alert('iOS', 'File viewing is typically handled by system apps or requires a dedicated viewer library.');
        }
         else {
            Alert.alert('Platform Not Supported', 'File viewing is currently supported on Android.');
        }
    }
//Show Icon Based on File Type

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('image/')) {
            return <Ionicons name="image-outline" size={28} color="#A09ACF" />;
        }
        if (mimeType.includes('video/')) {
            return <Ionicons name="videocam-outline" size={28} color="#A09ACF" />;
        }
        if (mimeType.includes('audio/')) {
            return <Ionicons name="musical-notes-outline" size={28} color="#A09ACF" />;
        }
        if (mimeType.includes('pdf')) {
            return <Ionicons name="file-pdf-outline" size={28} color="#A09ACF" />;
        }
        if (mimeType.includes('text/')) {
            return <Ionicons name="document-text-outline" size={28} color="#A09ACF" />;
        }
        return <Ionicons name="document-outline" size={28} color="#A09ACF" />;
    };
        //  Return UI Header shows title

        // TextInput: search box

            // FlatList: lists filtered files

            // Two FAB buttons:

            // ➕ Upload file

            // Clear all files
    return (
        <View style={styles.container}>
            <Text style={styles.headerSubtitle}>Your Documents</Text>
            <Text style={styles.headerTitle}>Documents</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Search files..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {filteredFiles.length === 0 ? (
                <Text style={styles.noDocumentsText}>No matching documents found.</Text>
            ) : (
                <FlatList
                    data={filteredFiles}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContentContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.item} onPress={() => openFile(item)}>
                            {getFileIcon(item.mimeType)}
                            <Text style={styles.itemText}>{item.name || 'Unnamed File'}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <View style={styles.fabContainer}>
                <TouchableOpacity onPress={pickDocument} style={styles.fab}>
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={clearFiles} style={styles.clearButton}>
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fdfcff',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    headerSubtitle: {
        textAlign: 'center',
        fontSize: 16,
        color: '#3a3740',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '600',
        color: '#3a3740',
        marginBottom: 12,
        textAlign: 'left',
    },
    searchInput: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        fontSize: 16,
        color: '#333',
    },
    noDocumentsText: {
        textAlign: 'center',
        color: 'gray',
        marginTop: 20,
    },
    listContentContainer: {
        paddingBottom: 100,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 18,
        marginLeft: 16,
        color: '#3a3740',
        flexShrink: 1,
    },
    fabContainer: {
        position: 'absolute',
        right: 24,
        top: 90,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
    },
    fab: {
        backgroundColor: '#003087',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    clearButton: {
        backgroundColor: 'crimson',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});


