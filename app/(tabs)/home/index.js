import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Feather, AntDesign } from "@expo/vector-icons";
import * as Font from "expo-font";
import Box from "../../../components/Box";

export default function Page() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem("user");
      setUser(user);
      console.log("user: ", user);
    })();
  }, []);

  const _loadAssetsAsync = async () => {
    await Font.loadAsync({
      SansRegular: require("../../../assets/OpenSans-Regular.ttf"),
      SansBold: require("../../../assets/OpenSans-Bold.ttf"),
      SourceCodeProRegular: require("../../../assets/SourceCodePro-Regular.ttf"),
      SourceCodeBold: require("../../../assets/SourceCodePro-Bold.ttf"),
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
      <Text style={styles.header}>
        Hello, {user?.charAt(0).toUpperCase() + user?.slice(1)}
      </Text>
      <View
        style={{
          borderBottomColor: "#666",
          borderBottomWidth: 1,
          marginBottom: 20,
        }}
      />

      <View style={styles.boxContainer}>
        <Box
          icon="calendar"
          title="Attendance"
          subtitle="View your attendance"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "SourceCodeBold",
  },
  boxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});
