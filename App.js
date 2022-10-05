import React, {useEffect} from 'react';
import {StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import {NativeBaseProvider} from 'native-base';
import 'react-native-gesture-handler';
import store from './src/redux/store';
import {Provider} from 'react-redux';
import * as eva from '@eva-design/eva';
import {ApplicationProvider} from '@ui-kitten/components';
import SignupProvider from './src/context/SignupContext';
import {colors} from './src/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Routes from './src/router';

export const TabBarContext = React.createContext();
export const MultiStepSignUpContext = React.createContext();

const App = () => {
  const [tabSettings, setTabSettings] = React.useState({
    blurTabMode: false,
    showTabBar: true,
  });

  const [multiSetpSignUpObj, setMultiSetpSignUpObj] = React.useState(null);

  const retriveLocalValues = async () => {
    //TabContext
    try {
      const data = await AsyncStorage.getItem('tabContext');
      setTabSettings(JSON.parse(data));
    } catch (error) {
      console.log(error, 'TabContext');
    }
  };

  useEffect(() => {
    retriveLocalValues();
  }, []);

  return (
    <>
      <StatusBar backgroundColor={colors.amberColor} />
      <TabBarContext.Provider value={{tabSettings, setTabSettings}}>
        <MultiStepSignUpContext.Provider
          value={{multiSetpSignUpObj, setMultiSetpSignUpObj}}>
          <Provider store={store}>
            <NativeBaseProvider>
              <ApplicationProvider {...eva} theme={eva.light}>
                <SignupProvider>
                  <SafeAreaView style={styles.container}>
                    <Routes />
                  </SafeAreaView>
                </SignupProvider>
              </ApplicationProvider>
            </NativeBaseProvider>
          </Provider>
        </MultiStepSignUpContext.Provider>
      </TabBarContext.Provider>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
