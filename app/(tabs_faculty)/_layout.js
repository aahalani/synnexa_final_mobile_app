import React from "react";
import { Tabs } from "expo-router";
import { Feather, AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import FlashMessage from "react-native-flash-message";
import { COLORS } from "../../constants";
import { Platform, View, Dimensions, Text } from "react-native"; // Import Text component
import { MaterialCommunityIcons } from "@expo/vector-icons";

const screenHeight = Dimensions.get("window").height;

const TabIcon = ({ focused, iconName }) => {
  let iconComponent;

  iconComponent = (
    <AntDesign
      name={iconName}
      size={focused ? 28 : 25}
      color={focused ? COLORS.primary : COLORS.gray}
    />
  );

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {iconComponent}
    </View>
  );
};

const TabLabel = ({ focused, text }) => {
  return (
    <Text
      style={{
        fontSize: 18, // Use the desired font size
        paddingBottom: Platform.OS === "ios" ? 0 : 5,
        color: focused ? COLORS.primary : COLORS.gray,
      }}
    >
      {text}
    </Text>
  );
};

export default function _layout() {
  const tabBarHeight = screenHeight < 700 ? 60 : 90; // Example conditional sizing

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            backgroundColor: "white",
            borderTopColor: "transparent",
            height: Platform.OS === "ios" ? tabBarHeight : 60,
            borderRadius: 10,
          },
        }}
        initialRouteName="home"
      >
        <Tabs.Screen
          name="lecture"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="filetext1" />
            ),
            tabBarLabel: () => null,
            headerTitle: "Lecture",
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="calendar" />
            ),
            tabBarLabel: () => null,
            headerTitle: "Academics",
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="home" />
            ),
            tabBarLabel: () => null,
            headerTitle: "Home",
          }}
        />
        <Tabs.Screen
          name="assignment"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="book" />
            ),
            tabBarLabel: () => null,
            headerTitle: "Assignment",
          }}
        />
        <Tabs.Screen
          name="fees"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="creditcard" />
            ),
            tabBarLabel: () => null,
            headerTitle: "Fees",
          }}
        />
      </Tabs>
      <FlashMessage position="top" />
    </>
  );
}
