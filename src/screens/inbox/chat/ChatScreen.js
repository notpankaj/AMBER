import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  PermissionsAndroid,
  Pressable,
  Dimensions,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Spin from 'react-native-spinkit';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import {
  api_blockUser,
  api_sendChatAttachments,
  api_userReport,
  generate_rtcToken,
  SOCKET_URL,
} from '../../../api_services';
import MyLoader from '../../../components/MyLoader';
import {useDispatch, useSelector} from 'react-redux';
import SocketIOClient from 'socket.io-client';
import {
  ADD_CHAT_STORAGE,
  CHAT_REDUCER_REFRESH,
  DESTORY_CHAT_STORAGE,
} from '../../../redux/reducers/actionTypes';
import {getOldChat} from '../../../redux/actions/chat.actions';
import DefaultImage from '../../../components/DefaultImage';
import GiftModal from '../../../components/GiftModal';
import ActionSheet, {SheetManager} from 'react-native-actions-sheet';
import {createRef} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ReportUser from '../../../components/ReportUser';
import ImageComp from '../../../components/ImageComp';
import VideoPlayerOverlay from './components/VideoPlayerOverlay';
import AudioMsg from './components/AudioMsg';
import ImageOverlay from './components/ImageOverlay';

const audioSet = {
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
  AVNumberOfChannelsKeyIOS: 2,
  AVFormatIDKeyIOS: AVEncodingOption.aac,
};

const {width, height} = Dimensions.get('window');

const ChatHeader = ({
  navigation,
  name,
  avatar,
  otherUserID,
  handldeSheet,
  handleReportUserSheet,
}) => {
  console.log(otherUserID, 'otherUserID - ChatHeader');
  const [isLoading, setIsLoading] = useState(false);
  const {auth, coin} = useSelector(state => state);
  const socketRef = useRef(null);
  const hitCallUserSocket = () => {
    socketRef.current = SocketIOClient(SOCKET_URL, {
      transports: ['websocket'],
      query: {
        token: auth?.accessToken,
      },
    });
    const dataObj = {
      channelName: auth?.user?.id,
      receiverId: otherUserID,
      callerId: auth?.user?.id,
      username: auth?.user?.username,
    };
    socketRef.current.emit('callUser', dataObj);
    console.log('::::::::::::::::CALL USER EMITTED  with', dataObj);
  };

  const getTokenForVideoCall = async () => {
    setIsLoading(true);
    try {
      const response = await generate_rtcToken({
        channelId: auth?.user?.id,
        authToken: auth?.accessToken,
        isPublisher: true,
      });

      if (response.isSuccess && response.statusCode === 200) {
        console.log(response, 'generate_rtcToken');
        const api_uid = response.data.userId;
        const api_agora_token = response.data.token;
        const channel_id = auth?.user?.id;
        const call_rate = response?.data?.rate;

        if (api_uid && api_agora_token && channel_id) {
          hitCallUserSocket();
          navigation.navigate('LiveVideoCall', {
            api_uid,
            api_agora_token,
            channel_id,
            call_type: 'CALLER',
            call_mode: 'NORMAL',
            callingToUserId: otherUserID,
            call_rate,
          });
        }
      } else {
        Alert.alert('Error', 'failed to generate agora token');
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'failed to generate agora token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoCallPress = () => {
    // for female
    if (auth?.user?.gender === 'female') {
      getTokenForVideoCall();
      return;
    }

    // for male
    if (coin?.currectCoin > 59) {
      getTokenForVideoCall();
    } else {
      Alert.alert('Alert', 'you dont have enough coin to call,', [
        {
          text: 'Buy Now',
          onPress: () => navigation.navigate('Shop'),
          style: 'cancel',
        },
        {
          text: 'Later',
          onPress: () => {},
          style: 'cancel',
        },
      ]);
    }
  };

  return (
    <View
      style={{
        width: '100%',
        height: 70,
        borderBottomColor: 'rgba(0,0,0,0.3)',
        borderBottomWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <TouchableOpacity onPress={() => navigation.pop()}>
        <Icon
          name="ios-arrow-back"
          size={40}
          style={{
            paddingHorizontal: 10,
            marginTop: 5,
          }}
          color="#555"
        />
      </TouchableOpacity>

      {avatar ? (
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 50,
          }}
          source={{
            uri: avatar,
          }}
        />
      ) : (
        <DefaultImage
          style={{
            width: 50,
            height: 50,
            borderRadius: 50,
          }}
          iconSize={50}
          color={'#555'}
        />
      )}
      <View style={{flex: 1, padding: 10}}>
        <Text
          style={{fontSize: 20, fontWeight: 'bold', color: 'rgba(0,0,0,0.6)'}}>
          {name || 'no name'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: 80,
          justifyContent: 'space-evenly',
        }}>
        <TouchableOpacity onPress={() => handleVideoCallPress()}>
          <FontAwesome
            name="video-camera"
            style={{marginTop: 1}}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handldeSheet(true);
          }}>
          <Entypo
            name="dots-three-vertical"
            size={20}
            style={{marginTop: 1}}
            color={'gray'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

let audioRecorderPlayer;
const ChatForm = ({
  sendChatMsg,
  fireTypingEvent,
  handleSendGift,
  otherUserID,
  handldeSheet2,
  handleFileAudioSend,
  sendAudioLoading,
}) => {
  const [message, setMessage] = useState('');
  const [isGiftModalVisible, setIsGiftModalVisible] = useState(false);

  const [recordSecs, setRecordSecs] = React.useState(null);
  const [recordTime, setRecordTime] = React.useState(null);
  const [currentPositionSec, setCurrentPositionSec] = React.useState(null);
  const [currentDurationSec, setCurrentDurationSec] = React.useState(null);
  const [playTime, setPlayTime] = React.useState(null);
  const [duration, setDuration] = React.useState(null);
  const [isListening, setIsListening] = React.useState(false);
  const [isRecordBoxShow, setIsRecordBoxShow] = React.useState(false);
  const [isPlayingRecordedSound, setIsPlayingRecordedSound] =
    React.useState(false);
  const [recordedVoiceURI, setRecordedVoiceURI] = React.useState(null);
  const [hasRecordedAudioToPlay, setHasRecordedAudioToPlay] =
    React.useState(false);

  const handleSendMessage = () => {
    sendChatMsg(message);
    setMessage('');
  };

  const {auth} = useSelector(state => state);

  const onTyping = () => {
    fireTypingEvent(true);
  };

  const toggleGiftModal = bool => {
    setIsGiftModalVisible(bool);
  };

  useEffect(() => {
    if (message) fireTypingEvent(true);
  }, [message]);

  const askForPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        console.log('write external stroage', grants);
        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
  };
  const audioRecorderInit = () => {
    audioRecorderPlayer = new AudioRecorderPlayer();
    console.log(audioRecorderPlayer);
  };

  const onStartRecord = async () => {
    console.log('onStartRecord');
    setRecordedVoiceURI(null);
    setHasRecordedAudioToPlay(false);
    audioRecorderInit();
    setIsRecordBoxShow(true);
    setIsListening(true);
    const result = await audioRecorderPlayer.startRecorder(null, audioSet);
    audioRecorderPlayer.addRecordBackListener(e => {
      setRecordSecs(e.currentPosition);
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      return;
    });
    console.log(result);
  };

  const onStopRecord = async () => {
    console.log('onStopRecord');
    setIsListening(false);
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      await audioRecorderPlayer.removeRecordBackListener();
      setRecordSecs(0);
      console.log(result);

      // send Audio directly
      handleFileAudioSend({
        type: 'audio',
        file: {uri: result},
      });
    } catch (error) {
      console.log('error in onStopRecord', error?.message);
    }
    // setHasRecordedAudioToPlay(true);
    // setRecordedVoiceURI(result);
  };

  const onStartPlay = async () => {
    console.log('onStartPlay');
    setIsPlayingRecordedSound(true);
    const msg = audioRecorderPlayer.startPlayer();
    console.log(msg);
    audioRecorderPlayer.addPlayBackListener(e => {
      setCurrentPositionSec(e.currentPosition);
      setCurrentDurationSec(e.duration);
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
      return;
    });
  };

  const onPausePlay = async () => {
    console.log('onPausePlay');
    setHasRecordedAudioToPlay(false);
    await audioRecorderPlayer.pausePlayer();
  };

  const onStopPlay = async () => {
    setHasRecordedAudioToPlay(false);
    setIsPlayingRecordedSound(false);
    handleCloseRecordBox();
    console.log('onStopPlay');
    await audioRecorderPlayer.stopPlayer();
    await audioRecorderPlayer.removePlayBackListener();
  };

  const handldleMicPress = () => {
    console.log('OUT PRESS');
    askForPermission();
    onStartRecord();
  };

  const handleCloseRecordBox = () => {
    console.log('OUT PRESS');
    setIsPlayingRecordedSound(false);
    setIsRecordBoxShow(false);
    setHasRecordedAudioToPlay(false);
    onStopRecord();
  };
  return (
    <>
      {isGiftModalVisible && (
        <GiftModal
          otherUserID={otherUserID}
          toggleGiftModal={toggleGiftModal}
          handleSendGift={handleSendGift}
        />
      )}
      {/* RECORD BOX */}
      {isRecordBoxShow && (
        <View
          style={{
            alignSelf: 'center',
            height: 200,
            width: 200,
            backgroundColor: 'rgba(223, 175, 81, 0.8)',
            padding: 10,
            margin: 5,
            borderRadius: 100,

            position: 'absolute',
            bottom: height / 2,
          }}>
          {/* <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text>Recording Audio</Text>
            <TouchableOpacity onPress={handleCloseRecordBox}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View> */}

          <View
            style={{
              width: '100%',
              height: 150,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {isListening && (
              <View>
                <Spin
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  type="Bounce"
                  isVisible={true}
                  color="#fff"
                  size={100}></Spin>
                <Ionicons
                  style={{
                    position: 'absolute',
                    top: 32,
                    left: 32,
                  }}
                  name="ios-mic"
                  size={39}
                  color="rgba(0,0,0,0.7)"
                />
              </View>
            )}
            <Text style={{fontSize: 30, color: '#222'}}>{recordTime}</Text>

            {/* {isListening && (
              <TouchableOpacity
                onPress={() => {
                  onStopRecord();
                }}
              >
                <FontAwesome name="hand-stop-o" size={35} color="gray" />
              </TouchableOpacity>
            )} */}
          </View>
        </View>
      )}
      {/* RECORD BOX END */}
      {/* // * str  */}
      {hasRecordedAudioToPlay && (
        <View>
          {isPlayingRecordedSound && (
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#444',
                  fontSize: 18,
                  letterSpacing: 1,
                  fontWeight: 'bold',
                }}>
                {`${playTime}  /  ${duration}`}
              </Text>
            </View>
          )}
          {hasRecordedAudioToPlay && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                backgroundColor: 'rgba(173, 170, 170, 0.4)',
                borderRadius: 10,
                margin: 5,
                marginBottom: 10,
                height: 60,
                width: width - 10,
              }}>
              <TouchableOpacity
                onPress={onStopPlay}
                style={{
                  margin: 6,
                  backgroundColor: 'rgba(226, 74, 74, 0.6)',
                  width: 45,
                  height: 45,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 100,
                }}>
                <MaterialCommunityIcons
                  name="delete-empty"
                  size={24 + 5}
                  color={'rgba(0,0,0,0.6)'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onStartPlay}
                style={{
                  margin: 6,
                  width: 45,
                  height: 45,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 100,
                  backgroundColor: 'rgba(22, 22, 22, 0.8)',
                }}>
                <Entypo name="controller-play" size={24} color={'#fff'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleFileAudioSend({
                    type: 'audio',
                    file: {uri: recordedVoiceURI},
                  });
                  // Alert.alert("Will Send this", recordedVoiceURI);
                }}
                style={{
                  margin: 6,
                  width: 45,
                  height: 45,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 100,
                  backgroundColor: 'rgba(93, 226, 74, 0.8)',
                }}>
                <Ionicons name="ios-send" size={20} color={'rgba(0,0,0,0.6)'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      {/* // * nd  */}
      <View
        style={{
          width: '100%',
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <TouchableOpacity
          style={{
            marginLeft: 10,
            backgroundColor: 'rgba(0,0,0,0.1)',
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
          }}
          onPress={() => {
            handldeSheet2(true);
          }}>
          <Ionicons name="ios-camera" size={20} color="gray" />
        </TouchableOpacity>

        {/* input start */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: 10,
            alignItems: 'center',
            marginHorizontal: 15,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: 'gray',
          }}>
          {auth?.user?.gender === 'male' && (
            <TouchableOpacity
              style={{
                marginLeft: 5,
                backgroundColor: 'rgba(0,0,0,0.1)',
                width: 35,
                height: 35,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
              }}
              onPress={() => toggleGiftModal(!isGiftModalVisible)}>
              <Ionicons name="gift" size={20} color="gray" />
            </TouchableOpacity>
          )}
          <TextInput
            style={{
              marginHorizontal: 10,
              paddingRight: 12,
              color: '#000',
            }}
            onFocus={() => {
              console.log('focus received');
              onTyping();
            }}
            placeholderTextColor="#555"
            onBlur={() => console.log('focus lost')}
            value={message}
            onChangeText={value => setMessage(value.trimStart())}
            placeholder="Type Something..."
            onSubmitEditing={handleSendMessage}
          />
        </View>
        {/* input end */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginRight: 15,
          }}>
          {message.length ? (
            <TouchableOpacity
              onPress={handleSendMessage}
              style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                width: 35,
                height: 35,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
              }}>
              <Ionicons name="ios-send" size={22} color="gray" />
            </TouchableOpacity>
          ) : sendAudioLoading ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Pressable
              onPressIn={handldleMicPress}
              onPressOut={handleCloseRecordBox}
              style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                width: 35,
                height: 35,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 100,
              }}>
              <FontAwesome name="microphone" size={24} color="gray" />
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
};

const MessageStatus = ({status}) => {
  return (
    <View style={{width: 20}}>
      {status === 'SEND' && (
        <Ionicons name="checkmark" size={18} color="#fff" />
      )}
      {status === 'RECIVED' && (
        <Ionicons name="checkmark-done" size={18} color="#fff" />
      )}
      {status === 'SEEN' && (
        <Ionicons name="checkmark-done" size={18} color="#03f6c5" />
      )}
    </View>
  );
};

const ChatMessage = ({
  item,
  index,
  setVideoPlayerOverlayUri,
  setImageOverlayUri,
}) => {
  const [status, setStatus] = useState('SEND');
  const [isSideLeft, setIsSideLeft] = useState(false);

  const {user} = useSelector(state => state.auth);

  useEffect(() => {
    if (user?.id !== item?.msgFrom && user?.id !== item?.sender) {
      setIsSideLeft(true);
    }
  }, [item]);

  if (item?.attachment?.filetype === 'audio' || item?.fileType === 'audio') {
    return <AudioMsg item={item} />;
  }
  if (item?.attachment?.filetype === 'image' || item?.fileType === 'image') {
    return (
      <TouchableOpacity
        onPress={() =>
          setImageOverlayUri(
            `${item?.attachment?.fileUrl || item?.attachment}${
              item?.attachment?.file || ''
            }`,
          )
        }
        style={{
          marginVertical: 15,
          width: 200,
          height: 200,
          alignSelf: item?.msgFrom === user?.id ? 'flex-end' : 'flex-start',
        }}>
        {isSideLeft ? (
          <Octicons
            style={{
              position: 'absolute',
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
              position: 'absolute',
              zIndex: -1,
              top: -22,
              right: 0,
            }}
            name="triangle-left"
            size={50}
            color="#23a12f"
          />
        )}
        <ImageComp
          URI={`${item?.attachment?.fileUrl || item?.attachment}${
            item?.attachment?.file || ''
          }`}
          imageStyles={{
            width: '100%',
            height: '100%',
            backgroundColor: isSideLeft ? '#222' : '#23a12f',
            padding: 2,
            borderRadius: 5,
          }}
        />
      </TouchableOpacity>
    );
  }

  if (item?.thumbnail || item?.attachment?.filetype === 'video') {
    return (
      <View
        style={{
          marginVertical: 15,
          width: 200,
          height: 200,
          alignSelf: item?.msgFrom === user?.id ? 'flex-end' : 'flex-start',
          borderRadius: 5,
        }}>
        {isSideLeft ? (
          <Octicons
            style={{
              position: 'absolute',
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
              position: 'absolute',
              zIndex: -1,
              top: -22,
              right: 0,
            }}
            name="triangle-left"
            size={50}
            color="#23a12f"
          />
        )}
        <TouchableOpacity
          style={{position: 'relative'}}
          onPress={() => {
            let URI;
            if (item?.attachment?.fileUrl) {
              URI = `${item?.attachment?.fileUrl}${item?.attachment?.file}`;
            } else {
              URI = item?.attachment;
            }
            setVideoPlayerOverlayUri(URI);
          }}>
          <ImageComp
            URI={`${item?.attachment?.fileUrl || item?.thumbnail}${
              item?.attachment?.thumbnail || ''
            }`}
            imageStyles={{
              width: '100%',
              height: '100%',
              backgroundColor: isSideLeft ? '#222' : '#23a12f',
              padding: 2,
              borderRadius: 5,
            }}
          />
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 100,
              position: 'absolute',
              top: 70,
              left: 70,
            }}>
            <Ionicons name="play-circle-outline" size={60} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  if (!item?.msg?.trim()) {
    return (
      <View
        style={{
          width: '100%',
        }}>
        <View
          style={{
            alignSelf: isSideLeft ? 'flex-start' : 'flex-end',
            // backgroundColor: item?.msgFrom === user.id ? '#222' : '#23a12f',
            padding: 5,
            width: 80,
            maxWidth: 80,
            borderRadius: 10,
            marginVertical: 10,
            marginTop: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {/* <Text>
        {item.gift.title}
      </Text> */}
          {item?.gift?.iconUrl ? (
            <ImageComp
              imageContainerStyles={{
                backgroundColor: 'transparent',
              }}
              imageStyles={{
                width: 75,
                height: 75,
              }}
              URI={item?.gift?.iconUrl}
            />
          ) : item?.gift?.icon ? (
            <ImageComp
              imageContainerStyles={{
                backgroundColor: 'transparent',
              }}
              imageStyles={{
                width: 75,
                height: 75,
              }}
              URI={item?.gift?.icon}
            />
          ) : (
            <Image
              style={{
                width: 75,
                height: 75,
              }}
              source={require('../../../assets/icons/gifts/gift1.png')}
            />
          )}
        </View>
      </View>
    );
  } else {
    return (
      <View
        style={{
          backgroundColor: isSideLeft ? '#222' : '#23a12f',
          alignSelf: isSideLeft ? 'flex-start' : 'flex-end',
          padding: 5,
          width: '60%',
          maxWidth: 300,
          borderRadius: 10,
          marginVertical: 10,
          marginTop: 15,
        }}>
        {/* messageTIP */}
        {isSideLeft ? (
          <Octicons
            style={{
              position: 'absolute',
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
              position: 'absolute',
              zIndex: -1,
              top: -22,
              right: 0,
            }}
            name="triangle-left"
            size={50}
            color="#23a12f"
          />
        )}

        <Text style={{color: '#fff', padding: 5, fontSize: 15}}>
          {/* {item.message} */}
          {item?.msg || item?.content}
        </Text>
        {/* status */}
        <View
          style={{
            height: 15,
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Text style={{color: '#fff', fontSize: 12, marginRight: 10}}>
            {item?.createdAt
              ? new Date(item?.createdAt).toLocaleTimeString()
              : null}
          </Text>
          {/* <MessageStatus
            // status={"SEND"}
            // status={"RECIVED"}
            // status={"SEEN"}
            status={status}
          /> */}
        </View>
      </View>
    );
  }
};

const ChatBox = ({
  chat,
  fileToSend,
  handleGetOldChat,
  handleFileSend,
  setFileToSend,
  conversationId,
  triggerScrollToEnd,
  isOtherUserTyping,
  fileSendLoading,
  setVideoPlayerOverlayUri,
  setImageOverlayUri,
}) => {
  const chatListRef = useRef(null);

  const {error, loading} = useSelector(state => state.chat);

  const dispatch = useDispatch();
  const scrollChatToEnd = () => {
    chatListRef?.current?.scrollToEnd();
  };
  const loadMoreOldChat = () => {
    handleGetOldChat(conversationId);
  };

  useEffect(() => {
    scrollChatToEnd();
  }, [triggerScrollToEnd]);

  useEffect(() => {
    scrollChatToEnd();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error || 'something went wrong!');
      dispatch({type: CHAT_REDUCER_REFRESH});
    }
  }, [error]);

  console.log({fileToSend}, 'fileToSend');
  return (
    <View
      style={{
        flex: 1,
        margin: 10,
      }}>
      {fileToSend && (
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            width: '100%',
            position: 'absolute',
            zIndex: 10,
            bottom: 0,
            flexDirection: 'row',
            padding: 10,
            borderRadius: 10,
          }}>
          <Image
            source={fileToSend?.file}
            resizeMode="cover"
            style={{
              width: 150,
              height: 120,
              borderRadius: 10,
            }}
          />
          <View
            style={{
              flex: 1,
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 15,
                alignItems: 'center',
              }}
              onPress={() => handleFileSend(fileToSend)}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 100,
                }}>
                <Ionicons name="send" size={18} color="#000" />
              </View>

              {fileSendLoading ? (
                <ActivityIndicator size={'small'} color="green" />
              ) : (
                <Text
                  style={{
                    color: '#222',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginLeft: 10,
                  }}>
                  Send
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                width: '100%',
                padding: 15,
                alignItems: 'center',
              }}
              onPress={() => setFileToSend(null)}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 100,
                }}>
                <Ionicons name="close" size={18} color="#000" />
              </View>
              <Text
                style={{
                  marginLeft: 10,
                  color: '#222',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={{width: '100%', height: '100%'}}>
          <MyLoader
            visible={true}
            text={'getting older chat'}
            bgColor={'transparent'}
          />
        </View>
      ) : null}

      {/* {chat.length && !loading && !error ? ( */}
      <FlatList
        ref={chatListRef}
        // onContentSizeChange={() => chatListRef.current.scrollToEnd()}
        // onLayout={() => chatListRef.current.scrollToEnd()}
        data={chat}
        keyExtractor={(item, idx) => item?._id || idx}
        numColumns={1}
        ListEmptyComponent={() => (
          <Text style={{textAlign: 'center', color: '#555'}}>
            send message to start conversation
          </Text>
        )}
        renderItem={({item, index}) => (
          <ChatMessage
            setImageOverlayUri={setImageOverlayUri}
            setVideoPlayerOverlayUri={setVideoPlayerOverlayUri}
            index={index}
            item={item}
          />
        )}
        onScroll={event => {
          if (event.nativeEvent.contentOffset.y === 0) {
            loadMoreOldChat();
          }
        }}
      />
      {/* ) : (
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{textAlign: 'center'}}>
            send msg to start conversation
          </Text>
        </View>
      )} */}

      {isOtherUserTyping ? (
        <View
          style={{
            padding: 5,
            position: 'absolute',
            bottom: 0,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              textAlign: 'center',
              backgroundColor: '#444',
              width: 70,
              borderRadius: 20,
              padding: 5,
              fontSize: 12,
              color: '#FFF',
            }}>
            typing...
          </Text>
        </View>
      ) : null}
    </View>
  );
};

if (!window.location) {
  window.navigator.userAgent = 'ReactNative';
}

const REPORT_DATA = [
  {
    icon: 'user',
    title: "I don't like this user",
    color: 'green',
  },
  {
    color: 'pink',
    icon: 'skin',
    title: 'Nuditiy and inappropriate content',
  },
  {
    color: 'gray',
    icon: 'clockcircle',
    title: 'Spam or fraud',
  },
  {
    color: 'green',
    icon: 'notification',
    title: 'Verbal harassment',
  },
  {
    color: 'orange',
    icon: 'exclamationcircleo',
    title: 'Violent content',
  },
  {
    color: 'purple',
    icon: 'warning',
    title: 'Underage',
  },
  {
    color: 'red',
    icon: 'fork',
    title: 'False gender',
  },
];
const ChatScreen = ({navigation, route}) => {
  const {conversationId, otherUserName, otherUserID, otherUserProfileImage} =
    route?.params;
  const {auth, chat} = useSelector(state => state);
  const [sendAudioLoading, setSendAudioLoading] = React.useState(false);
  const userId = auth?.user?.id;
  const {chatStorage, oldChatPageNo} = chat;
  console.log(
    'CONVERSATION ______> ID',
    conversationId,
    conversationIdFromSocket?.current,
  );
  const [triggerScrollToEnd, setTriggerScrollToEnd] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [videoPlayerOverlayUri, setVideoPlayerOverlayUri] = useState(null);
  const [imageOverlayUri, setImageOverlayUri] = useState(null);
  const [fileToSend, setFileToSend] = useState(null);
  const socketRef = useRef();
  const actionSheetRef = createRef();
  const actionSheetRef2 = createRef();

  const [fileSendLoading, setFileSendLoading] = React.useState(false);

  const sheetReportUserRef2 = createRef();
  const conversationIdFromSocket = useRef(null);
  const dispatch = useDispatch();

  const sendChatMsg = msg => {
    console.log(
      msg,
      {
        msg: msg,
        sender: userId,
        msgTo: otherUserID,
        date: Date.now(),
      },
      'sending msg...',
    );
    if (msg && userId) {
      socketRef.current.emit('chat-msg', {
        msg: msg,
        sender: userId,
        msgTo: otherUserID,
        date: Date.now(),
      });
    } else console.log('missing parameter', {msg, userId});
  };

  const hanldeOtherUserTyping = () => {
    setIsOtherUserTyping(true);
    setTimeout(() => setIsOtherUserTyping(false), 2000);
  };

  const listenForMessage = () => {
    socketRef.current.on('chat-msg', data => {
      console.log('chat:', data);
      dispatch({type: ADD_CHAT_STORAGE, payload: data});
      setTriggerScrollToEnd(state => !state);
    });
  };
  const listenForTyping = () => {
    console.log('listing for tyoing');
    socketRef.current.on('typing', event => {
      console.log('typing:', event);
      hanldeOtherUserTyping();
    });
  };
  const fireTypingEvent = bool => {
    console.log('fireTypingEvent', bool);
    if (bool) {
      socketRef?.current?.emit('typing');
    }
  };

  const handleUnmount = () => {
    socketRef.current.on('disconnect', () => {
      console.log('SOCKET DESTROYED');
    });
    socketRef.current.disconnect();
    dispatch({type: DESTORY_CHAT_STORAGE});
  };

  const handleGetOldChat = conversationId => {
    dispatch(
      getOldChat({
        authToken: auth?.accessToken,
        conversationID: conversationId,
        pageNo: oldChatPageNo,
        pageSize: 10,
      }),
    );
  };

  const handleSendGift = gift => {
    const data = {
      msg: ' ',
      sender: userId,
      msgTo: otherUserID,
      date: Date.now(),
      gift,
    };
    console.log('send gift data', data);

    if (gift && userId) {
      socketRef.current.emit('chat-msg', data);
    } else console.log('missing parameter', {gift, userId});
  };

  const handleEmitAudioToChat = url => {
    const data = {
      msgTo: otherUserID,
      roomId: conversationId || conversationIdFromSocket.current,
      date: new Date(),
      attachment: url,
    };
    console.log('emited', data);
    socketRef.current.emit('upload-audio', data);
    setFileToSend(null);
  };
  const handleEmitImageToChat = url => {
    const data = {
      msgTo: otherUserID,
      roomId: conversationId || conversationIdFromSocket.current,
      date: new Date(),
      attachment: url,
    };
    console.log('emited', data);
    socketRef.current.emit('upload-image', data);
    setFileToSend(null);
  };

  const handleEmitVideoToChat = (url, thumbnail) => {
    const data = {
      msgTo: otherUserID,
      roomId: conversationId || conversationIdFromSocket.current,
      date: new Date(),
      attachment: url,
      thumbnail: thumbnail,
    };
    console.log('emited', data);
    socketRef.current.emit('upload-video', data);
    setFileToSend(null);
  };
  // * images
  const handleFileSend = async fileObj => {
    if (fileObj.type === 'video') {
      handleFileVideoSend(fileObj);
      return;
    }
    const formData = new FormData();
    formData.append('attachment', {
      name: fileObj?.file?.fileName,
      type: fileObj?.file?.type,
      base64: fileObj?.file?.base64,
      uri:
        Platform.OS === 'ios'
          ? fileObj?.file?.uri.replace('file://', '')
          : fileObj?.file?.uri,
    });
    formData.append('filetype', 1);
    formData.append('msgFrom', auth?.user?.id);
    formData.append('msgTo', otherUserID);
    formData.append('roomId', conversationIdFromSocket.current);

    const payload = {
      token: auth?.accessToken,
      data: formData,
    };
    console.log(payload);
    setFileSendLoading(true);
    try {
      const res = await api_sendChatAttachments(payload);
      console.log(res, 'res');
      if (res?.isSuccess) {
        handleEmitImageToChat(`${res?.data?.attachment}`);
      } else {
        throw new Error(res?.error || 'failed to upload file');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Alert', error?.message);
    } finally {
      setFileSendLoading(false);
    }
  };
  // * video
  const handleFileVideoSend = async fileObj => {
    const formData = new FormData();
    formData.append('attachment', {
      name: 'name.mp4',
      uri: fileObj?.file?.uri,
      type: 'video/mp4',
    });
    formData.append('filetype', 2);
    formData.append('msgFrom', auth?.user?.id);
    formData.append('msgTo', otherUserID);
    formData.append('roomId', conversationIdFromSocket.current);

    const payload = {
      token: auth?.accessToken,
      data: formData,
    };
    console.log(payload);
    setFileSendLoading(true);
    try {
      const res = await api_sendChatAttachments(payload);
      console.log(res, 'res');
      if (res?.isSuccess) {
        const BASE_URL = res?.message;
        const URL = `${BASE_URL}${res?.data?.attachment}`;
        const THUMB_URL = `${BASE_URL}${res?.data?.thumbnail}`;
        handleEmitVideoToChat(URL, THUMB_URL);
      } else {
        throw new Error(res?.error || 'failed to upload file');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Alert', error?.message);
    } finally {
      setFileSendLoading(false);
    }
  };

  // * audio
  const handleFileAudioSend = async fileObj => {
    console.log(' IN handleFileAudioSend ', fileObj);
    setSendAudioLoading(true);
    const formData = new FormData();
    formData.append('attachment', {
      name: 'name.mp4',
      uri: fileObj?.file?.uri,
      type: 'audio/mp3',
    });
    formData.append('filetype', 3);
    formData.append('msgFrom', auth?.user?.id);
    formData.append('msgTo', otherUserID);
    formData.append(
      'roomId',
      conversationId || conversationIdFromSocket.current,
    );

    const payload = {
      token: auth?.accessToken,
      data: formData,
    };
    console.log(payload);
    setFileSendLoading(true);
    try {
      const res = await api_sendChatAttachments(payload);
      console.log(res, 'res');
      if (res?.isSuccess) {
        ToastAndroid.show('audio sent!', ToastAndroid.SHORT);
        handleEmitAudioToChat(res?.data?.attachment);
      } else {
        throw new Error(res?.error || 'failed to upload file');
      }
    } catch (error) {
      console.log(error);
      ToastAndroid.show(error?.message || 'audio failed!', ToastAndroid.SHORT);
      // Alert.alert("Alert", error?.message);
    } finally {
      setSendAudioLoading(false);
      setFileSendLoading(false);
    }
  };

  const listenForFiles = () => {
    console.log('In fileListener ');
    socketRef.current.on('get-image', data => {
      console.log('------IMAGE');
      console.log('image:', {...data, fileType: 'image'});
      dispatch({
        type: ADD_CHAT_STORAGE,
        payload: {...data, fileType: 'image'},
      });
    });
    socketRef.current.on('get-video', data => {
      console.log('------VIDEO');
      console.log('video:', {...data, fileType: 'video'});
      dispatch({
        type: ADD_CHAT_STORAGE,
        payload: {...data, fileType: 'video'},
      });
    });
    socketRef.current.on('get-audio', data => {
      console.log('------AUDIO');
      console.log('audio:', {...data, fileType: 'audio'});
      dispatch({
        type: ADD_CHAT_STORAGE,
        payload: {...data, fileType: 'audio'},
      });
    });
  };

  useEffect(() => {
    if (conversationId) {
      handleGetOldChat(conversationId);
    }

    socketRef.current = SocketIOClient(SOCKET_URL, {
      transports: ['websocket'],
      query: {
        token: auth.accessToken,
      },
    });

    console.log(socketRef);
    // socketRef.current.emit('set-user-data', userId);
    socketRef.current.emit('set-room', {
      conversationFrom: userId,
      conversationTo: otherUserID,
    });

    socketRef.current.on('oops', err =>
      console.log(err, 'oooooooooooooooooooooo'),
    );
    console.log({socketRef, userId, otherUserID});

    socketRef.current.on('set-room', room => {
      if (!conversationId) {
        console.log(room, 'conversationIdFromSocket');
        conversationIdFromSocket.current = room;
        handleGetOldChat(room);
      }
    });

    listenForMessage();
    listenForTyping();
    listenForFiles();
    return () => {
      handleUnmount();
    };
  }, []);

  const handldeSheet = bool => {
    if (bool) {
      SheetManager.show('sheetChatScreen');
    } else {
      actionSheetRef.current.hide();
    }
  };
  const handldeSheet2 = bool => {
    if (bool) {
      SheetManager.show('sheetUploadFile');
    } else {
      actionSheetRef2.current.hide();
    }
  };

  const requestCameraPermission = async type => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'App Camera Permission',
          message: 'App needs access to your camera ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission given');
        handleShootFormCamera(type);
        return;
      } else {
        console.log('Camera permission denied');
      }
      handleShootFormCamera(type);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleChooseFormGallary = () => {
    launchImageLibrary({
      title: 'choose file to send',
      mediaType: 'mixed',
      includeBase64: true,
    })
      .then(res => {
        const file = res.assets[0];
        console.log(file, 'CHOOSEN');
        if (file?.type?.includes('video')) {
          if (file?.duration > 30) {
            Alert.alert(
              'Alert',
              'please select video less than or equal to :30sec !',
            );
          } else {
            setFileToSend({type: 'video', file});
          }
        } else {
          setFileToSend({type: 'image', file});
        }
      })
      .catch(err => console.log(err));
  };
  const handleShootFormCamera = async type => {
    const res = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    )
      .then(response => {
        console.log(response);
        return response;
      })
      .catch(err => console.log(err));
    console.log(res, 'cm');
    if (res) {
      try {
        const res = await launchCamera(
          {
            mediaType: type,
            includeBase64: true,
            durationLimit: 30,
          },
          response => {
            console.log('Response = ', response);
            if (response.didCancel) {
              console.log('User cancelled video shoot ');
            } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
              Alert.alert(response.customButton);
            } else {
              if (type === 'photo') {
                setFileToSend({file: response?.assets[0], type: 'image'});
              } else {
                setFileToSend({file: response?.assets[0], type: 'video'});
              }
              console.log('response', JSON.stringify(response));
            }
          },
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      requestCameraPermission(type);
    }
  };

  const handleBlockPerson = async () => {
    console.log('REMOVE TEST');

    const bodyData = {
      toUser: otherUserID,
      byUser: auth?.user?.id,
    };
    try {
      const response = await api_blockUser({
        bodyData,
        authToken: auth.accessToken,
      });
      console.log({response});
      if (response.isSuccess && response.statusCode === 200) {
        Alert.alert('Alert', response?.message || 'Blocked!');
      } else {
        throw new Error(response?.error || 'something went wrong!');
      }
    } catch (error) {
      Alert.alert('Alert', error?.message);
    }
  };

  const hanldeBlockUser = () => {
    Alert.alert('Block?', 'are you sure to block this person', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Block',
        onPress: () => handleBlockPerson(),
      },
    ]);
  };

  const handleReportUserSheet = bool => {
    if (bool) {
      SheetManager.show('sheetReportUser2');
    } else {
      sheetReportUserRef2.current.hide();
    }
  };

  const handleReportPress = async text => {
    setReportLoading(true);
    try {
      const payload = {
        token: auth?.accessToken,
        otherUserId: userId,
        userID: auth?.user?.id,
        msg: text,
      };

      const res = await api_userReport(payload);
      console.log(res);
      if (res?.isSuccess) {
        Alert.alert('Alert', 'Your report is submitted!');
      } else {
        throw new Error(res?.error || 'failed to report!');
      }
    } catch (error) {
      Alert.alert('Alert', error?.message);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <View style={{flex: 1, marginBottom: 5}}>
      {reportLoading && (
        <MyLoader
          style={{position: 'absolute'}}
          visible={true}
          text={'Reporting...'}
        />
      )}
      {isReportVisible && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ReportUser
            isReportVisible={isReportVisible}
            setIsReportVisible={setIsReportVisible}
          />
        </View>
      )}
      <ChatHeader
        navigation={navigation}
        name={otherUserName}
        avatar={otherUserProfileImage}
        otherUserID={otherUserID}
        handldeSheet={handldeSheet}
        handleReportUserSheet={handleReportUserSheet}
      />
      <ChatBox
        chat={chatStorage}
        handleGetOldChat={handleGetOldChat}
        conversationId={
          conversationId ? conversationId : conversationIdFromSocket.current
        }
        handleFileSend={handleFileSend}
        setFileToSend={setFileToSend}
        fileToSend={fileToSend}
        fileSendLoading={fileSendLoading}
        triggerScrollToEnd={triggerScrollToEnd}
        isOtherUserTyping={isOtherUserTyping}
        setVideoPlayerOverlayUri={setVideoPlayerOverlayUri}
        setImageOverlayUri={setImageOverlayUri}
      />
      <ChatForm
        sendAudioLoading={sendAudioLoading}
        sendChatMsg={sendChatMsg}
        fireTypingEvent={fireTypingEvent}
        otherUserID={otherUserID}
        handleSendGift={handleSendGift}
        handldeSheet2={handldeSheet2}
        handleFileAudioSend={handleFileAudioSend}
      />
      {videoPlayerOverlayUri && (
        <VideoPlayerOverlay
          videoPlayerOverlayUri={videoPlayerOverlayUri}
          setVideoPlayerOverlayUri={setVideoPlayerOverlayUri}
        />
      )}
      {imageOverlayUri && (
        <ImageOverlay
          setImageOverlayUri={setImageOverlayUri}
          imageOverlayUri={imageOverlayUri}
        />
      )}

      <ActionSheet id="sheetChatScreen" ref={actionSheetRef}>
        <View
          style={{
            height: 100,
          }}>
          <TouchableOpacity
            onPress={() => {
              hanldeBlockUser();
              handldeSheet(false);
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                padding: 10,
                borderBottomWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
              }}>
              Block
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // setIsReportVisible(true);
              handleReportUserSheet(true);
              handldeSheet(false);
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                padding: 10,
                borderBottomWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
              }}>
              Report
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handldeSheet(false)}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              padding: 10,
              fontWeight: 'bold',
            }}>
            Close
          </Text>
        </TouchableOpacity>
      </ActionSheet>
      <ActionSheet id="sheetUploadFile" ref={actionSheetRef2}>
        <View
          style={{
            height: 130,
          }}>
          <TouchableOpacity
            onPress={() => {
              handleShootFormCamera('photo');
              handldeSheet2(false);
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                padding: 10,
                borderBottomWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
              }}>
              Open Photo Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleShootFormCamera('video');
              handldeSheet2(false);
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                padding: 10,
                borderBottomWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
              }}>
              Open Video Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleChooseFormGallary();
              handldeSheet2(false);
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                padding: 10,
                borderBottomWidth: 1,
                borderColor: 'rgba(0,0,0,0.2)',
              }}>
              Choose Form Gallary
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handldeSheet2(false)}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              padding: 10,
              fontWeight: 'bold',
            }}>
            Close
          </Text>
        </TouchableOpacity>
      </ActionSheet>

      <ActionSheet id="sheetReportUser2" ref={sheetReportUserRef2}>
        <View
          style={{
            height: 340,
          }}>
          {REPORT_DATA.map(item => {
            return (
              <TouchableOpacity
                key={item?.title}
                onPress={() => {
                  handleReportPress(item?.title);
                  handleReportUserSheet(false);
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderColor: 'rgba(0,0,0,0.2)',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: 25,
                      height: 25,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginHorizontal: 15,
                    }}>
                    <AntDesign
                      name={item?.icon}
                      size={20}
                      color={item?.color}
                    />
                  </View>
                  <Text
                    style={{
                      textAlign: 'left',
                      fontSize: 16,
                      padding: 12,
                    }}>
                    {item?.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={() => handleReportUserSheet(false)}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              padding: 10,
              fontWeight: 'bold',
            }}>
            Close
          </Text>
        </TouchableOpacity>
      </ActionSheet>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
