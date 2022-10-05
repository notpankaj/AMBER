import React from "react";
import { View, Text } from "react-native";
import { bodFormat } from "../../utils/helper";

const InfoBox = ({ userData }) => {
  const renderRow = (key, value) => {
    if (!value) return null;
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "80%",
        }}
      >
        <Text
          style={{
            marginVertical: 5,
            color: "rgba(0,0,0,0.3)",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {key}
        </Text>
        <Text
          style={{
            color: "rgba(0,0,0,0.8)",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {value}
        </Text>
      </View>
    );
  };
  return (
    <View
      style={{
        width: "100%",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 20,
      }}
    >
      {renderRow("Username", userData?.username || userData?.fullname)}
      {renderRow(
        userData?.gender === "male" ? "Coin" : "Diamonds",
        userData?.coins?.activeCoin
      )}
      {renderRow("Country", userData?.country)}
      {renderRow("Gender", userData?.gender)}
      {renderRow("Date of birth", bodFormat(userData?.dob))}
    </View>
  );
};

export default InfoBox;
