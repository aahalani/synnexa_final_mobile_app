import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Feather, AntDesign } from "@expo/vector-icons";

const Box = ({ icon, title, subtitle, color }) => {
  return (
    <TouchableOpacity style={[styles.box, { backgroundColor: color }]}>
      <View style={{ marginLeft: 5 }}>
        <Feather name={icon} size={24} color="black" />
      </View>
      <Text style={styles.boxTitle}>{title}</Text>
      <Text style={styles.boxSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

const styles = {
  box: {
    width: "47%",
    height: 150,
    borderRadius: 30,
    padding: 20,
    marginBottom: 10,
  },
  boxTitle: {
    fontSize: 16,
    fontFamily: "SansBold",
    marginTop: 10,
    marginLeft: 5,
  },
  boxSubtitle: {
    fontSize: 13,
    color: "#666",
    fontFamily: "SansRegular",
    marginTop: 10,
    marginLeft: 5,
  },
};

export default Box;
