// CameraSearch.js
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Modal, Text, ActivityIndicator } from 'react-native';
import { getModel, convertBase64ToTensor, startPrediction } from '../../source/helpers/tensor-helper';
import { cropPicture } from '../../source/helpers/image-helper';
import { Camera } from 'expo-camera';

const RESULT_MAPPING = ['Computer', 'Technology', 'Fiction'];
const CONFIDENCE_THRESHOLD = 0.5; // Adjust as needed for model confidence level

const CameraSearch = () => {
  const cameraRef = useRef();
  const [isProcessing, setIsProcessing] = useState(false);
  const [presentedShape, setPresentedShape] = useState('');



  //Trigger Image Capture: When called, handleImageCapture sets isProcessing to true and 
  //captures an image using the camera, with base64 encoding enabled. The captured image data is then passed to processImagePrediction.

  const handleImageCapture = async () => {
    setIsProcessing(true);
    const imageData = await cameraRef.current.takePictureAsync({ base64: true });
    processImagePrediction(imageData);
  };

  const processImagePrediction = async (imageData) => {
    try {
      const croppedData = await cropPicture(imageData, 300);
      const model = await getModel();
      let tensor = await convertBase64ToTensor(croppedData.base64);

      // Normalize tensor to match model expectations (0-1 range)
      tensor = tensor.div(255.0);

      const prediction = await startPrediction(model, tensor);
      console.log('Raw Prediction Result:', prediction);

      const highestPrediction = Math.max(...prediction);
      const highestPredictionIndex = prediction.indexOf(highestPrediction);

      if (highestPrediction >= CONFIDENCE_THRESHOLD) {
        setPresentedShape(RESULT_MAPPING[highestPredictionIndex]);
        console.log('Highest Prediction:', RESULT_MAPPING[highestPredictionIndex]);
      } else {
        setPresentedShape('Prediction confidence too low.');
        console.warn('Prediction confidence below threshold.');
      }
    } catch (error) {
      console.error('Error processing image prediction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={isProcessing} transparent={true} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text>This book is {presentedShape || 'being processed...'}</Text>
            {!presentedShape && <ActivityIndicator size="large" />}
            <Pressable
              style={styles.dismissButton}
              onPress={() => {
                setPresentedShape('');
                setIsProcessing(false);
              }}
            >
              <Text>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        autoFocus={true}
        whiteBalance={Camera.Constants.WhiteBalance.auto}
      />
      <Pressable onPress={handleImageCapture} style={styles.captureButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  camera: { width: '100%', height: '100%' },
  captureButton: {
    position: 'absolute',
    left: Dimensions.get('screen').width / 2 - 50,
    bottom: 40,
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  modal: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalContent: { alignItems: 'center', justifyContent: 'center', width: 300, height: 300, backgroundColor: 'gray', borderRadius: 24 },
  dismissButton: { marginTop: 20, backgroundColor: 'red', padding: 10, borderRadius: 24 },
});

export default CameraSearch;
