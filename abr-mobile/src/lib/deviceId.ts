import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'abr_device_id';

export const getDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};
