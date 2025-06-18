// //Tabs helps set up bottom tab navigation where each screen is connected to a file like audio.tsx or files.tsx.
// import { Tabs } from "expo-router";

// //You’ll use it to show icons (like musical notes or file symbols) in the tab bar.
// import { Ionicons } from '@expo/vector-icons';

// // layout() -->It sets the layout configuration for your tab navigator.
// export default function Layout() {
//   return (
    
//     <Tabs initialRouteName='files'
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ color, size }) => {
//           let iconName: keyof typeof Ionicons.glyphMap;

//           if (route.name === 'audio') {
//             iconName = 'musical-notes-outline';
//           } else if (route.name === 'files') {
//             iconName = 'document-text-outline';
//            }
//           else {
//             iconName = 'help-outline';
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#0A2A66',
//         tabBarInactiveTintColor: 'gray',
//         headerShown: false,
//       })}
//     >
//       <Tabs.Screen
//         name="audio"
//         options={{
//           title: 'Audio',
//         }}
//       />
//       <Tabs.Screen
//         name="files"
//         options={{
//           title: 'Files',
//         }}
//       />
      
//     </Tabs>
//   );
// }









import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Alert, TouchableOpacity } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      initialRouteName="files"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'audio') {
            iconName = 'musical-notes-outline';
          } else if (route.name === 'files') {
            iconName = 'document-text-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0A2A66',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tabs.Screen
        name="audio"
        options={{
          title: 'Audio',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Supported Audio Formats',
                  '.m4a (recorded), .mp3, .wav\n\nPlayback may vary by device.\nRecommended: .m4a for best support.'
                );
              }}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="information-circle-outline" size={24} color="#0A2A66" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: 'Files',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Supported File Formats',
                  '✅ Images (.jpg, .png, .gif)\n✅ PDFs (.pdf)\n✅ Excel (.xls, .xlsx)\n✅ Audio (.m4a, .mp3, .wav)\n✅ Videos (.mp4, .mov)\n✅ Text (.txt)\n\nUnsupported types will show an error.'
                );
              }}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="information-circle-outline" size={24} color="#0A2A66" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
