import { GoogleGenAI } from '@google/genai';

type HistoryItem = {
  telugu?: string;
  english?: string;
};

type AgentMode = 'coach' | 'interpreter' | 'practice';

export type CoachResponse = {
  spokenEnglish: string;
  displayEnglish: string;
  coachTip: string;
  encouragement: string;
  followUpQuestion: string;
};

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY in environment');
}

const ai = new GoogleGenAI({ apiKey });

const buildHistoryText = (history: HistoryItem[] = []) => {
  if (!history.length) {
    return 'No previous conversation.';
  }

  return history
    .slice(-6)
    .map((item, index) => {
      return [
        `Turn ${index + 1}:`,
        `User Telugu: ${item.telugu || '-'}`,
        `English Meaning: ${item.english || '-'}`,
      ].join('\n');
    })
    .join('\n\n');
};

const buildSystemInstruction = (mode: AgentMode) => {
  if (mode === 'interpreter') {
    return `
You are a simple English interpreter for a Telugu speaker.

Rules:
- Understand the Telugu meaning from the translated English input.
- Reply only with the direct English meaning.
- Do not continue the conversation too much.
- Keep it short and natural.
- Return valid JSON only.

JSON shape:
{
  "spokenEnglish": "...",
  "displayEnglish": "...",
  "coachTip": "...",
  "encouragement": "...",
  "followUpQuestion": "..."
}
`.trim();
  }

  if (mode === 'practice') {
    return `
You are a friendly English speaking coach for a Telugu speaker.

Rules:
- The learner wants to practice English.
- Reply in simple natural English.
- Give one short correction or improvement tip.
- Ask the learner to say another sentence in English.
- Return valid JSON only.

JSON shape:
{
  "spokenEnglish": "...",
  "displayEnglish": "...",
  "coachTip": "...",
  "encouragement": "...",
  "followUpQuestion": "..."
}
`.trim();
  }

  return `
You are a friendly English conversation agent for a Telugu speaker.
The learner speaks Telugu, but your replies must always be in simple, natural English.

Main goal:
- Act like a real English conversation partner.
- Understand the user's meaning from the translated English input.
- Reply naturally in English.
- Keep the conversation going.
- Help the learner improve by exposure and gentle coaching.

Rules:
- Always reply in English only.
- Use short, beginner-friendly sentences.
- Sound warm, natural, and conversational.
- Do not translate word-by-word back to the user.
- Reply like a person in a real conversation.
- Give one short coaching tip.
- Give one short encouragement line.
- Ask one easy follow-up question unless the conversation is clearly ending.
- If the user says goodbye, end politely and leave followUpQuestion empty.
- Keep coachTip to one sentence only.
- Return valid JSON only.

JSON shape:
{
  "spokenEnglish": "...",
  "displayEnglish": "...",
  "coachTip": "...",
  "encouragement": "...",
  "followUpQuestion": "..."
}
`.trim();
};

export const buildCoachResponse = async (
  teluguText: string,
  englishText: string,
  history: HistoryItem[] = [],
  mode: AgentMode = 'coach',
): Promise<CoachResponse> => {
  const systemInstruction = buildSystemInstruction(mode);
  const historyText = buildHistoryText(history);

  const prompt = `
Conversation history:
${historyText}

Current Telugu user speech:
${teluguText}

English meaning of the Telugu speech:
${englishText}

Now generate the next response.
Return JSON only.
`.trim();

  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
    contents: prompt,
  });

  const rawText = response.text?.trim();

  if (!rawText) {
    throw new Error('Gemini returned empty content');
  }

  let parsed: Partial<CoachResponse>;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    console.error('Gemini raw non-JSON response:', rawText);
    throw new Error('Gemini did not return valid JSON');
  }

  return {
    spokenEnglish: parsed.spokenEnglish?.trim() || '',
    displayEnglish: parsed.displayEnglish?.trim() || '',
    coachTip: parsed.coachTip?.trim() || '',
    encouragement: parsed.encouragement?.trim() || '',
    followUpQuestion: parsed.followUpQuestion?.trim() || '',
  };
};
