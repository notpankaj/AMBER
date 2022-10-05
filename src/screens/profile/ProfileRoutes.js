import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import EditProfile from './EditProfile';
import SettingRoutes from '../settings/SettingRoutes';
import MyGifts from './MyGifts';
import UpdateProfile from './UpdateProfile';
import Profile from './Profile';
import FollowersScreen from './follow/FollowersScreen';
const Stack = createStackNavigator();
const ProfileRoutes = () => {
  return (
    <Stack.Navigator
      initialRouteName={'Profile'}
      name="ProfileRoutes"
      screenOptions={{
        headerShown: false,
        // unmountOnBlur: true,
      }}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="SettingRoutes" component={SettingRoutes} />
      <Stack.Screen name="FollowersScreen" component={FollowersScreen} />
      <Stack.Screen name="MyGifts" component={MyGifts} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
    </Stack.Navigator>
  );
};

export default ProfileRoutes;
