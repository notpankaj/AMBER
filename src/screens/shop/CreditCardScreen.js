import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import HeaderBackTitle from '../../components/HeaderBackTitle';
import {useSelector} from 'react-redux';

const CreditCardScreen = ({navigation, route}) => {
  const {paymentMethod} = route.params;
  const {gift} = useSelector(state => state);

  const handlePayPress = () => {
    if (paymentMethod === 'CreditCard') {
      navigation.navigate('ShopHome', {paymentStatus: true});
    }
  };

  function renderCreditCardForm() {
    return (
      <>
        <View
          style={{
            flex: 1,
            width: '80%',
            marginTop: 10,
          }}>
          {/* row 1*/}
          <View style={{padding: 5, marginVertical: 10}}>
            <View>
              <Text
                style={{
                  color: 'rgba(0,0,0,0.8)',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#555',
                }}>
                Card Number
              </Text>
              <TextInput
                style={{
                  borderColor: 'rgba(0,0,0,0.1)',
                  borderBottomWidth: 3,
                  fontSize: 15,
                  color: '#000',
                }}
              />
            </View>
          </View>
          {/* row 2*/}
          <View
            style={{
              padding: 5,
              marginVertical: 15,
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            <View style={{}}>
              <Text
                style={{
                  color: 'rgba(0,0,0,0.8)',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#555',
                }}>
                Expiry Date
              </Text>
              <TextInput
                style={{
                  borderColor: 'rgba(0,0,0,0.1)',
                  borderBottomWidth: 3,
                  fontSize: 15,
                  color: '#000',
                }}
              />
            </View>
            <View style={{marginLeft: 30, minWidth: 40}}>
              <Text
                style={{
                  color: 'rgba(0,0,0,0.8)',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#555',
                }}>
                CVV
              </Text>
              <TextInput
                style={{
                  borderColor: 'rgba(0,0,0,0.1)',
                  borderBottomWidth: 3,
                  fontSize: 15,
                  color: '#000',
                }}
              />
            </View>
          </View>
          {/* row 3*/}
          <View style={{padding: 5, marginVertical: 15}}>
            <View>
              <Text
                style={{
                  color: 'rgba(0,0,0,0.8)',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#555',
                }}>
                Card Holder Name
              </Text>
              <TextInput
                style={{
                  borderColor: 'rgba(0,0,0,0.1)',
                  borderBottomWidth: 3,
                  fontSize: 15,
                  color: '#000',
                }}
              />
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <ScrollView style={{flex: 1}}>
      <HeaderBackTitle
        title={paymentMethod === 'StripeCard' ? 'Stripe Card' : 'Credit Card'}
        navigation={navigation}
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
            {gift?.selectedGiftForPurchase?.title}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: '#000',
              alignSelf: 'flex-start',
              opacity: 0.8,
            }}>
            {gift?.selectedGiftForPurchase?.description}
          </Text>
          <Text
            style={{
              marginTop: 10,
              fontSize: 25,
              // fontWeight: "bold",
              color: '#ffb105',
              letterSpacing: 0.5,
            }}>
            Total Price: {gift?.selectedGiftForPurchase?.coin} coins
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
        {/* Cards */}
        {/* ---------------------- */}

        {paymentMethod === 'CreditCard' && renderCreditCardForm()}
        {/* ---------------------- */}
        {/* BTN */}

        <TouchableOpacity
          style={{
            marginTop: 100,
            backgroundColor: '#549dfc',
            width: 150,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 40,
          }}
          onPress={handlePayPress}>
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              letterSpacing: 0.5,
            }}>
            Pay Now
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreditCardScreen;

const styles = StyleSheet.create({});
