import { useNavigation } from "@react-navigation/core";
import React from "react";
import { View } from "react-native";
import WebView from "react-native-webview";
import HeaderBackTitle from "../../components/HeaderBackTitle";
import { AMBER_PRIVACY_POLICY_LINK } from "../../constants";

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, paddingBottom: 80 }}>
      <HeaderBackTitle
        title="Privacy Policy"
        onBackPress={() => navigation.goBack()}
      />
      <WebView source={{ uri: AMBER_PRIVACY_POLICY_LINK }} />
    </View>
  );
};

export default PrivacyPolicyScreen;
