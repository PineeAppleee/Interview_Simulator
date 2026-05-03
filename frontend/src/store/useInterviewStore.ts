import { create } from 'zustand';

interface Message {
  id: string;
  sender: 'ai' | 'candidate' | 'system';
  text: string;
  timestamp: number;
}

interface InterviewState {
  interviewId: string | null;
  status: 'idle' | 'recording' | 'processing' | 'error';
  currentQuestion: string | null;
  messages: Message[];
  evaluation: any | null;
  
  setInterviewId: (id: string | null) => void;
  setStatus: (status: InterviewState['status']) => void;
  setQuestion: (question: string | null) => void;
  setEvaluation: (evaluation: any | null) => void;
  addMessage: (text: string, sender: Message['sender']) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  interviewId: null,
  status: 'idle',
  currentQuestion: null,
  messages: [],
  evaluation: null,

  setInterviewId: (id) => set({ interviewId: id }),
  setStatus: (status) => set({ status }),
  setQuestion: (question) => set({ currentQuestion: question }),
  setEvaluation: (evaluation) => set({ evaluation }),
  addMessage: (text, sender) => set((state) => ({
    messages: [...state.messages, {
      id: crypto.randomUUID(),
      sender,
      text,
      timestamp: Date.now()
    }]
  })),
  reset: () => set({
    interviewId: null,
    status: 'idle',
    currentQuestion: null,
    messages: [],
    evaluation: null
  }),
}));
