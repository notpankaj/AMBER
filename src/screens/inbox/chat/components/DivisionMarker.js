import React from "react";
import { Text, View } from "react-native";
import { formNowDateMarker, willAddDateMarker } from "../../../../utils/helper";

const DivisionMarker = ({ prevDate, currentDate }) => {
  const [markerText, setMarkerText] = React.useState("");
  React.useLayoutEffect(() => {
    if (prevDate && currentDate) {
      setMarkerText(
        formNowDateMarker(willAddDateMarker(prevDate, currentDate))
      );
    }
  }, []);

  if (markerText) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            backgroundColor: "orange",
            color: "white",
            fontSize: 10,
            borderRadius: 10,
            paddingHorizontal: 5,
            paddingVertical: 1,
          }}
        >
          {markerText}
        </Text>
      </View>
    );
  } else {
    return null;
  }
};

export default DivisionMarker;
