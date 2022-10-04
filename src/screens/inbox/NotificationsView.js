import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { api_getNotification, api_SeenNotification } from "../../api_services";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import AntDesign from "react-native-vector-icons/AntDesign";

const MessageNoti = ({ item }) => {
  return (
    <View
      style={{
        width: "90%",
        alignSelf: "center",
        marginVertical: 2,
        flexDirection: "row",
        backgroundColor: "rgba(13, 12, 12, 0.1)",
        borderRadius: 15,
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          height: 75,
        }}
      >
        {/* ICON */}
        <View
          style={{
            width: 80,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 50,
              borderRadius: 100,
              height: 50,
              backgroundColor: "rgba(29, 139, 255, 0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AntDesign name="message1" color={"#000"} size={24} />
          </View>
        </View>
        {/* DATA */}
        <View
          style={{
            width: 230,
          }}
        >
          <Text style={{ fontSize: 16, color: "#555", fontWeight: "bold" }}>
            Messaging
          </Text>
          <Text
            style={{
              color: "rgba(0,0,0,0.6)",
            }}
            numberOfLines={2}
          >
            {` ${item?.title || "no-name"}: ${item?.text || "sent a message!"}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const VideoCallReciveNoti = ({ item }) => {
  return (
    <View
      style={{
        width: "90%",
        alignSelf: "center",
        marginVertical: 2,
        flexDirection: "row",
        backgroundColor: "rgba(13, 12, 12, 0.1)",
        borderRadius: 15,
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          height: 75,
        }}
      >
        {/* ICON */}
        <View
          style={{
            width: 80,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 50,
              borderRadius: 100,
              height: 50,
              backgroundColor: "rgba(44, 167, 48, 0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SimpleLineIcons name="call-in" color={"#000"} size={24} />
          </View>
        </View>
        {/* DATA */}
        <View
          style={{
            width: 230,
          }}
        >
          <Text style={{ fontSize: 16, color: "#555", fontWeight: "bold" }}>
            Video Call
          </Text>
          <Text
            style={{
              color: "rgba(0,0,0,0.6)",
            }}
            numberOfLines={2}
          >
            {`call received from " ${item?.text || "no-name"} ".`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const NotificationsView = () => {
  const { auth, notification } = useSelector((s) => s);
  const [notificationData, setNotificationData] = React.useState([]);
  const [loading, setLoading] = React.useState([]);
  const { notificationStorage } = notification;
  const getNotificationList = async () => {
    console.log("getNotificationList");
    setLoading(true);
    try {
      const payload = {
        token: auth?.accessToken,
        userID: auth?.user?.id,
      };
      const res = await api_getNotification(payload);
      console.log(res, "JJJJ");
      if (res?.isSuccess) {
        setNotificationData(res?.data);
      } else {
        throw new Error(res?.error || "something went wrong!");
      }
    } catch (error) {
      Alert.alert("Alert", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const hitSeenNoti = async (id) => {
    try {
      const payload = {
        token: auth?.accessToken,
        token,
      };
      const res = await api_SeenNotification(payload);
      console.log(res, "XXXX");
      if (res?.isSuccess) {
      } else {
        throw new Error(res?.error || "something went wrong!");
      }
    } catch (error) {
      Alert.alert("Alert", error?.message);
    }
  };
  React.useEffect(() => {
    getNotificationList();
    // hitSeenNoti();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        paddingBottom: 80,
        marginTop: 10,
      }}
    >
      <FlatList
        data={notificationData}
        keyExtractor={(item, idx) => item?.sentTime || idx}
        numColumns={1}
        ListEmptyComponent={
          <View
            style={{
              // backgroundColor: 'red',
              width: "100%",
              height: 300,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? (
              <View>
                <ActivityIndicator size={"large"} color="orange" />
              </View>
            ) : (
              <Text>No Notifications...</Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          // ~ CALL MESSAGING
          if (item?.type === "messaging") {
            return (
              <MessageNoti
                key={item?.sentTime || index}
                index={index}
                item={item}
              />
            );
          }

          // ~ CALL RECIVE NOTIFICATION
          if (item?.type === "callReceive") {
            return (
              <VideoCallReciveNoti
                key={item?.sentTime || index}
                index={index}
                item={item}
              />
            );
          }
        }}
      />
    </View>
  );
};

export default NotificationsView;
