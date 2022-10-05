import React from "react";
import { View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  REMOVE_OFFER_OVERLAY,
  SET_SELECTED_COIN_FOR_PURCHASE,
} from "../redux/reducers/actionTypes";
import NextBtn from "./NextBtn";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import LinearGradient from "react-native-linear-gradient";
import Carousel from "react-native-snap-carousel";
import { useNavigation } from "@react-navigation/core";
import ImageComp from "./ImageComp";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
const DUMMY_COIN_URL = "https://amberclubpro.com/images/16546854679747.png";
import IAP, {
  purchaseErrorListener,
  purchaseUpdatedListener,
} from "react-native-iap";
import { api_inAppPurchase } from "../api_services";
import { getUserCoin } from "../redux/actions/coin.actions";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const items = Platform.select({
  ios: [],
  android: ["1amber", "2amber", "3amber"],
});

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

let GOOGLE_PLAY_PRODUCT_ID;
const OfferOverlay = () => {
  const dispatch = useDispatch();
  const _carousel = React.useRef();
  const { isOfferPopupActive, offerData } = useSelector((state) => state.popup);
  const { user, accessToken } = useSelector((state) => state.auth);
  const [products, setProducts] = React.useState();
  const paymentOptionSheetRef = React.createRef();
  const navigation = useNavigation(null);
  const handlePopupClose = () => dispatch({ type: REMOVE_OFFER_OVERLAY });

  const handleBuyPress = (item) => {
    GOOGLE_PLAY_PRODUCT_ID = item;
    dispatch({
      type: SET_SELECTED_COIN_FOR_PURCHASE,
      payload: item,
    });
    // ~ STRIPE DISBLED
    // handldeSheet(true);
    handleGooglePlaySelect(GOOGLE_PLAY_PRODUCT_ID?.gPayProId);
  };

  const handldeSheet = (bool) => {
    if (bool) {
      SheetManager.show("paymentOptionSheet2");
    } else {
      paymentOptionSheetRef.current.hide();
    }
  };

  const handleGooglePlayPay = async (productId) => {
    console.log("---", productId);
    try {
      const res = await IAP.requestPurchase(productId, false);
      console.log(res, "requestPurchase");
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  const handleStripeSelect = () => {
    dispatch({ type: REMOVE_OFFER_OVERLAY });
    navigation.navigate("CheckoutScreen");
    handldeSheet(false);
  };
  const handleGooglePlaySelect = (id) => {
    handleGooglePlayPay(id);
    handldeSheet(false);
  };

  // after payment success
  const handlePurchasedComplete = async (purchase) => {
    const payload = {
      token: accessToken,
      userID: user?.id,
      purchase,
      ITEM: GOOGLE_PLAY_PRODUCT_ID,
      OS: Platform.OS,
    };

    try {
      const res = await api_inAppPurchase(payload);
      console.log(res);
      if (res?.data?.status === "succeeded") {
        Alert.alert("Success !", res?.message || "Payment done successfuly!");
        dispatch(getUserCoin({ token: accessToken, userId: user?.id }));
      } else {
        throw new Error(res?.error || "something went wrong!");
      }
    } catch (error) {
      console.log(error?.message);
      Alert.alert("Alert", error?.message);
    } finally {
    }
  };

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
          console.log("purchased COMPLETE", purchase);
          handlePurchasedComplete(purchase);
        });
        purchaseErrorSubscription = purchaseErrorListener((error) => {
          console.log("purchaseErrorListener", error);
        });
      });
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
  return isOfferPopupActive && offerData ? (
    <TouchableWithoutFeedback
      onPress={handlePopupClose}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Carousel
        loop={false}
        ref={_carousel.current}
        data={true ? products : offerData}
        containerCustomStyle={{}}
        slideStyle={{
          overflow: "hidden",
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
        contentContainerCustomStyle={{
          overflow: "hidden",
        }}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                width: "80%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LinearGradient
                start={{ x: 0.1, y: 1 }}
                end={{ x: 0.8, y: 1.0 }}
                locations={[0.1, 0.9]}
                colors={["#FCCA27", "#FFFFFF"]}
                useAngle={true}
                angle={180}
                style={{
                  borderRadius: 15,
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: 30,
                    marginTop: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 15, fontWeight: "bold", color: "#333" }}
                  >
                    {`Daily Offer (${index + 1})`}
                  </Text>
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: 15,
                    }}
                    onPress={handlePopupClose}
                  >
                    <FontAwesome name="close" size={24} color="tomato" />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    width: "78%",
                    height: 300,
                    borderRadius: 15,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 30,
                    paddingTop: 10,
                  }}
                >
                  <ImageComp
                    imageStyles={{ width: 140, height: 140 }}
                    URI={true ? DUMMY_COIN_URL : item?.iconUrl}
                    resizeMode="contain"
                    imageContainerStyles={{ backgroundColor: "transparent" }}
                  />
                  <View>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 12,
                        textAlign: "center",
                        color: "#333",
                      }}
                    >
                      {item?.description}
                    </Text>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginVertical: 5,
                        color: "#333",
                      }}
                    >
                      {/* Price : ${item?.price} */}
                      Price : {item?.localizedPrice}
                    </Text>
                  </View>
                  <NextBtn
                    title="Buy Now"
                    onPress={() => handleBuyPress(item)}
                    btnContainerStyle={{
                      width: "100%",
                      minWidth: 150,
                      height: 40,
                      paddingHorizontal: 10,
                    }}
                    textStyle={{
                      fontSize: 15,
                    }}
                  />
                </View>
              </LinearGradient>
            </View>
          );
        }}
        sliderWidth={320}
        itemWidth={320}
      />
      <ActionSheet id="paymentOptionSheet2" ref={paymentOptionSheetRef}>
        <View
          style={{
            height: 140,
          }}
        >
          <TouchableOpacity
            onPress={handleStripeSelect}
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
            onPress={() =>
              handleGooglePlaySelect(GOOGLE_PLAY_PRODUCT_ID?.gPayProId)
            }
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
    </TouchableWithoutFeedback>
  ) : (
    <></>
  );
};

export default OfferOverlay;
