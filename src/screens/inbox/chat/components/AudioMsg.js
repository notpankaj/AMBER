import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SoundPlayer from "react-native-sound-player";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useSelector } from "react-redux";

// item.attachment from socket
// from api

const AudioMsg = ({ item }) => {
  const { auth } = useSelector((s) => s);

  let _onFinishedPlayingSubscription = useRef(null).current;
  let _onFinishedLoadingSubscription = useRef(null).current;
  let _onFinishedLoadingFileSubscription = useRef(null).current;
  let _onFinishedLoadingURLSubscription = useRef(null).current;

  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false);

  const handlePlaySound = async () => {
    handleAddListeners();
    try {
      const uri = item?.attachment?.attachmentFullUrl || item?.attachment;
      console.log("playing ", uri);
      SoundPlayer.playUrl(uri);
    } catch (error) {
      console.log(error);
    }
  };

  console.log({ isAudioPlaying });

  const stopSoundPaly = async () => {
    SoundPlayer?.stop();
    setIsAudioPlaying(false);
  };

  const handleAddListeners = () => {
    console.log("handleAddListeners()");
    _onFinishedPlayingSubscription = SoundPlayer.addEventListener(
      "FinishedPlaying",
      ({ success }) => {
        console.log("finished playing", success);
        setIsAudioPlaying(false);
        removeListeners();
      }
    );
    _onFinishedLoadingSubscription = SoundPlayer.addEventListener(
      "FinishedLoading",
      ({ success }) => {
        console.log("finished loading", success);
        setIsAudioPlaying(true);
      }
    );
    _onFinishedLoadingFileSubscription = SoundPlayer.addEventListener(
      "FinishedLoadingFile",
      ({ success, name, type }) => {
        console.log("finished loading file", success, name, type);
      }
    );
    _onFinishedLoadingURLSubscription = SoundPlayer.addEventListener(
      "FinishedLoadingURL",
      ({ success, url }) => {
        console.log("finished loading url", success, url);
      }
    );
  };

  const removeListeners = () => {
    console.log("removeListeners()");
    setIsAudioPlaying(false);
    _onFinishedPlayingSubscription?.remove();
    _onFinishedLoadingSubscription?.remove();
    _onFinishedLoadingURLSubscription?.remove();
    _onFinishedLoadingFileSubscription?.remove();
  };

  React.useEffect(() => {
    return () => removeListeners();
  }, []);
  return (
    <View
      style={{
        width: 100,
        height: 60,
        backgroundColor: "lightblue",
        borderRadius: 15,
        margin: 2,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: auth?.user?.id === item?._id ? "flex-start" : "flex-end",
      }}
    >
      <TouchableOpacity
        onPress={() =>
          !isAudioPlaying
            ? handlePlaySound(item?.attachmentFullUrl)
            : stopSoundPaly()
        }
      >
        {isAudioPlaying ? (
          <FontAwesome name="pause" size={30} color="#111" />
        ) : (
          <AntDesign name="play" size={35} color="#222" />
        )}
      </TouchableOpacity>
    </View>
  );
};
export default AudioMsg;
