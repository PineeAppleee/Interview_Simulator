import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Loader } from '../components/ui/Loader';
import { useInterviewStore } from '../store/interviewStore';
import { useAuthStore } from '../store/authStore';
import { useGroqWhisper } from '../hooks/useGroqWhisper';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useInterviewSocket } from '../hooks/useInterviewSocket';
import { Mic, Square, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const InterviewRoomPage = () => {
  const { interviewId = 'default-id' } = useParams();
  const { user } = useAuthStore();
  const {
    messages,
    addMessage,
    status,
    setStatus,
    transcript: partialTranscript,
    setTranscript: setPartialTranscript,
    reset
  } = useInterviewStore();

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fresh start on enter
  useEffect(() => {
    reset();
  }, [reset]);

  // Socket Connection
  const { socket, isConnected } = useInterviewSocket(interviewId, user?.id || 'anonymous');

  const lastAIQuestionRef = useRef<string>('');
  const lastAISpeechRef = useRef<string>('');
  const speechStartTimeRef = useRef<number>(0);

  // TTS Hook
  const { speak, stopSpeaking } = useTextToSpeech({
    onSpeakStart: () => setStatus('speaking'),
    onSpeakEnd: () => setStatus('listening'),
  });

  const handleAISpeak = useCallback((text: string, isQuestion: boolean = true) => {
    if (isQuestion) lastAIQuestionRef.current = text;
    lastAISpeechRef.current = text;
    speechStartTimeRef.current = Date.now();
    setStatus('speaking');
    speak(text);
    startListening();
  }, [speak, setStatus]);

  const handleUserAnswer = useCallback((text: string) => {
    let cleanText = text.trim();
    if (!cleanText || !socket) return;

    // 🛡️ Smart Echo Stripping
    const aiText = lastAISpeechRef.current.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const lowerText = cleanText.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // If the transcript starts with the AI's own words, strip them out
    if (lowerText.startsWith(aiText)) {
      // Find where the AI speech ends in the original text (accounting for punctuation)
      // A simple way is to remove the length of the AI speech if it matches
      // But a safer way is to just keep what's AFTER the AI speech
      const aiWords = lastAISpeechRef.current.split(' ');
      const transcriptWords = cleanText.split(' ');

      // If the first few words match, slice them off
      if (transcriptWords.length > aiWords.length * 0.8) {
        cleanText = transcriptWords.slice(aiWords.length).join(' ').trim();
        console.log("✂️ Stripped AI echo. Remaining text:", cleanText);
      }
    }

    if (!cleanText) {
      console.log("🚫 Only echo detected, ignoring.");
      return;
    }

    addMessage({
      id: Date.now().toString(),
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setStatus('processing');

    socket.emit('answer:submit', {
      question: lastAIQuestionRef.current || "Introduction",
      transcript: cleanText
    });
  }, [addMessage, setStatus, socket]);

  const { isListening, startListening, stopListening } = useGroqWhisper({
    onTranscriptChange: (text) => setPartialTranscript(text),
    onSpeechStart: () => {
      const now = Date.now();
      // Lowered lockout to 800ms for snappier interruptions
      if (status === 'speaking' && (now - speechStartTimeRef.current < 800)) return;

      if (status === 'speaking') {
        stopSpeaking();
        setStatus('listening');
        console.log("INTERRUPT: AI speech cancelled via VAD");
      }
    },
    onSpeechEnd: (text) => {
      handleUserAnswer(text);
      setPartialTranscript('');
    }
  });

  // Handle AI Evaluation Response
  useEffect(() => {
    if (!socket) return;

    socket.on('interview:evaluation', (data: any) => {
      const { conversationalResponse } = data;
      const aiResponse = conversationalResponse || "Thank you. Can you tell me more?";

      addMessage({
        id: Date.now().toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      handleAISpeak(aiResponse);
    });

    socket.on('session:ready', (data) => {
      if (messages.length === 0) {
        const greeting = "Hi! I'm your AI interviewer. Let's start. Can you tell me about yourself?";
        addMessage({
          id: 'greeting',
          sender: 'ai',
          text: greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        handleAISpeak(greeting);
      }
    });

    return () => {
      socket.off('interview:evaluation');
      socket.off('session:ready');
    };
  }, [socket, handleAISpeak, addMessage, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partialTranscript]);

  const handleExit = () => {
    stopSpeaking();
    stopListening();
    if (socket) {
      socket.once("session:summary", (summary: any) => {
        // Save the real score to local storage so the dashboard can pick it up
        localStorage.setItem("lastInterviewScore", summary.finalScore);
        navigate('/dashboard');
      });
      socket.emit("session:end");
      
      // Fallback in case backend doesn't respond
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      navigate('/dashboard');
    }
  };

  // ⏱️ Interview Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleExit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      if (status === 'speaking') stopSpeaking();
      setStatus('listening');
      startListening();
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4">
      <header className="flex justify-between items-center bg-white/40 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-white/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isListening ? 'animate-pulse' : ''}`} />
            <span className="font-medium text-foreground tracking-wide">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <div className="h-4 w-[1px] bg-black/10 mx-2" />
          <div className="flex items-center gap-2">
            <span className="text-foreground/40 text-xs font-bold uppercase tracking-widest">Time Left</span>
            <span className={`font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <Button variant="outline" className="border-red-500/20 text-red-500" onClick={handleExit}>
          Exit Room
        </Button>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <GlassCard className="flex-1 flex flex-col p-2 relative overflow-hidden bg-black/5 border-0">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 text-white text-sm">
              <Video className="w-4 h-4" /> AI Avatar
            </div>
            <AnimatePresence>
              {status === 'speaking' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-primary px-4 py-1.5 rounded-full text-white text-sm">
                  Speaking...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 rounded-[20px] bg-[#0f172a] flex items-center justify-center relative">
            <motion.div
              animate={{ scale: status === 'speaking' ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg ${status === 'listening' ? 'bg-green-500' : 'bg-gradient-warm'}`}
            >
              <span className="text-white font-bold text-3xl">AI</span>
            </motion.div>
          </div>
        </GlassCard>

        {/* Chat / Transcript Area */}
        <div className="w-[400px] flex flex-col gap-4">
          <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-black/5 bg-white/30 backdrop-blur-md flex justify-between items-center">
              <h3 className="font-semibold">Live Conversation</h3>
              {isListening && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-medium text-red-500">Mic Active</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
                {partialTranscript && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl p-3 shadow-sm bg-black/5 text-foreground/80 italic">
                      {partialTranscript}...
                    </div>
                  </motion.div>
                )}
                {status === 'processing' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                    <div className="bg-white/80 border border-black/5 rounded-2xl rounded-tl-sm p-4 shadow-sm w-[100px] flex justify-center items-center h-[52px]">
                      <Loader />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white/40 border-t border-black/5 flex justify-center items-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleMicrophone}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isListening
                  ? 'bg-red-500 text-white shadow-red-500/30'
                  : 'bg-black/10 text-foreground/60 hover:bg-black/20'
                  }`}
              >
                {isListening ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
              </motion.button>
              <span className="ml-4 text-sm text-foreground/60 font-medium">
                {isListening ? 'Tap to pause mic' : 'Tap to resume mic'}
              </span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
