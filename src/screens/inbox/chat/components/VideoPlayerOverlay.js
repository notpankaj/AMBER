import React from "react";
import { TouchableOpacity, Text, Dimensions, View } from "react-native";
import VideoPlayer from "react-native-video-controls";
import Fontisto from "react-native-vector-icons/Fontisto";
const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

const VideoPlayerOverlay = ({
  setVideoPlayerOverlayUri,
  videoPlayerOverlayUri,
}) => {
  console.log(videoPlayerOverlayUri, "video is playing");
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
        <VideoPlayer
          source={{ uri: videoPlayerOverlayUri }}
          videoStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
          style={{
            width: "100%",
            backgroundColor: "transparent",
          }}
          disableTimer={false}
          disableBack={true}
          disableVolume={true}
          disableSeekbar={true}
          disablePlayPause={true}
          disableFullscreen={true}
          toggleResizeModeOnFullscreen={false}
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
          onPress={() => setVideoPlayerOverlayUri(null)}
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
export default VideoPlayerOverlay;
