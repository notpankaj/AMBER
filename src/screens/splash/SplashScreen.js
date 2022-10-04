import React from 'react';
import {View, StyleSheet} from 'react-native';
import {fromLocalStorage} from '../../utils/helper';
import {useDispatch, useSelector} from 'react-redux';
import {LOAD_PROFILE} from '../../redux/reducers/actionTypes';

const SplashScreen = props => {
  console.log('SPLASH PROPS', props);
  const {navigation, isAuth, route} = props;
  const {setIsSplashActive} = route?.params;
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);

  const checkIfAlreadyLoggedIn = async () => {
    const auth = await fromLocalStorage('auth');
    console.log(auth);
    if (auth && auth?.token) {
      dispatch({type: LOAD_PROFILE, payload: auth});
      navigation.navigate('Main');
    } else {
      navigation.navigate('Login');
    }
    setIsSplashActive && setIsSplashActive(false);
  };

  LOAD_PROFILE;
  React.useEffect(() => {
    if (user) {
      navigation.navigate('Main');
    }
    checkIfAlreadyLoggedIn();
  }, []);

  return <View style={styles.container} />;
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    alignItems: 'center',
  },
});
