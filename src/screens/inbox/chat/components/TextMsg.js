import React from "react";
import { Text, View } from "react-native";
import {
  formatAMPM,
  fromNowFormat,
  isToday,
  willAddDateMarker,
} from "../../../../utils/helper";
import Octicons from "react-native-vector-icons/Octicons";
import { useSelector } from "react-redux";
import DivisionMarker from "./DivisionMarker";
const TextMsg = ({ isSideLeft, item, messageIdx }) => {
  const { chatStorage } = useSelector((s) => s?.chat);

  console.log({
    prevMsg: chatStorage[messageIdx - 1]?.date,
    currentMsg: chatStorage[messageIdx]?.date,
  });
  return (
    <>
      <DivisionMarker
        prevDate={chatStorage[messageIdx - 1]?.date}
        currentDate={chatStorage[messageIdx]?.date}
      />

      <View
        style={{
          backgroundColor: isSideLeft ? "#222" : "#23a12f",
          alignSelf: isSideLeft ? "flex-start" : "flex-end",
          padding: 5,
          width: "60%",
          maxWidth: 300,
          borderRadius: 10,
          marginVertical: 10,
          marginTop: 15,
        }}
      >
        {/* messageTIP */}
        {isSideLeft ? (
          <Octicons
            style={{
              position: "absolute",
              zIndex: -1,
              top: -22,
            }}
            name="triangle-right"
            size={50}
            color="#222"
          />
        ) : (
          <Octicons
            style={{
              position: "absolute",
              zIndex: -1,
              top: -22,
              right: 0,
            }}
            name="triangle-left"
            size={50}
            color="#23a12f"
          />
        )}

        <Text style={{ color: "#fff", padding: 5, fontSize: 15 }}>
          {/* {item.message} */}
          {item?.msg || item?.content}
        </Text>
        {/* status */}
        <View
          style={{
            height: 15,
            justifyContent: "flex-end",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12, marginRight: 10 }}>
            {isToday(item?.date)
              ? fromNowFormat(item?.date)
              : formatAMPM(new Date(item?.date))}
          </Text>
        </View>
      </View>
    </>
  );
};

export default TextMsg;
