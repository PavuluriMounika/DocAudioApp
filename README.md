# 📱 DocAudioApp

DocAudioApp is a React Native app built with Expo Router. It allows users to:
- 🎙️ Record and play audio files with duration and metadata.
- 📄 Upload and view documents (PDFs, images, videos, etc.) with type icons.

## 🚀 Features

### 🧭 Navigation
- **Bottom Tab Navigation** using Expo Router.
- Two tabs:
  - `Audio` for recording & playing audio.
  - `Files` for uploading and viewing documents.

### 🎵 Audio Library
- Record high-quality audio.
- Store metadata: name, duration, size.
- List audios with Play/Stop control and real-time duration.
- Persistent storage with `AsyncStorage`.

### 📄 Files Manager
- Pick files using `expo-document-picker`.
- Store files in `AsyncStorage` with unique ID and type.
- Show icons based on file type (PDF, image, video, etc.).
- Open files using `IntentLauncher` (Android only for now).
- Clear uploaded files with a single button.

## 🧱 Built With

- React Native (with Expo)
- Expo Router
- `expo-av`, `expo-document-picker`, `expo-file-system`
- `@expo/vector-icons` for icons
- `AsyncStorage` for local data persistence

## 🗂️ File Structure

```
app/
├── _layout.tsx # Tab layout using Expo Router Tabs
├── audio.tsx # Audio recording and library screen
└── files.tsx # File picker and viewer screen
```


## 📦 Installation

```bash
git clone https://github.com/yourusername/DocAudioApp.git
cd DocAudioApp
npm install
npx expo start
```

## 🧪 Test on Expo Go

Install Expo Go on your phone.

Run npx expo start in terminal.

Scan the QR code shown.

## 🔐 Permissions
Ensure these permissions are handled:

Microphone (for audio recording)

File storage (for document access)

## 📌 Notes

Metadata stored via AsyncStorage (no backend).

## ✨ UI Highlights
Visually organized cards for audio & file items.

Icons based on file types.

Record button for audio.

FAB button to pick files.

Clear button with confirmation alert.

## 👩‍💻 Author
Name: Pavuluri Mounika

GitHub: @PavuluriMounika



