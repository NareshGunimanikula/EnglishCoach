import { useCallback, useEffect, useRef, useState } from 'react';
import {
  startTeluguListening,
  stopTeluguListening,
} from '../services/audioService';
import { AgentMode, processVoice } from '../services/apiService';
import { speakEnglish } from '../services/ttsService';
import { requestMicPermission } from '../utils/permissions';

type HistoryItem = {
  telugu?: string;
  english?: string;
};

export const useVoiceAgent = () => {
  const [status, setStatus] = useState('Idle');
  const [teluguText, setTeluguText] = useState('');
  const [displayEnglish, setDisplayEnglish] = useState('');
  const [spokenEnglish, setSpokenEnglish] = useState('');
  const [coachTip, setCoachTip] = useState('');
  const [encouragement, setEncouragement] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [slowVoiceEnabled, setSlowVoiceEnabled] = useState(true);
  const [mode, setMode] = useState<AgentMode>('coach');
  const [source, setSource] = useState('');
  const [warning, setWarning] = useState('');

  const runningRef = useRef(false);

  const repeatLastResponse = useCallback(async () => {
    const text = [spokenEnglish].filter(Boolean).join(' ').trim();
    if (!text) return;
    await speakEnglish(text, slowVoiceEnabled);
  }, [spokenEnglish, slowVoiceEnabled]);

  const listenOnce = useCallback(async () => {
    if (!runningRef.current) return;

    try {
      setStatus('Listening... Speak your full sentence');
      const telugu = await startTeluguListening();

      if (!runningRef.current) return;

      setStatus('Understood. Processing...');
      setTeluguText(telugu);

      const result = await processVoice(telugu, history, mode);

      if (!runningRef.current) return;

      setDisplayEnglish(result.displayEnglish);
      setSpokenEnglish(result.spokenEnglish);
      setCoachTip(result.coachTip);
      setEncouragement(result.encouragement);
      setFollowUpQuestion(result.followUpQuestion);
      setSource(result.source || '');
      setWarning(result.warning || '');

      setHistory(prev => [
        ...prev.slice(-5),
        {
          telugu,
          english: result.displayEnglish,
        },
      ]);

      setStatus('Speaking reply...');
      await speakEnglish(result.spokenEnglish, slowVoiceEnabled);

      if (!runningRef.current) return;

      setStatus('Ready for next sentence...');
      setTimeout(() => {
        if (runningRef.current) {
          listenOnce();
        }
      }, 1500);
    } catch (error: any) {
      const message = String(error?.message || error);

      if (!runningRef.current) {
        setStatus('Stopped');
        return;
      }

      if (
        message.includes('No speech matched') ||
        message.includes('No speech result returned') ||
        message.includes('No speech input')
      ) {
        setStatus('Waiting for speech...');
        setTimeout(() => {
          if (runningRef.current) {
            listenOnce();
          }
        }, 1200);
        return;
      }

      if (message.includes('Client error')) {
        setStatus('Listening...');
        setTimeout(() => {
          if (runningRef.current) {
            listenOnce();
          }
        }, 800);
        return;
      }

      console.error('Voice flow error:', error);
      setStatus('Error');
    }
  }, [history, mode, slowVoiceEnabled]);

  const startAgent = useCallback(async () => {
    const hasPermission = await requestMicPermission();

    if (!hasPermission) {
      setStatus('Permission denied');
      return;
    }

    runningRef.current = true;
    setIsAgentRunning(true);
    setStatus('Starting...');
    listenOnce();
  }, [listenOnce]);

  const stopAgent = useCallback(async () => {
    runningRef.current = false;
    setIsAgentRunning(false);
    setStatus('Stopped');

    try {
      await stopTeluguListening();
    } catch {
      // ignore stop-time recognizer errors
    }
  }, []);

  useEffect(() => {
    return () => {
      runningRef.current = false;
    };
  }, []);

  return {
    status,
    teluguText,
    displayEnglish,
    spokenEnglish,
    coachTip,
    encouragement,
    followUpQuestion,
    history,
    isAgentRunning,
    slowVoiceEnabled,
    mode,
    source,
    warning,
    setMode,
    setSlowVoiceEnabled,
    startAgent,
    stopAgent,
    repeatLastResponse,
  };
};
