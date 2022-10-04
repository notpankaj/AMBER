import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  Touchable,
} from "react-native";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useHandler } from "react-native-reanimated";
import { useSelector } from "react-redux";

import * as yup from "yup";
import { Formik } from "formik";
import HeaderBackTitle from "../../components/HeaderBackTitle";
import NextBtn from "../../components/NextBtn";
import { api_reset_password } from "../../api_services";
import globalStyles from "../../styles/globalStyles";

import Toast from "react-native-toast-message";
import { TouchableOpacity } from "react-native-gesture-handler";

const restPasswordValidationSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .min(4, ({ min }) => `current passsword  should be ${min} character`)
    .required("current password is required!"),
  newPassword: yup
    .string()
    .min(8, ({ min }) => `new Password must be atleast ${min} character`)
    .required("New Password is required!"),
  newPasswordConfirm: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "new Passwords must match"),
});

const ResetPassword = ({ navigation }) => {
  const { auth } = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [passswordToggleOne, setPassswordToggleOne] = React.useState(false);
  const [passswordToggleTwo, setPassswordToggleTwo] = React.useState(false);
  const [currentPasswordShow, setCurrentPasswordShow] = React.useState(false);
  const handleToast = (type = "success", text1 = "Success", text2 = "") => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  const handleResetPassword = async (value) => {
    setLoading(true);
    console.log(value);

    const payload = {
      token: auth.accessToken,
      data: {
        oldPassword: value.oldPassword,
        newPassword: value.newPassword,
      },
      userId: auth.user.id,
    };
    console.log(payload);
    const response = await api_reset_password(payload);

    console.log(response);

    if (response.isSuccess) {
      handleToast(
        "success",
        "success",
        response?.message || "Password Updated Successfully"
      );
    } else {
      handleToast("error", "failed", response?.error || "failde to update");
    }

    setLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderBackTitle title={"Reset Password"} navigation={navigation} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            newPasswordConfirm: "",
          }}
          validateOnMount={true}
          validationSchema={restPasswordValidationSchema}
          onSubmit={(values) => handleResetPassword(values)}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            isValid,
            errors,
          }) => (
            <>
              {/* old password */}
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <TextInput
                      style={[styles.textInput, { width: 220 }]}
                      onChangeText={(value) => setCurrentPassword(value)}
                      placeholder="Enter current password"
                      onChangeText={handleChange("oldPassword")}
                      value={values.oldPassword.trim()}
                      onBlur={handleBlur("oldPassword")}
                      secureTextEntry={currentPasswordShow}
                    />
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 25,
                      height: 25,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setCurrentPasswordShow(!currentPasswordShow)}
                  >
                    <FontAwesome
                      name={currentPasswordShow ? "eye-slash" : "eye"}
                      size={20}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>
                {errors.oldPassword && touched.oldPassword && (
                  <Text style={globalStyles.inputError}>
                    {errors.oldPassword}
                  </Text>
                )}
              </View>
              {/* new password */}
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="enter new password"
                      onChangeText={handleChange("newPassword")}
                      value={values.newPassword.trim()}
                      onBlur={handleBlur("newPassword")}
                      secureTextEntry={passswordToggleOne}
                    />
                  </View>

                  <TouchableOpacity
                    style={{
                      width: 25,
                      height: 25,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setPassswordToggleOne(!passswordToggleOne)}
                  >
                    <FontAwesome
                      name={passswordToggleOne ? "eye-slash" : "eye"}
                      size={20}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>

                {errors.newPassword && touched.newPassword && (
                  <Text style={globalStyles.inputError}>
                    {errors.newPassword}
                  </Text>
                )}
              </View>
              {/* new password confirm */}
              <View>
                <View
                  style={{
                    position: "relative",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="confirm new password"
                      onChangeText={handleChange("newPasswordConfirm")}
                      value={values.newPasswordConfirm.trim()}
                      onBlur={handleBlur("newPasswordConfirm")}
                      secureTextEntry={passswordToggleTwo}
                    />
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 25,
                      height: 25,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setPassswordToggleTwo(!passswordToggleTwo)}
                  >
                    <FontAwesome
                      name={passswordToggleTwo ? "eye-slash" : "eye"}
                      size={20}
                      color="gray"
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPasswordConfirm && touched.newPasswordConfirm && (
                  <Text style={globalStyles.inputError}>
                    {errors.newPasswordConfirm}
                  </Text>
                )}
              </View>
              {/* submit btn */}
              <View style={{ marginVertical: 20 }}>
                {loading ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  <NextBtn title={"Reset Password"} onPress={handleSubmit} />
                )}
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
      <Toast />
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  textInput: {
    width: 220,
    borderBottomColor: "#888",
    borderBottomWidth: 2,
    marginVertical: 10,
  },
});
