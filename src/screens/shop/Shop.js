import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import HeaderBackTitle from "../../components/HeaderBackTitle";
import { colors } from "../../constants";
import GetPaidView from "./GetPaidView";
import ShopView from "./ShopView";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { useSelector } from "react-redux";
import ShowCoinCount from "../../components/ShowCoinCount";

const ShopHeader = () => {
  const { coin } = useSelector((state) => state);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text
          style={{
            color: colors.bgWhite,
            fontSize: 25,
            fontWeight: "bold",
            marginLeft: 25,
          }}
        >
          Shop
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          maxWidth: 200,
        }}
      >
        {/* gem */}
        {/* <ShowGemCount gemCount={3000000000} /> */}
        {/* coin */}
        {coin?.loading ? (
          <View style={{ width: 100, height: 10 }}>
            <ActivityIndicator
              size="small"
              style={{ position: "absolute", top: 15, right: 25 }}
            />
          </View>
        ) : (
          <ShowCoinCount coinCount={coin?.currectCoin || 0} />
        )}
      </View>
    </View>
  );
};
const GetPaidHeader = ({ navigation, onBackPress }) => {
  return (
    <HeaderBackTitle
      navigation={navigation}
      color={colors.bgWhite}
      title={"Get Paid"}
      onBackPress={onBackPress}
    />
  );
};

const midTabs = ["SHOP", "GET_PAID"];
const Shop = ({ navigation, route }) => {
  const [activeMinNav, setActiveMinNav] = useState("SHOP");
  const [paymentStatus, setPaymentStatus] = useState(false);

  React.useEffect(() => {
    if (route?.params?.paymentStatus) {
      setPaymentStatus(true);
    }
  }, [route]);

  const handleMidNavChange = (midTabName) => {
    setActiveMinNav(midTabName);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.darkPurpleColor,
        paddingBottom: 70,
      }}
    >
      {activeMinNav === midTabs[0] ? (
        <ShopHeader navigation={navigation} />
      ) : (
        <GetPaidHeader
          navigation={navigation}
          onBackPress={() => setActiveMinNav("SHOP")}
        />
      )}

      {/* DYNAMIC BODY */}
      <View style={{ flex: 1, marginTop: 20 }}>
        {activeMinNav === midTabs[0] ? (
          <ShopView navigation={navigation} paymentStatus={paymentStatus} />
        ) : (
          <GetPaidView />
        )}
      </View>
    </View>
  );
};

export default Shop;

const styles = StyleSheet.create({
  midNav: {
    box: {
      backgroundColor: colors.midPurpleColor,
      height: 40,
      minWidth: 150,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius: 50,
    },
  },
});
