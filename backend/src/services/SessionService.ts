import logger from '../utils/logger';

export interface ProctoringEvent {
  type: 'TAB_SWITCH' | 'COPY_PASTE' | 'IDLE' | 'FACE_LOST';
  timestamp: number;
  details?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  status: 'active' | 'completed';
  startTime: number;
  warningsCount: number;
  events: ProctoringEvent[];
  currentQuestion?: string;
  answersCount: number;
  scoreSum: number;
}

export class SessionService {
  private sessions = new Map<string, InterviewSession>();

  startSession(interviewId: string, userId: string): InterviewSession {
    const session: InterviewSession = {
      id: interviewId,
      userId,
      status: 'active',
      startTime: Date.now(),
      warningsCount: 0,
      events: [],
      answersCount: 0,
      scoreSum: 0,
    };
    this.sessions.set(interviewId, session);
    logger.info(`Session started for interview ${interviewId}`);
    return session;
  }

  getSession(id: string): InterviewSession | undefined {
    return this.sessions.get(id);
  }

  logProctoringEvent(interviewId: string, type: ProctoringEvent['type'], details?: string) {
    const session = this.sessions.get(interviewId);
    if (!session) return;
    
    session.events.push({ type, timestamp: Date.now(), details });
    
    // Simple warning count rule
    if (['TAB_SWITCH', 'COPY_PASTE', 'IDLE'].includes(type)) {
      session.warningsCount++;
    }
    
    logger.warn(`Proctoring event logged for ${interviewId}: ${type}`);
  }

  recordScore(interviewId: string, score: number) {
    const session = this.sessions.get(interviewId);
    if (!session || score < 0) return; // Skip fillers (-1)
    session.answersCount++;
    session.scoreSum += score;
  }

  endSession(interviewId: string) {
    const session = this.sessions.get(interviewId);
    if (!session) return null;
    
    session.status = 'completed';
    const finalScore = session.answersCount > 0 ? (session.scoreSum / session.answersCount) : 0;
    
    logger.info(`Session ended for interview ${interviewId}`);
    this.sessions.delete(interviewId);
    
    return {
      durationSeconds: Math.floor((Date.now() - session.startTime) / 1000),
      warnings: session.warningsCount,
      events: session.events,
      finalScore: parseFloat(finalScore.toFixed(1))
    };
  }
}
