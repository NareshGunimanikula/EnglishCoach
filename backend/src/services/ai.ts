import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const streamAIResponse = async (text: string) => {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a friendly English speaking tutor. Keep responses short and conversational.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    stream: true,
  });

  return stream;
};