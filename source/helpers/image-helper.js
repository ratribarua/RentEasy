// image-helper.js
import { Dimensions } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

const { height: DEVICE_HEIGHT, width: DEVICE_WIDTH } = Dimensions.get('window');
export const BITMAP_DIMENSION = 224;

export const cropPicture = async (imageData, maskDimension) => {
  try {
    const { uri, width, height } = imageData;
    const cropWidth = maskDimension * (width / DEVICE_WIDTH);
    const cropHeight = maskDimension * (height / DEVICE_HEIGHT);
    const actions = [
      {
        crop: {
          originX: (width - cropWidth) / 2,
          originY: (height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        },
      },
      {
        resize: {
          width: BITMAP_DIMENSION,
          height: BITMAP_DIMENSION,
        },
      },
    ];
    const saveOptions = { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true };
    const result = await ImageManipulator.manipulateAsync(uri, actions, saveOptions);
    return result;
  } catch (error) {
    console.error('Could not crop & resize photo', error);
    throw error;
  }
};
