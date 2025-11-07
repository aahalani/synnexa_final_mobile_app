import React from 'react';
import { Stack } from 'expo-router';

export default function AttendanceLayout() {
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
        name="MarkAttendance"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MarkAttendanceDetails"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
