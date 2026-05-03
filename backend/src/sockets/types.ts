// src/sockets/types.ts

export interface ServerToClientEvents {
  "session:ready": (data: { interviewId: string; lastQuestion?: string; phase: string }) => void;
  "interview:question": (data: { text: string; phase: string }) => void;
  "interview:evaluation": (data: { evaluation: any; transcript: string; nextQuestion: string | null }) => void;
  "session:missing": () => void;
  "proctor:status": (meta: any) => void;
  "error:socket": (data: { message: string; code: string }) => void;
  "pong": () => void;
}

export interface ClientToServerEvents {
  "session:join": (data: { interviewId: string }) => void;
  "audio:chunk": (chunk: ArrayBuffer) => void;
  "answer:end": () => void;
  "proctor:update": (meta: any) => void;
  "ping": () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  interviewId: string;
}
