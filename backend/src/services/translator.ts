import { translate } from '@vitalets/google-translate-api';

export const translateToEnglish = async (text: string) => {
  try {
    console.log('Translator input:', text);

    const result = await translate(text, {
      from: 'te',
      to: 'en',
    });

    console.log('Translator output:', result.text);

    return result.text || text;
  } catch (error) {
    console.error('Translator error:', error);
    return text;
  }
};
