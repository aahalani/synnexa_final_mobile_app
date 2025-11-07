import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        screenOptions={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs_student)"
        screenOptions={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs_faculty)"
        screenOptions={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)"
        screenOptions={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default _layout;
