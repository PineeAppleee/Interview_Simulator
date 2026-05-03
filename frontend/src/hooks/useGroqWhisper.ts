import { useState, useEffect, useRef, useCallback } from 'react';

interface UseGroqWhisperProps {
  onTranscriptChange?: (text: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: (text: string) => void;
  silenceThreshold?: number;
}

export const useGroqWhisper = ({
  onTranscriptChange,
  onSpeechStart,
  onSpeechEnd,
  silenceThreshold = 1200
}: UseGroqWhisperProps) => {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeechDetectedRef = useRef(false);

  const isListeningRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isListeningRef.current = true;
      setIsListening(true);

      // Setup VAD (Voice Activity Detection) using Web Audio
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log(`🎙️ Recording stopped. Size: ${audioBlob.size} bytes. Transcribing...`);

        if (audioBlob.size > 2000) {
          try {
            const config = await import('../backend-config.json');
            const res = await fetch(`http://localhost:${config.port}/api/interviews/transcribe`, {
              method: 'POST',
              body: audioBlob,
              headers: { 'Content-Type': 'audio/webm' }
            });
            const data = await res.json();
            console.log('📝 Transcription received:', data.text);
            if (data.text) {
              onSpeechEnd?.(data.text);
            }
          } catch (error) {
            console.error('❌ Transcription error:', error);
          }
        } else {
          console.log('🔇 Audio too short, ignoring.');
        }

        if (isListeningRef.current) {
          audioChunksRef.current = [];
          mediaRecorderRef.current?.start();
        }
      };

      mediaRecorder.start();
      console.log('🎙️ Microphone active and VAD running.');
      checkSilence();
    } catch (error) {
      console.error('MediaRecorder start error:', error);
    }
  }, [onSpeechEnd]);

  const stopRecording = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    console.log('🎙️ Stopping microphone.');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  const checkSilence = useCallback(() => {
    if (!analyserRef.current || !isListeningRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;

    // 🎯 NOISE CALIBRATION
    // If you see '🗣️ Speech detected!' but never '🤫 Silence detected', 
    // it means your room noise is higher than this threshold.
    const threshold = 12;

    if (average > threshold) {
      if (!isSpeechDetectedRef.current) {
        console.log(`🗣️ Speech detected! (Vol: ${Math.round(average)})`);
        isSpeechDetectedRef.current = true;
        onSpeechStart?.();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      silenceTimerRef.current = setTimeout(() => {
        if (isSpeechDetectedRef.current) {
          console.log('🤫 Silence detected. Ending segment.');
          isSpeechDetectedRef.current = false;
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, silenceThreshold);
    }

    if (isListeningRef.current) {
      requestAnimationFrame(checkSilence);
    }
  }, [onSpeechStart, silenceThreshold]);

  return { isListening, startListening: startRecording, stopListening: stopRecording };
};
