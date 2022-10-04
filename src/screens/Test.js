// ? --- IAP ------ //
// import React from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Modal,
//   Platform,
//   Button,
//   TouchableWithoutFeedback,
//   Alert,
// } from "react-native";
// import IAP, {
//   purchaseErrorListener,
//   purchaseUpdatedListener,
// } from "react-native-iap";
// // import * as RNIap from 'react-native-iap';
// import FastImage from "react-native-fast-image";
// import * as Progress from "react-native-progress";
// const ImageX = "https://wallpaperaccess.com/full/43867.jpg";
// const items = Platform.select({
//   ios: [],
//   android: [
//     "1amber",
//     "2amber",
//     "3amber",
//     "4amber",
//     "5amber",
//     "6amber",
//     "7amber",
//   ],
// });

// let purchaseUpdateSubscription;
// let purchaseErrorSubscription;
// const Test = () => {
//   const [purchased, setPurchased] = React.useState(false);
//   const [products, setProducts] = React.useState();

//   const handleMount = async () => {
//     const res = await IAP.initConnection();
//     console.log(res, "initConnection");
//     IAP.getProducts(items)
//       .then((productList) => {
//         console.log(productList, "HERE---- listofconsole");
//         setProducts(productList);
//       })
//       .catch((error) => {
//         console.log(error.message);
//       });

//     IAP.flushFailedPurchasesCachedAsPendingAndroid()
//       .catch((err) => {
//         console.log(err);
//       })
//       .then(() => {
//         purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
//           console.log("????S?F?DFD?  purchaseUpdatedListener", purchase);
//           const receipt = purchase?.transactionReceipt;
//           console.log(receipt, "????S?F?DFD?");
//         });
//         purchaseErrorSubscription = purchaseErrorListener((error) => {
//           console.log("purchaseErrorListener", error);
//         });
//       });
//   };

//   const handleUnMount = async () => {
//     purchaseUpdateSubscription.remove();
//     purchaseErrorSubscription.remove();
//     IAP.endConnection();
//   };
//   const buyPro = async (sku) => {
//     // Purchase
//     try {
//       await IAP.requestPurchase(sku, false);
//     } catch (err) {
//       console.warn(err.code, err.message);
//     }
//     // Subscription
//     // try {
//     //   await RNIap.requestSubscription(sku);
//     // } catch (err) {
//     //   console.warn(err.code, err.message);
//     // }
//   };

//   React.useEffect(() => {
//     handleMount();
//     return () => {
//       handleUnMount();
//     };
//   }, []);

//   console.log(products, "products");
//   return (
//     <View style={{ marginTop: 100 }}>
//       {products &&
//         products.map((item) => {
//           return (
//             <View key={item?.productId}>
//               <TouchableOpacity onPress={() => buyPro(item?.productId)}>
//                 <Text>ID : {item?.productId}</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })}
//     </View>
//   );
// };

// export default Test;

// ? --- CAMERA ------ //

import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  Button,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { RNCamera } from "react-native-camera";
import { useCamera } from "react-native-camera-hooks";
import VideoPlayer from "react-native-video-controls";
import RNFS from "react-native-fs";
const Test = () => {
  const [isVideoRecorded, setIsVideoRecorded] = React.useState(null);
  const [
    { cameraRef, type, ratio, autoFocus, autoFocusPoint, isRecording },
    {
      takePicture,
      toggleFacing,
      touchToFocus,
      textRecognized,
      facesDetected,
      recordVideo,
      setIsRecording,
      stopRecording,
      pausePreview,
      resumePreview,
    },
  ] = useCamera(null);

  const handleTookVideo = async () => {
    console.log("handleTookVideo start");
    setIsRecording(true);
    try {
      const data = await recordVideo();
      console.log(data, "handleTookVideo");

      setIsVideoRecorded(data);

      const filePath = data.uri;
      const newFilePath = RNFS.ExternalDirectoryPath + "abc.mp4";
      console.log({ newFilePath });
      RNFS.moveFile(filePath, newFilePath);
    } catch (error) {
      console.log(error, "handleTookVideo");
    } finally {
      setIsRecording(!false);
    }
  };
  const handleTookVideoStop = async () => {
    console.log("handleTookVideo Stop");
    try {
      const data = await stopRecording({ cameraRef });
      setIsRecording(false);
      console.log(data, "stop");
    } catch (error) {
      console.log(error, "stop");
    }
  };

  console.log({ isVideoRecorded });

  return (
    <View style={{ flex: 1, backgroundColor: "pink" }}>
      {isVideoRecorded ? (
        <View
          style={{
            flex: 1,
          }}
        >
          <VideoPlayer
            source={isVideoRecorded}
            onPress={() => setIsVideoRecorded(null)}
          />
        </View>
      ) : (
        <>
          <RNCamera
            ref={cameraRef}
            style={{ flex: 1 }}
            type={type}
            autoFocusPointOfInterest={autoFocusPoint.normalized}
            ratio={ratio}
          />

          {isRecording && <Text>RECORDING....</Text>}
          <TouchableOpacity onPress={handleTookVideo}>
            <Text>Record Start</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleTookVideoStop}>
            <Text>Record Stop</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Test;
