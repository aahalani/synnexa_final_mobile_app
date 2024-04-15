import { View, Text } from "react-native";
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
        name="(tabs)"
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
    </Stack>
  );
};

export default _layout;
