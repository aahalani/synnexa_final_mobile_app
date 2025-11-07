import React from 'react';
import { Stack } from 'expo-router';

export default function AssignmentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Details"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AssignmentSubmissions"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

