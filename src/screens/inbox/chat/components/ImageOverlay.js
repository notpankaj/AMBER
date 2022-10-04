import React from "react";
import { TouchableOpacity, Text, Dimensions, View, Image } from "react-native";
import Fontisto from "react-native-vector-icons/Fontisto";
import ImageComp from "../../../../components/ImageComp";
const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

const ImageOverlay = ({ setImageOverlayUri, imageOverlayUri }) => {
  return (
    <View
      style={{
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: "rgba(0,0,0,0.8)",
        position: "absolute",
        top: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <ImageComp
          URI={imageOverlayUri}
          imageStyles={{
            width: "100%",
            height: "100%",
          }}
          resizeMode="contain"
        />
      </View>
      <View
        style={{
          width: WIDTH,
          height: 80,
          position: "absolute",
          bottom: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => setImageOverlayUri(null)}
          style={{
            width: 50,
            height: 50,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 100,
          }}
        >
          <Fontisto name="close" size={30} color={"#fff"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default ImageOverlay;
