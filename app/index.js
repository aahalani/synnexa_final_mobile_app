import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const SplashScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AsyncStorage.getItem("user");

        // Wait for a minimum of 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (user) {
          navigation.replace("(tabs)");
        } else {
          navigation.replace("(auth)");
        }
      } catch (error) {
        console.log("Error retrieving user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Image
          source={require("../assets/fulllogo.png")}
          style={{
            width: 400,
            height: 400,
            resizeMode: "contain",
          }}
        />
      </View>
    );
  }

  return null;
};

export default SplashScreen;
