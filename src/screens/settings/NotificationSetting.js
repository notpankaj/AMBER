import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import HeaderBackTitle from "../../components/HeaderBackTitle";
import { Toggle } from "@ui-kitten/components";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { api_usesNotiSettings } from "../../api_services";
import {
  SET_USER_COORDS,
  SET_USER_NOTIFICATION_SETTING,
} from "../../redux/reducers/actionTypes";
import NextBtn from "../../components/NextBtn";

const HIGTH = Dimensions.get("window").height;

const NotificationSetting = ({ navigation }) => {
  const dispatch = useDispatch();
  const { auth, notification } = useSelector((s) => s);
  const { userSettings } = notification;
  console.log({ userSettings });
  const [isAllNotificationActive, setIsAllNotificationActive] =
    React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const [toggles, setToggles] = React.useState({
    allNotifications: userSettings?.allNotifications || false,
    newFollowers: userSettings?.followerNotification || false,
    directMessages: userSettings?.messagesNotification || false,
    videoCalls: userSettings?.callNotification || false,
  });

  const handleAllNotifiactionToggle = (state) => {
    if (state) {
      setToggles({
        allNotifications: true,
        newFollowers: true,
        directMessages: true,
        videoCalls: true,
      });
      setIsAllNotificationActive(true);
    } else {
      setToggles({
        allNotifications: false,
        newFollowers: false,
        directMessages: false,
        videoCalls: false,
      });
      setIsAllNotificationActive(false);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      userId: auth?.user?.id,
      allNotifications: toggles?.allNotifications || false,
      messagesNotification: toggles?.directMessages || false,
      callNotification: toggles?.videoCalls || false,
      followerNotification: toggles?.newFollowers || false,
    };

    const data = { token: auth?.accessToken, data: payload };
    console.log(data);

    try {
      setLoading(true);
      const res = await api_usesNotiSettings(data);
      console.log(res);
      if (res?.isSuccess) {
        dispatch({
          type: SET_USER_NOTIFICATION_SETTING,
          payload: {
            allNotifications: toggles?.allNotifications || false,
            messagesNotification: toggles?.directMessages || false,
            callNotification: toggles?.videoCalls || false,
            followerNotification: toggles?.newFollowers || false,
          },
        });
        Alert.alert("Success", res?.message || "setting updated success fully");
      } else {
        throw new Error(res?.error || "failed to update settings!");
      }
    } catch (error) {
      Alert.alert("Alert", error?.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View>
      <HeaderBackTitle title={"Notifications"} navigation={navigation} />
      <ScrollView style={styles.notificationContainer}>
        {/* All Notifications */}
        <View
          style={[
            styles.notificationList,
            {
              marginBottom: 20,
            },
          ]}
        >
          <Text style={styles.notificationText}>All Notifications</Text>
          <Toggle
            status="success"
            onChange={() =>
              handleAllNotifiactionToggle(!isAllNotificationActive)
            }
            checked={isAllNotificationActive}
          />
        </View>
        {/* DIVIDER */}
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.2)",
            width: "100%",
            height: 2,
          }}
        ></View>

        {/* New Followers */}
        <View style={styles.notificationList}>
          <Text style={styles.notificationText}>New Followers</Text>
          <Toggle
            status="success"
            onChange={() =>
              setToggles({ ...toggles, newFollowers: !toggles.newFollowers })
            }
            checked={toggles?.newFollowers}
          />
        </View>
        {/* Direct messages */}
        <View style={styles.notificationList}>
          <Text style={styles.notificationText}>Direct messages</Text>
          <Toggle
            status="success"
            onChange={() =>
              setToggles({
                ...toggles,
                directMessages: !toggles.directMessages,
              })
            }
            checked={toggles.directMessages}
          />
        </View>
        {/* Video calls*/}
        <View style={styles.notificationList}>
          <Text style={styles.notificationText}>Video calls</Text>
          <Toggle
            status="success"
            onChange={() =>
              setToggles({ ...toggles, videoCalls: !toggles.videoCalls })
            }
            checked={toggles?.videoCalls}
          />
        </View>
      </ScrollView>
      <View
        style={{
          alignItems: "center",
        }}
      >
        <NextBtn onPress={handleSubmit} loading={loading} title="Save" />
      </View>
    </View>
  );
};

export default NotificationSetting;

const styles = StyleSheet.create({
  notificationContainer: {
    width: "80%",
    alignSelf: "center",
    marginVertical: 15,
    height: HIGTH - 190,
  },
  notificationList: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 100,
  },
  notificationText: {
    backgroundColor: "#49cf76",
    fontSize: 17,
    color: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    minWidth: 200,
    textAlign: "center",
    overflow: "hidden",
  },
});
