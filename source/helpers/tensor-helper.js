// tensor-helper.js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import { Base64Binary } from '../utils/utils';

const BITMAP_DIMENSION = 224;
const modelJson = require('../../assets/my_model/model.json');
const modelWeights = require('../../assets/my_model/weights.bin');
const TENSORFLOW_CHANNEL = 3; // Assuming RGB images (3 channels)

export const getModel = async () => {
  try {
    await tf.ready();
    return await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
  } catch (error) {
    console.error('Could not load model', error);
    throw error; // Ensure it throws an error to stop execution if the model can't load
  }
};

export const convertBase64ToTensor = async (base64) => {
  try {
    const uIntArray = Base64Binary.decode(base64);
    const decodedImage = decodeJpeg(uIntArray, TENSORFLOW_CHANNEL);
    const tensor = decodedImage
      .resizeBilinear([BITMAP_DIMENSION, BITMAP_DIMENSION])
      .expandDims(0) // Add a batch dimension of 1
      .div(tf.scalar(255)); // Normalize to [0,1] range

    return tensor;
  } catch (error) {
    console.error('Could not convert base64 string to tensor', error);
    throw error;
  }
};

export const startPrediction = async (model, tensor) => {
  try {
    const prediction = model.predict(tensor);
    const output = await prediction.data();
    return output;
  } catch (error) {
    console.error('Error predicting from tensor image', error);
    throw error;
  }
};
