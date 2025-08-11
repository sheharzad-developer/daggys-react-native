import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerTitle: 'Home',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="food-detail"
        options={{
          headerTitle: 'Details',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}