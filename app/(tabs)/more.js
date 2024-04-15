import { View, Text, Button } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const more = () => {
  return (
    <View>
      <Text>more</Text>
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
};

export default more;
