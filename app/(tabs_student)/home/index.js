import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
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
          marginBottom: 40,
        }}
      >
        {/* Make a small box gray background a simple student logo */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              backgroundColor: "#F4F5FA",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <Feather name="user" size={24} color="black" />
          </View>
          {/* Add User name here */}
          <Text
            style={{
              fontFamily: "OxygenBold",
              fontSize: 18,
            }}
          >
            {user}
          </Text>
          {/* Add profile button here with the initials (First and Last) of the user make it round */}
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#E1E2FF",
            padding: 15,
            borderRadius: 100,
          }}
        >
          <Text
            style={{
              color: "#484A79",
              fontFamily: "OxygenBold",
              fontSize: 16,
            }}
          >
            {user?.charAt(0).toUpperCase() +
              user?.charAt(user.indexOf(" ") + 1)}
          </Text>
        </TouchableOpacity>
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
          subtitle="View your feedbacks"
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
    fontFamily: "HalveticaRegular",
  },
  boxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
