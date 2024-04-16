import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import Box from "../../../components/Box";
import { styles } from ".";

export default function Page() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const user = "Avval Halani";
      setUser(user);
      console.log("user: ", user);
    })();
  }, []);

  const _loadAssetsAsync = async () => {
    await Font.loadAsync({
      SansRegular: require("../../../assets/OpenSans-Regular.ttf"),
      SansBold: require("../../../assets/OpenSans-Bold.ttf"),
      SourceCodeProRegular: require("../../../assets/SourceCodePro-Regular.ttf"),
      OxygenRegular: require("../../../assets/Oxygen-Regular.ttf"),
      OxygenBold: require("../../../assets/Oxygen-Bold.ttf"),
    });
    setAssetsLoaded(true);
  };

  useEffect(() => {
    _loadAssetsAsync();
  }, []);

  return !assetsLoaded ? (
    <ActivityIndicator size="large" color="#0000ff" />
  ) : (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {/* Make a small box gray background a simple student logo */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View
            style={{
              backgroundColor: "#F4F5FA",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Feather name="user" size={24} color="black" />
          </View>
          {/* Add User name here */}
          <Text
            style={{
              fontFamily: "OxygenBold",
              fontSize: 16,
            }}
          >
            Hello, {}
          </Text>
          {/* Add profile button here with the initials of the user make it round */}
        </View>
        <View
          style={{
            backgroundColor: "#E1E2FF",
            padding: 10,
            borderRadius: 50,
          }}
        >
          <Text
            style={{
              color: "#484A79",
              fontFamily: "OxygenBold",
            }}
          >
            {user?.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
      {/* <Text style={styles.header}> */}
      {/* //     Hello, {user?.charAt(0).toUpperCase() + user?.slice(1)}
          //   </Text>
          //   <View
          //     style={{
          //       borderBottomColor: "#666",
          //       borderBottomWidth: 1,
          //       marginBottom: 20,
          //     }}
          //   /> */}

      <View style={styles.boxContainer}>
        <Box
          icon="calendar"
          title="Attendance"
          subtitle="Manage your attendance"
          color="#FFF4DE"
        />
        <Box
          icon="book"
          title="Courses"
          subtitle="View your courses"
          color="#E8F4FF"
        />
        <Box
          icon="file-text"
          title="Results"
          subtitle="View your results"
          color="#E4F1DE"
        />
        <Box
          icon="message-square"
          title="Feedback"
          subtitle="View your feedback"
          color="#EBE5FF"
        />
      </View>
    </View>
  );
}
