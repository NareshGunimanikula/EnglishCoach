type HistoryItem = {
  telugu?: string;
  english?: string;
};

export type AgentMode = 'coach' | 'interpreter' | 'practice';

export type VoiceResponse = {
  spokenEnglish: string;
  displayEnglish: string;
  coachTip: string;
  encouragement: string;
  followUpQuestion: string;
  source?: string;
  warning?: string;
};

const BASE_URL = 'http://10.0.0.248:3000';

export const processVoice = async (
  teluguText: string,
  history: HistoryItem[] = [],
  mode: AgentMode = 'coach',
): Promise<VoiceResponse> => {
  const response = await fetch(`${BASE_URL}/voice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio: teluguText,
      history,
      mode,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};
