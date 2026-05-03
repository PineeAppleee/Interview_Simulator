import { useCallback, useRef } from 'react';

interface UseTextToSpeechProps {
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

export const useTextToSpeech = ({ onSpeakStart, onSpeakEnd }: UseTextToSpeechProps = {}) => {
  const isSpeakingRef = useRef(false);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Choose a premium/natural sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v =>
      v.name.includes('Google') ||
      v.name.includes('Premium') ||
      v.name.includes('Samantha')
    ) || voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      onSpeakStart?.();
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      onSpeakEnd?.();
    };

    utterance.onerror = (e) => {
      // Don't trigger onSpeakEnd if it was manually cancelled
      if (e.error !== 'canceled') {
        isSpeakingRef.current = false;
        onSpeakEnd?.();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [onSpeakStart, onSpeakEnd]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking: () => isSpeakingRef.current
  };
};
