import {useNavigation} from '@react-navigation/core';
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {api_usersRandom} from '../../../api_services';
import Pulse from '../../../components/Pulse';
import {useRef} from 'react';
// import Carousel from 'react-native-snap-carousel';

import ImageComp from '../../../components/ImageComp';
import SoundPlayer from 'react-native-sound-player';

const IMAGE_ARRAY = [
  'https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg',
  'https://miro.medium.com/max/1400/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg',
];

let _onFinishedPlayingSubscription;
let _onFinishedLoadingSubscription;
let _onFinishedLoadingURLSubscription;
let _onFinishedLoadingFileSubscription;

export const RANDOM_VIEWS = {
  RANDOM_DEFAULT: 'RANDOM_DEFAULT',
  RANDOM_USERLIST: 'RANDOM_USERLIST',
  RANDOM_NEXT_AND_ACCEPT_MODE: 'RANDOM_NEXT_AND_ACCEPT_MODE',
};
const Random = () => {
  const [activeRandomView, setActiveRandomView] = useState(
    RANDOM_VIEWS.RANDOM_DEFAULT,
  );
  const _carousel = useRef();

  const [loading, setLoading] = React.useState(false);

  const navigation = useNavigation();

  const {auth} = useSelector(state => state);

  const handleSearchStart = async () => {
    handlePlayRing();
    hitGetRandomUsers();
  };

  const hitGetRandomUsers = async () => {
    setLoading(true);
    try {
      const payload = {
        token: auth?.accessToken,
        pageSize: 5,
      };
      const res = await api_usersRandom(payload);
      console.log(res);

      if (res?.isSuccess) {
        navigation?.navigate('RandomNextAndAcceptModeScreen', {
          randomData: res?.items[0],
          handleStopRandomBgMusic,
        });
      } else {
        throw new Error(res?.error || 'something went wrong!');
      }
    } catch (error) {
      Alert.alert('Alert', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayRing = async () => {
    try {
      SoundPlayer.playSoundFile('random_bg', 'mp3');
    } catch (error) {
      console.log(error, 'handlePlayRing');
    }
  };

  const handleStopRandomBgMusic = () => {
    SoundPlayer.stop();
    _onFinishedPlayingSubscription.remove();
    _onFinishedLoadingSubscription.remove();
    _onFinishedLoadingURLSubscription.remove();
    _onFinishedLoadingFileSubscription.remove();
  };

  React.useEffect(() => {
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
      handleStopRandomBgMusic();
    };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        alignItems: 'center',
        paddingBottom: 100,
        height: '100%',
      }}
      style={{
        marginBottom: 70,
      }}>
      {activeRandomView === RANDOM_VIEWS.RANDOM_DEFAULT && (
        <>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 30,
              padding: 10,
              height: 80,
            }}></View>
          {/* ACTION BTN */}
          <View
            style={{
              zIndex: -1000,
              marginTop: 50,
            }}>
            <TouchableOpacity onPress={handleSearchStart}>
              <View
                style={[
                  {
                    backgroundColor: true ? 'transparent' : '#49cf76',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                    borderRadius: 150,
                    width: 200,

                    maxWidth: 230,
                    maxHeight: 230,
                    margin: 0,
                    zIndex: -1,
                  },
                ]}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: 'rgba(0,0,0,0.5)',
                    zIndex: 10,
                  }}>
                  {loading ? 'searching....' : 'Tap To Start'}
                </Text>

                <>
                  <Pulse repeat={true} delay={0} />
                  <Pulse repeat={true} delay={1000} />
                  <Pulse repeat={true} delay={2000} />
                  <Pulse repeat={true} delay={3000} />
                </>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('RandomUsersScreen', {
                handleStopRandomBgMusic,
              });
            }}
            style={{
              width: '100%',
              height: 150,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingLeft: 10,
              position: 'absolute',
              bottom: 15,
              right: 15,
            }}>
            <Image
              style={{
                width: 70,
                height: 70,
                position: 'absolute',
                top: -25,
                right: 5,
              }}
              source={require('../../../assets/icons/AmberClubRandomIcon.png')}
              resizeMode="contain"
            />
            <View
              style={{
                width: 75,
                height: 75,
                marginRight: 20,
                marginBottom: 20,
                overflow: 'hidden',
                borderRadius: 100,
                borderWidth: 4,
                borderColor: 'rgba(0,0,0,0.1)',
                zIndex: 10,
              }}>
              {/* <Carousel
                autoplay={true}
                loop={true}
                autoplayInterval={100}
                ref={_carousel.current}
                data={IMAGE_ARRAY}
                containerCustomStyle={{
                  borderRadius: 100,
                }}
                slideStyle={{
                  overflow: 'hidden',
                }}
                contentContainerCustomStyle={{
                  overflow: 'hidden',
                }}
                renderItem={({item, index}) => {
                  return (
                    <ImageComp
                      key={`image/${index}`}
                      imageStyles={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 100,
                        alignSelf: 'center',
                      }}
                      URI={item}
                    />
                  );
                }}
                sliderWidth={75}
                itemWidth={75}
              /> */}
            </View>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};
export default Random;
