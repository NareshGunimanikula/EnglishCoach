import { NativeModules } from 'react-native';

const { TeluguSpeechModule } = NativeModules;

export const startTeluguListening = async (): Promise<string> => {
  if (!TeluguSpeechModule) {
    throw new Error('Native speech module not available');
  }

  return TeluguSpeechModule.startListening();
};

export const stopTeluguListening = async (): Promise<void> => {
  if (!TeluguSpeechModule?.stopListening) return;
  await TeluguSpeechModule.stopListening();
};

export const destroyTeluguRecognizer = async (): Promise<void> => {
  if (!TeluguSpeechModule?.destroyRecognizer) return;
  await TeluguSpeechModule.destroyRecognizer();
};
