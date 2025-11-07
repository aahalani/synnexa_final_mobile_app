import React from "react";
import { Tabs } from "expo-router";
import { Feather, AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import FlashMessage from "react-native-flash-message";
import { COLORS } from "../../constants";
import { Platform, View, Dimensions, Text } from "react-native";
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
        fontSize: 18,
        paddingBottom: Platform.OS === "ios" ? 0 : 5,
        color: focused ? COLORS.primary : COLORS.gray,
      }}
    >
      {text}
    </Text>
  );
};

export default function _layout() {
  const tabBarHeight = screenHeight < 700 ? 60 : 90;

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
          headerStyle: {
            backgroundColor: "#fff",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E5E5",
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "600",
            color: COLORS.primary,
          },
          headerTintColor: COLORS.primary,
        }}
        initialRouteName="home"
      >
        <Tabs.Screen
          name="home/index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="home" />
            ),
            tabBarLabel: () => null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="lecture"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="filetext1" />
            ),
            tabBarLabel: () => null,
            headerTitle: "Lecture",
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="calendar" />
            ),
            tabBarLabel: () => null,
            headerTitle: "Attendance",
            headerShown: true,
          }}
        />
        
        <Tabs.Screen
          name="assignment"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="book" />
            ),
            tabBarLabel: () => null,
            headerTitle: "Assignments",
            headerShown: true,
          }}
        />
      </Tabs>
      <FlashMessage position="top" />
    </>
  );
}

