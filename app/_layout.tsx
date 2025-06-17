//Tabs helps set up bottom tab navigation where each screen is connected to a file like audio.tsx or files.tsx.
import { Tabs } from "expo-router";  

//You’ll use it to show icons (like musical notes or file symbols) in the tab bar.
import {Ionicons} from '@expo/vector-icons';

// layout() -->It sets the layout configuration for your tab navigator.
export default function Layout() {
  return (
    <Tabs
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
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="audio"
        options={{
          title: '',
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: '',
        }}
      />
      
    </Tabs>
  );
}



 
