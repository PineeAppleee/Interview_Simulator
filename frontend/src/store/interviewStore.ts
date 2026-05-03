import { create } from 'zustand';
import { ChatMessage } from '../components/ui/ChatBubble';

export type InterviewStatus = 'idle' | 'listening' | 'speaking' | 'processing' | 'completed';

interface InterviewState {
  status: InterviewStatus;
  messages: ChatMessage[];
  currentQuestion: string | null;
  score: number | null;
  feedback: string | null;
  transcript: string;
  
  setStatus: (status: InterviewStatus) => void;
  addMessage: (message: ChatMessage) => void;
  setQuestion: (question: string) => void;
  setTranscript: (transcript: string) => void;
  endInterview: (score: number, feedback: string) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  status: 'idle',
  messages: [],
  currentQuestion: null,
  score: null,
  feedback: null,
  transcript: '',
  
  setStatus: (status) => set({ status }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setQuestion: (question) => set({ currentQuestion: question }),
  setTranscript: (transcript) => set({ transcript }),
  endInterview: (score, feedback) => set({ status: 'completed', score, feedback }),
  reset: () => set({ status: 'idle', messages: [], currentQuestion: null, score: null, feedback: null, transcript: '' }),
}));
