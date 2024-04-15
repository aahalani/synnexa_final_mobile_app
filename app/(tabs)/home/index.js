import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Page() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem("user");
      setUser(user);
      console.log("user: ", user);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hello, {user}</Text>

      <View style={styles.boxContainer}>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Attendance</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Fees</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Submissions</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Course Content</Text>
        </View>
      </View>

      <Button
        title="Logout"
        onPress={async () => {
          await AsyncStorage.removeItem("user");
          setUser(null);
          navigation.replace("(auth)");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  boxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  box: {
    width: "48%",
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
