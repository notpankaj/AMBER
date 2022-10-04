import React from "react";
import { Text, View } from "react-native";

const UserIdComp = ({ userId }) => {
  return (
    <View
      style={{
        width: "100%",
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        backfaceVisibility: "hidden",
        backgroundColor: "transparent",
        position: "absolute",
        zIndex: 100,
      }}
    >
      <View
        style={{
          width: "75%",
          height: 45,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "orange",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.27,
          shadowRadius: 4.65,
          borderBottomStartRadius: 50,
          borderBottomEndRadius: 50,
          elevation: 6,
        }}
      >
        <Text style={{ color: "#555", letterSpacing: 1, fontWeight: "bold" }}>
          {userId}
        </Text>
      </View>
    </View>
  );
};

export default UserIdComp;
