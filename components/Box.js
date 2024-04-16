import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather, AntDesign } from "@expo/vector-icons";
import * as Font from "expo-font";

const Box = ({ icon, title, subtitle, color }) => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const _loadAssetsAsync = async () => {
    await Font.loadAsync({
      OxygenRegular: require("../assets/Oxygen-Regular.ttf"),
      OxygenBold: require("../assets/Oxygen-Bold.ttf"),
    });
    setAssetsLoaded(true);
  };

  useEffect(() => {
    _loadAssetsAsync();
  }, []);

  return assetsLoaded ? (
    <TouchableOpacity style={[styles.box, { backgroundColor: color }]}>
      <View style={{ marginLeft: 5 }}>
        <Feather name={icon} size={24} color="black" />
      </View>
      <Text style={styles.boxTitle}>{title}</Text>
      <Text style={styles.boxSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  ) : null;
};

const styles = {
  box: {
    width: "48%",
    height: 165,
    borderRadius: 30,
    padding: 20,
    marginBottom: 10,
  },
  boxTitle: {
    fontSize: 16,
    fontFamily: "SansBold",
    marginTop: 15,
    marginLeft: 5,
  },
  boxSubtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "OxygenRegular",
    marginTop: 15,
    marginLeft: 5,
  },
};

export default Box;
