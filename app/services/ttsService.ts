import Tts from 'react-native-tts';

export const speakEnglish = async (
  text: string,
  slow = false,
): Promise<void> => {
  if (!text?.trim()) return;

  await Tts.getInitStatus();
  Tts.stop();
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultRate(slow ? 0.32 : 0.45);

  return new Promise((resolve, reject) => {
    const onFinish = () => {
      Tts.removeEventListener('tts-finish', onFinish);
      Tts.removeEventListener('tts-cancel', onCancel);
      resolve();
    };

    const onCancel = () => {
      Tts.removeEventListener('tts-finish', onFinish);
      Tts.removeEventListener('tts-cancel', onCancel);
      resolve();
    };

    Tts.addEventListener('tts-finish', onFinish);
    Tts.addEventListener('tts-cancel', onCancel);

    try {
      Tts.speak(text);
    } catch (error) {
      Tts.removeEventListener('tts-finish', onFinish);
      Tts.removeEventListener('tts-cancel', onCancel);
      reject(error);
    }
  });
};
