import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const HeaderBackTitle = ({
  color = "#555",
  navigation,
  title,
  onBackPress,
  disableBack = false,
}) => {
  return (
    <View style={styles.header.container}>
      {!disableBack && (
        <TouchableOpacity
          onPress={onBackPress ? onBackPress : () => navigation.pop()}
        >
          <Icon
            name="ios-arrow-back"
            size={40}
            style={{
              paddingHorizontal: 10,
              marginTop: 5,
            }}
            color={color}
          />
        </TouchableOpacity>
      )}

      <Text style={[styles.header.title, { color: color }]}>{title}</Text>
    </View>
  );
};

export default HeaderBackTitle;

const styles = StyleSheet.create({
  header: {
    container: {
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    leftArrow: {
      width: 50,
      height: 50,
      marginRight: 10,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
    },
  },
  signUpForm: {
    box: {
      alignItems: "center",
    },
  },
});
