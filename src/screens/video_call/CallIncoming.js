import React, {useEffect, useState, useRef} from 'react';
import {Image, View, Dimensions, Text, Alert} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {END_VIDEO_CALL} from '../../redux/reducers/actionTypes';
import SocketIOClient from 'socket.io-client';
import {BASE_URL, SOCKET_URL} from '../../api_services';
import {useNavigation} from '@react-navigation/core';
import moment from 'moment';
import SoundPlayer from 'react-native-sound-player';
const {width, height} = Dimensions.get('screen');

let _onFinishedPlayingSubscription;
let _onFinishedLoadingSubscription;
let _onFinishedLoadingFileSubscription;
let _onFinishedLoadingURLSubscription;

const CallIncoming = ({route}) => {
  console.log(route, 'FROM CALL INCOMING');

  console.log(route, 'FROM CALL INCOMING');
  const {notificationData} = route.params;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {auth, call} = useSelector(state => state);
  const socketRef = useRef(null);

  const hitHistoryUpdate = async () => {
    console.log('HITTING HISTORY UPDATE');
    const url = `${BASE_URL}/history/update/${notificationData?.data?.historyId}`;
    const payload = {
      duration: '00:00:00',
      time: moment().format('h:mm:ss a'),
    };
    console.log({url, payload});
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': auth?.accessToken,
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(res => {
        console.log(res, 'hitHistoryUpdate');
        if (res.isSuccess) {
        } else {
          console.log(res);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const hitAcceptCallSocket = () => {
    console.log('HITTING acceptCall  SOCKET');

    let data;
    if (notificationData?.withSocket) {
      data = {Id: notificationData?.data?.channelName};
    } else {
      data = {Id: notificationData?.channelName};
    }
    socketRef.current?.emit('acceptCall', data);
  };
  const hitCallRejectSocket = () => {
    console.log('HITTING rejected  SOCKET');

    let data;
    if (notificationData?.withSocket) {
      data = {to: notificationData?.data?.channelName};
    } else {
      data = {to: notificationData?.channelName};
    }

    socketRef.current?.emit('rejected', data);
  };

  const handleAcceptIncomingCall = () => {
    handleUmount();
    console.log();
    // picking Call with socket or  notifiactiondata
    hitAcceptCallSocket();
    if (notificationData?.withSocket) {
      const paramData = {
        api_uid: notificationData?.data?.userId,
        api_agora_token: notificationData?.data?.token,
        channel_id: notificationData?.data?.channelName,
        call_type: 'RECIVER',
        call_mode: 'NORMAL',
        callingToUserId: null,
        call_rate: notificationData?.data?.popularCallrate
          ? notificationData?.data?.popularCallrate
          : notificationData?.data?.callRate,
        historyId: notificationData?.data?.historyId,
      };
      console.log(paramData, 'paramData---1', notificationData);
      navigation.navigate('LiveVideoCall', paramData);
    } else {
      const paramData = {
        api_uid: notificationData?.userId,
        api_agora_token: notificationData.token,
        channel_id: notificationData.channelName,
        call_type: 'RECIVER',
        call_mode: 'NORMAL',
        callingToUserId: null,
        call_rate: notificationData?.popularCallrate
          ? notificationData?.popularCallrate
          : notificationData?.callRate,
        historyId: notificationData?.historyId,
      };
      console.log(paramData, 'paramData--2', notificationData);
      navigation.navigate('LiveVideoCall', paramData);
    }
  };
  const {latestNotification} = useSelector(state => state.notification);

  const handleDeclineIncomingCall = async () => {
    //new
    hitCallRejectSocket();

    //old
    socketRef.current.emit('call-decline');
    console.log('TRIGGER CALL DECLINE CALL SOCKET');
    await hitHistoryUpdate();
    console.log('TRIGGER END CALL');
    navigation.navigate('Home');
    dispatch({type: END_VIDEO_CALL});
    socketRef.current.disconnect();
  };

  const handleEndCall = () => {
    //  make socket connection
    socketRef.current = SocketIOClient(SOCKET_URL, {
      transports: ['websocket'],
      query: {
        token: auth?.accessToken,
      },
    });
    console.log({socketRef});
    // listen for socket errors
    socketRef.current.on('oops', oops => console.log({oops}));
    //listen for call close
    console.log('listen for call close', socketRef);
    socketRef.current.on('close', data => {
      console.log(data, 'socket close Call');
      Alert.alert('Video Call', 'Call Is Closed by other User!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    });
  };

  useEffect(() => {
    handleEndCall();
    () => socketRef?.current?.disconnect();
  }, []);

  const handlePlayRing = async () => {
    try {
      SoundPlayer.playSoundFile('ring1', 'wav');
    } catch (error) {
      console.log(error, 'handlePlayRing');
    }
  };

  const handleUmount = () => {
    SoundPlayer.stop();
    _onFinishedPlayingSubscription.remove();
    _onFinishedLoadingSubscription.remove();
    _onFinishedLoadingURLSubscription.remove();
    _onFinishedLoadingFileSubscription.remove();
  };
  React.useEffect(() => {
    handlePlayRing();

    _onFinishedPlayingSubscription = SoundPlayer.addEventListener(
      'FinishedPlaying',
      ({success}) => {
        handlePlayRing();
        console.log('finished playing', success);
      },
    );
    _onFinishedLoadingSubscription = SoundPlayer.addEventListener(
      'FinishedLoading',
      ({success}) => {
        console.log('finished loading', success);
      },
    );
    _onFinishedLoadingFileSubscription = SoundPlayer.addEventListener(
      'FinishedLoadingFile',
      ({success, name, type}) => {
        console.log('finished loading file', success, name, type);
      },
    );
    _onFinishedLoadingURLSubscription = SoundPlayer.addEventListener(
      'FinishedLoadingURL',
      ({success, url}) => {
        console.log('finished loading url', success, url);
      },
    );

    return () => {
      handleUmount();
    };
  }, []);

  return (
    <View
      style={{
        width: width,
        height: height,
      }}>
      {/* bg start */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fG1vZGVsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
        }}
        style={{
          width: width,
          height: height,
          resizeMode: 'cover',
          opacity: 0.8,
          zIndex: -69,
        }}
      />
      {/* bg end*/}

      {/* Text Start */}

      <View
        style={{
          position: 'absolute',
          top: 200,
          width: '100%',
        }}>
        <Text
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#fff',
          }}>
          {latestNotification?.data?.name || 'unknow'} is calling...
        </Text>
      </View>
      {/* Text End */}

      {/* Call Btn Start */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          width: 300,
          position: 'absolute',
          bottom: 200,
          width: '100%',
        }}>
        <TouchableOpacity
          style={{
            width: 80,
            height: 80,
            borderRadius: 50,
            backgroundColor: '#f23637',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 1,
          }}
          onPress={() => handleDeclineIncomingCall()}>
          <FontAwesome name="close" size={35} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 80,
            height: 80,
            borderRadius: 50,
            backgroundColor: '#49cf76',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 1,
          }}
          onPress={() => handleAcceptIncomingCall()}>
          <Ionicons name="call" size={35} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Call Btn End */}
    </View>
  );
};
export default CallIncoming;
