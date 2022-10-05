import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";

import {
  api_getCoins,
  api_getDailyOffers,
  api_inAppPurchase,
} from "../../api_services";
import PaymentOptionsModal from "../../components/PaymentOptionsModal";
import PurchaseCompleteNotification from "../../components/PurchaseCompleteNotification";
import { colors } from "../../constants";
import ImageComp from "../../components/ImageComp";
import { useNavigation } from "@react-navigation/core";
import {
  ADD_OFFER_OVERLAY,
  SET_SELECTED_COIN_FOR_PURCHASE,
} from "../../redux/reducers/actionTypes";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";

import IAP, {
  purchaseErrorListener,
  purchaseUpdatedListener,
} from "react-native-iap";
import { getUserCoin } from "../../redux/actions/coin.actions";
const DUMMY_COIN_URL = "https://amberclubpro.com/images/16546854679747.png";
// #45bbcc #7ac7b5
const PriceButton = (props) => {
  const { title, setVisible, onPress } = props;

  const navigation = useNavigation();
  const redirectToFreeEarningScreen = () => {
    navigation.navigate("EarnFreeCoinScreen");
  };

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 30,
        left: 22,
      }}
      onPress={onPress}
    >
      <LinearGradient
        start={{ x: 0.0, y: 1 }}
        end={{ x: 0.8, y: 1.0 }}
        locations={[0.1, 1]}
        colors={["#45bbcc", "#7ac7b5"]}
        style={{
          width: 95,
          height: 30,
          borderRadius: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const CoinBox = ({ item, index, setVisible, handlePriceBtnPress }) => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        width: 140,
        height: 170,
        borderRadius: 15,
        margin: 15,
        backgroundColor: item?.isPopular ? "#29AB87" : colors.midPurpleColor,
      }}
    >
      {/* image */}
      <View
        style={{
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <Text style={{ color: "#fff" }}>{item?.coins}</Text> */}
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 12 }}>
          {item?.description || ""}
        </Text>
      </View>

      {/* price */}

      <ImageComp
        // URI={item?.iconUrl}
        URI={DUMMY_COIN_URL}
        imageStyles={{
          width: 65,
          height: 65,
          position: "absolute",
          top: 40,
          left: 44,
        }}
        imageContainerStyles={{
          backgroundColor: "transparent",
          top: 0,
          left: 0,
        }}
        loaderStyles={{
          top: 50,
          left: 50,
        }}
      />
      <View
        style={{
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 1,
        }}
      >
        {item?.isPopular && (
          <Text
            style={{
              backgroundColor: "#fff",
              padding: 5,
              borderRadius: 10,
              overflow: "hidden",
              position: "absolute",
              top: -5,
              left: 100,
              transform: [{ rotate: "25deg" }],
            }}
          >
            Popular
          </Text>
        )}
      </View>

      <PriceButton
        // title={`$ ${item?.price}`}
        title={item?.localizedPrice || item?.price}
        onPress={() => handlePriceBtnPress(item)}
        navigation={navigation}
        setVisible={setVisible}
      />
    </View>
  );
};

let GOOGLE_PLAY_PRODUCT_ID;
const items = Platform.select({
  ios: [],
  android: [
    "1amber",
    "2amber",
    "3amber",
    "4amber",
    "5amber",
    "6amber",
    "7amber",
    "8amber",
    "9amber",
  ],
});

let purchaseUpdateSubscription;
let purchaseErrorSubscription;
const ShopView = (props) => {
  const { navigation, route, paymentStatus, containerWidth = "80%" } = props;
  const dispatch = useDispatch(null);
  const [visible, setVisible] = React.useState(false);
  const [purchaseNotificationVisible, setPurchaseNotificationVisible] =
    React.useState(paymentStatus);
  const [coinsData, setCoinsData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const { auth, coin } = useSelector((state) => state);
  const paymentOptionSheetRef = React.createRef();

  const handldeSheet = (bool) => {
    if (bool) {
      SheetManager.show("paymentOptionSheet");
    } else {
      paymentOptionSheetRef.current.hide();
    }
  };

  const handleGetCoins = async () => {
    setLoading(true);
    try {
      const response = await api_getCoins({ token: auth.accessToken });
      console.log(response, "getCoins");
      if (response?.isSuccess) {
        setCoinsData(response.items);
      } else {
        Alert.alert("failed", response?.message || "failed to get coins");
      }
    } catch (error) {
      Alert.alert("failed", error?.message || "failed to get coins");
    } finally {
      setLoading(false);
    }
  };

  const checkForDailyOffers = async () => {
    try {
      const res = await api_getDailyOffers({ token: auth?.accessToken });
      console.log(res, "dailyOffers");
      if (res?.isSuccess) {
        //show  popup
        if (res?.data) {
          dispatch({ type: ADD_OFFER_OVERLAY, payload: res?.data });
        }
      } else {
        throw new Error(res?.error || "something went worng !");
      }
    } catch (error) {
      Alert.alert("Alert", error?.message);
    }
  };

  const handlePriceBtnPress = (item) => {
    GOOGLE_PLAY_PRODUCT_ID = item;
    console.log(item, "handlePriceBtnPress");
    dispatch({
      type: SET_SELECTED_COIN_FOR_PURCHASE,
      payload: item,
    });
    //~ stripe disable
    handleGooglePlayPay(GOOGLE_PLAY_PRODUCT_ID?.productId);
    // handleGooglePlayPay(GOOGLE_PLAY_PRODUCT_ID?.gPayProId);
    // handldeSheet(true);
  };

  const handleGooglePlayPay = async (productId) => {
    // console.log(GOOGLE_PLAY_PRODUCT_ID);
    // console.log(productId);
    try {
      const res = await IAP.requestPurchase(productId, false);
      console.log(res, "requestPurchase");
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  React.useEffect(() => {
    handleGetCoins();
    checkForDailyOffers();
  }, []);

  // * google Pay
  const [purchased, setPurchased] = React.useState(false);
  const [products, setProducts] = React.useState();

  const handleMount = async () => {
    const res = await IAP.initConnection();
    console.log(res, "initConnection");
    IAP.getProducts(items)
      .then((productList) => {
        console.log(productList, "HERE---- listofconsole");
        setProducts(productList);
      })
      .catch((error) => {
        console.log(error.message);
      });

    IAP.flushFailedPurchasesCachedAsPendingAndroid()
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
          console.log("????S?F?DFD?  purchaseUpdatedListener", purchase);
          handlePurchasedComplete(purchase);
          const receipt = purchase?.transactionReceipt;
          console.log(receipt, "????S?F?DFD?");
        });
        purchaseErrorSubscription = purchaseErrorListener((error) => {
          console.log("purchaseErrorListener", error);
        });
      });
  };

  // after payment success
  const handlePurchasedComplete = async (purchase) => {
    if (!GOOGLE_PLAY_PRODUCT_ID) return;
    const payload = {
      token: auth?.accessToken,
      userID: auth?.user?.id,
      purchase,
      ITEM: GOOGLE_PLAY_PRODUCT_ID,
      OS: Platform.OS,
    };
    console.log("THIS ONE", GOOGLE_PLAY_PRODUCT_ID);
    console.log("THIS TWO", coin?.selectedCoinForPurchase);
    try {
      const res = await api_inAppPurchase(payload);
      console.log(res);
      if (res?.isSuccess) {
        Alert.alert("Success !", res?.message || "Payment done successfuly!");
        dispatch(
          getUserCoin({ token: auth?.accessToken, userId: auth?.user?.id })
        );
      } else {
        throw new Error(res?.error || "something went wrong!");
      }
    } catch (error) {
      console.log(error?.message);
      Alert.alert("Alert", error?.message);
    } finally {
    }
  };

  const handleUnMount = async () => {
    purchaseUpdateSubscription.remove();
    purchaseErrorSubscription.remove();
    IAP.endConnection();
  };

  React.useEffect(() => {
    handleMount();
    return () => {
      handleUnMount();
    };
  }, []);

  return (
    <>
      <View>
        <FlatList
          style={{
            width: "90%",
            alignSelf: "center",
          }}
          columnWrapperStyle={{
            justifyContent: "space-around",
          }}
          data={true ? products : coinsData}
          ListEmptyComponent={
            <View
              style={{
                width: "100%",
                height: 300,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator size={"small"} color="white" />
              ) : (
                <Text style={{ textAlign: "center" }}>No Coins...</Text>
              )}
            </View>
          }
          keyExtractor={(item) => (true ? item.productId : item._id)}
          numColumns={2}
          renderItem={({ item, index }) => (
            <CoinBox
              handlePriceBtnPress={handlePriceBtnPress}
              key={true ? item.productId : item._id}
              item={item}
              setVisible={setVisible}
            />
          )}
        />
      </View>
      <View>
        <View
          style={{
            flex: 1,
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <PaymentOptionsModal
            visible={false}
            setVisible={setVisible}
            navigation={navigation}
          />
        </View>
        <PurchaseCompleteNotification
          setPurchaseNotificationVisible={setPurchaseNotificationVisible}
          purchaseNotificationVisible={purchaseNotificationVisible}
        />
        <ActionSheet id="paymentOptionSheet" ref={paymentOptionSheetRef}>
          <View
            style={{
              height: 140,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                handldeSheet(false);
                navigation.navigate("CheckoutScreen");
              }}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0,0,0,0.1)",
                height: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>Stripe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleGooglePlayPay(GOOGLE_PLAY_PRODUCT_ID?.gPayProId);
                handldeSheet(false);
              }}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0,0,0,0.1)",
                height: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>Google</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              handldeSheet(false);
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                padding: 10,
                fontWeight: "bold",
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </ActionSheet>
      </View>
    </>
  );
};

export default ShopView;
