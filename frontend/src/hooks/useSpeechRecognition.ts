import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionProps {
  onTranscriptChange?: (text: string) => void;
  onSpeechStart?: (text?: string) => void;
  onSpeechEnd?: (text: string) => void;
  silenceThreshold?: number;
}

export const useSpeechRecognition = ({
  onTranscriptChange,
  onSpeechStart,
  onSpeechEnd,
  silenceThreshold = 2500
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);

  const setListeningState = useCallback((state: boolean) => {
    setIsListening(state);
    isListeningRef.current = state;
  }, []);
  const recognitionRef = useRef<any>(null);

  const finalTextRef = useRef<string>('');
  const lastProcessedTextRef = useRef<string>('');
  const speechStartedRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs for callbacks to prevent dependency cycles
  const callbacks = useRef({ onTranscriptChange, onSpeechStart, onSpeechEnd });
  useEffect(() => {
    callbacks.current = { onTranscriptChange, onSpeechStart, onSpeechEnd };
  }, [onTranscriptChange, onSpeechStart, onSpeechEnd]);

  const submitTranscript = useCallback(() => {
    const finalResult = lastProcessedTextRef.current.trim();
    if (finalResult) {
      callbacks.current.onSpeechEnd?.(finalResult);
    }

    finalTextRef.current = '';
    lastProcessedTextRef.current = '';
    speechStartedRef.current = false;
  }, []);

  const stopListening = useCallback(() => {
    setListeningState(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    submitTranscript();
  }, [submitTranscript, setListeningState]);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    silenceTimerRef.current = setTimeout(() => {
      if (lastProcessedTextRef.current.trim()) {
        // Auto-submit but DO NOT stop the microphone!
        submitTranscript();
      }
    }, silenceThreshold);
  }, [silenceThreshold, submitTranscript]);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let currentInterim = '';
        let newFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            newFinal += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (newFinal) {
          finalTextRef.current += newFinal;
        }

        const fullText = (finalTextRef.current + currentInterim).trim();

        if (fullText && fullText !== lastProcessedTextRef.current) {
          lastProcessedTextRef.current = fullText;

          if (!speechStartedRef.current) {
            speechStartedRef.current = true;
            callbacks.current.onSpeechStart?.(fullText);
          }

          callbacks.current.onTranscriptChange?.(fullText);
          resetSilenceTimer();
        }
      };

      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) { }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // ignore
        }
      };
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [resetSilenceTimer]);

  const startListening = useCallback(() => {
    finalTextRef.current = '';
    lastProcessedTextRef.current = '';
    speechStartedRef.current = false;
    setListeningState(true);

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    try {
      recognitionRef.current?.start();
    } catch (e) { }
  }, []);

  const clearTranscript = useCallback(() => {
    finalTextRef.current = '';
    lastProcessedTextRef.current = '';
    speechStartedRef.current = false;
    callbacks.current.onTranscriptChange?.('');
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    clearTranscript
  };
};
