import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import DefaultImage from "../../components/DefaultImage";
import ImageComp from "../../components/ImageComp";
import { MIN_COINS_TO_ACCESS } from "../../constants";
import { getCoversationList } from "../../redux/actions/chat.actions";
import { CHAT_REDUCER_REFRESH } from "../../redux/reducers/actionTypes";

const SearchChat = ({ searchKeyword, setSearchKeyword }) => {
  return (
    <View
      style={{
        backgroundColor: "#666",
        marginVertical: 12,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        borderRadius: 30,
        marginLeft: 40,
        marginRight: 40,
        height: 40,
      }}
    >
      <Image
        source={require("../../../ios/Assets/SearchIcon.png")}
        style={{
          width: 25,
          height: 20,
        }}
      ></Image>
      <TextInput
        style={{
          color: "#fff",
          fontSize: 17,
          letterSpacing: 0.5,
          paddingHorizontal: 20,
          width: "90%",
          paddingHorizontal: 10,
          marginHorizontal: 10,
        }}
        value={searchKeyword}
        onChangeText={(text) => setSearchKeyword(text)}
        placeholder="Search..."
        placeholderTextColor="#999"
      />
    </View>
  );
};

const UserListItem = ({ item, index, navigation }) => {
  const openChatScreen = (
    conversationId,
    otherUserName,
    otherUserProfileImage,
    otherUserID
  ) => {
    if (item?.coins?.activeCoin < MIN_COINS_TO_ACCESS) {
      Alert.alert(
        "Alert",
        `${
          item?.name || "this user"
        } has less than ${MIN_COINS_TO_ACCESS} coins`
      );
      return;
    }
    navigation.navigate("ChatScreen", {
      conversationId,
      otherUserName,
      otherUserProfileImage,
      otherUserID,
    });
  };
  return (
    <TouchableOpacity
      onPress={() =>
        openChatScreen(
          item.conversationId,
          item?.name,
          item?.image,
          item?.userId
        )
      }
      style={{ borderColor: "rgba(0,0,0,0.2)", borderBottomWidth: 1 }}
    >
      <View
        style={{
          margin: 2,
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          maxWidth: 400,
          marginLeft: 20,
        }}
      >
        {item?.image ? (
          <ImageComp
            imageContainerStyles={{
              backgroundColor: "transparent",
            }}
            URI={item?.image}
            imageStyles={{
              width: 60,
              height: 60,
              borderRadius: 50,
            }}
          />
        ) : (
          <DefaultImage iconSize={60} />
        )}
        <View
          style={{
            marginLeft: 20,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "bold",
              color: "#222",
            }}
          >
            {item?.name ? item?.name : "no-name"}
          </Text>
          <Text style={{ fontSize: 14, color: "#222" }}>{item?.bio}</Text>
          <Text style={{ fontSize: 14, color: "#222" }}>
            coins {item?.coins?.activeCoin || "0"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MessagesView = ({ navigation }) => {
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [isKeyBoardUp, setIsKeyBoardUp] = React.useState(false);
  const dispatch = useDispatch();
  const { auth, chat } = useSelector((state) => state);
  const { conversationList, error, loading } = chat;
  const [filteredConversationList, setFilteredConversationList] =
    React.useState([]);
  useEffect(() => {
    dispatch(
      getCoversationList({
        userId: auth.user.id,
        authToken: auth.accessToken,
      })
    );
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error || "failed to get conversation list ");
      dispatch({ type: CHAT_REDUCER_REFRESH });
    }
  }, [error]);

  React.useEffect(() => {
    if (searchKeyword) {
      setFilteredConversationList(
        conversationList?.filter((u) => u?.name?.includes(searchKeyword))
      );
    }
  }, [searchKeyword]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyBoardUp(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyBoardUp(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, marginBottom: isKeyBoardUp ? 0 : 70 }}>
      <SearchChat
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />

      <FlatList
        data={
          filteredConversationList && filteredConversationList?.length > 0
            ? filteredConversationList
            : conversationList
        }
        keyExtractor={(item, idx) => idx}
        numColumns={1}
        ListEmptyComponent={
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Text>
              {loading ? (
                <View
                  style={{
                    width: "100%",
                    height: 200,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator color="orange" size="large" />
                </View>
              ) : (
                "No Chat..."
              )}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          console.log(item);
          if (!item?.isBlocked) {
            return (
              <UserListItem
                key={conversationList?.conversationId}
                index={index}
                item={item}
                navigation={navigation}
              />
            );
          }
        }}
      />
    </View>
  );
};

export default MessagesView;
