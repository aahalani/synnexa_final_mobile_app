import React from "react";
import { View } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

const Container = ({ children, style, useSafeArea = true, ...props }) => {
  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <View
          {...props}
          style={[
            { flex: 1 },
            useSafeArea && {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
            style,
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

export default Container;
