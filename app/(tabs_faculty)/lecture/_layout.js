import { Stack } from 'expo-router';

export default function LectureLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Details" options={{ headerShown: false }} />
      <Stack.Screen name="SearchLectureContent" options={{ headerShown: false }} />
      <Stack.Screen name="LectureContentDetails" options={{ headerShown: false }} />
    </Stack>
  );
}

