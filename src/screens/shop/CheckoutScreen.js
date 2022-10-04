import React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import HeaderBackTitle from '../../components/HeaderBackTitle';

import {useDispatch, useSelector} from 'react-redux';
import {REMOVE_SELECTED_COIN_FOR_PURCHASE} from '../../redux/reducers/actionTypes';
import {useNavigation} from '@react-navigation/core';

const CheckoutScreen = () => {
  const {coin} = useSelector(state => state);
  const dispatch = useDispatch(null);
  const navigation = useNavigation(null);

  const handleUnmount = () => {
    dispatch({type: REMOVE_SELECTED_COIN_FOR_PURCHASE});
  };

  React.useEffect(() => {
    return () => handleUnmount();
  }, []);

  return (
    <ScrollView style={{flex: 1}}>
      <HeaderBackTitle
        title={'Checkout'}
        onBackPress={() => navigation.goBack()}
      />
      <View style={{flex: 1, alignItems: 'center', paddingBottom: 35}}>
        {/* Detalils */}
        <View
          style={{
            width: '80%',
            marginVertical: 15,
            alignItems: 'center',
            marginBottom: 30,
          }}>
          <Text
            style={{
              fontSize: 15,
              alignSelf: 'flex-start',
              opacity: 0.8,
              marginBottom: 5,
              color: '#000',
            }}>
            Order Summary
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: '#000',
              alignSelf: 'flex-start',
              opacity: 0.8,
            }}>
            Category: {coin?.selectedCoinForPurchase?.category}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: '#000',
              alignSelf: 'flex-start',
              opacity: 0.8,
            }}>
            Coins: {coin?.selectedCoinForPurchase?.coins}
          </Text>
          <Text
            style={{
              marginTop: 10,
              fontSize: 25,
              // fontWeight: "bold",
              color: '#ffb105',
              letterSpacing: 0.5,
            }}>
            Total Price: {coin?.selectedCoinForPurchase?.price}
          </Text>
        </View>
        {/* Hr */}
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.1)',
            width: '100%',
            height: 2,
            marginVertical: 5,
          }}></View>

        {/* ---------------------- */}
        {/* BTN */}
      </View>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({});
