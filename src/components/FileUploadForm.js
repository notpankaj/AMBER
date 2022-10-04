import React, { useState } from "react";
import {
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
const { width, height } = Dimensions.get("window");
import VideoPlayer from "react-native-video-controls";
import { useSelector } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { BASE_URL } from "../api_services";
export default FileUploadForm = ({
  setIsVideoUploadFormActive,
  setRefresh,
  selectedVideo,
  handlePickVideo,
  setSelectedVideo,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useSelector((state) => state);

  // console.log({ uploadProress });
  const { user, accessToken } = auth;

  console.log({ selectedVideo, isLoading });
  const handleUploadVideo = async () => {
    const formData = new FormData();
    formData.append("video", {
      name: "name.mp4",
      uri: selectedVideo.uri,
      type: "video/mp4",
    });
    console.log(formData);
    setIsLoading(true);
    fetch(`${BASE_URL}/users/uploadStory/${user.id}`, {
      method: "PUT",
      headers: {
        "x-access-token": accessToken,
      },
      body: formData,
    })
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.isSuccess) {
          setRefresh((s) => !s);
          Alert.alert("Succcess", "Video uploaded successfully", [
            {
              text: "OK",
              onPress: () => {
                setIsVideoUploadFormActive(false);
                handleCloseForm();
              },
            },
          ]);
        }
      })
      .catch((err) => {
        Alert.alert("Failed", err.message || "failed to upload video");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  };

  const handleCloseForm = () => {
    setSelectedVideo(null);
    setIsVideoUploadFormActive(false);
  };

  return (
    <View
      style={{
        position: "absolute",
        width: width,
        height: height,
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      <View
        style={{
          width: "100%",
          position: "absolute",
          top: 10,
          backgroundColor: "#000",
          flexDirection: "row",
          paddingHorizontal: 20,
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => handleCloseForm()}>
          <FontAwesome name={"close"} size={24} color="#FFF" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#FFF",
            marginLeft: 10,
          }}
        >
          New Video
        </Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity
            style={{ width: 60 }}
            onPress={() => {
              handleUploadVideo();
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  color: "#FFF",
                  marginLeft: 10,
                }}
              >
                Next
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          width: "100%",
          height: "90%",
          marginTop: 10,
        }}
      >
        {selectedVideo ? (
          <VideoPlayer
            source={selectedVideo}
            disableFullscreen={true}
            disableSeekbar={true}
            disableVolume={true}
            disableBack={true}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 300,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={handlePickVideo}
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="upload-cloud" color="black" size={100} />

              <Text>Choose a video..</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View
        style={{
          marginVertical: 10,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100,
          position: "absolute",
          bottom: 50,
        }}
      >
        {selectedVideo && (
          <TouchableOpacity
            onPress={handlePickVideo}
            style={{
              borderRadius: 50,
              height: 40,
              width: 40,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="upload" size={25} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
