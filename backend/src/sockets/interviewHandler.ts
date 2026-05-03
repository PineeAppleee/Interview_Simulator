import { Server, Socket } from "socket.io";
import { SessionService, ProctoringEvent } from "../services/SessionService";
import { AudioService } from "../services/AudioService";
import { EvaluationService } from "../services/EvaluationService";
import logger from "../utils/logger";

export const setupInterviewSocket = (
  io: Server,
  sessionService: SessionService,
  audioService: AudioService,
  evaluationService: EvaluationService
) => {
  const interviewNamespace = io.of("/interview");

  interviewNamespace.on("connection", (socket: Socket) => {
    logger.info(`New connection to /interview namespace: ${socket.id}`);
    let currentSessionId: string | null = null;

    // 1. User joins interview
    socket.on("session:join", async ({ interviewId, userId }) => {
      let session = sessionService.getSession(interviewId);
      if (!session) {
        // Create session if it doesn't exist
        session = sessionService.startSession(interviewId, userId);
      }
      
      currentSessionId = interviewId;
      socket.join(interviewId);
      logger.info(`User ${userId} joined interview session ${interviewId}`);

      socket.emit("session:ready", {
        interviewId,
        status: session.status,
      });
    });

    // 2. User sends answer (text transcript)
    socket.on("answer:submit", async ({ question, transcript }) => {
      if (!currentSessionId) return;
      const session = sessionService.getSession(currentSessionId);
      if (!session) return;

      try {
        // Calculate remaining time for a 30-minute interview
        const TOTAL_TIME_MS = 30 * 60 * 1000;
        const elapsedMs = Date.now() - session.startTime;
        const remainingMs = Math.max(0, TOTAL_TIME_MS - elapsedMs);
        const remainingTimeMinutes = Math.ceil(remainingMs / (60 * 1000));

        // 3. Backend evaluates with time awareness
        const evaluation = await evaluationService.evaluateAnswer(question, transcript, remainingTimeMinutes);
        
        // Record score for the session summary
        sessionService.recordScore(currentSessionId, evaluation.score);

        // 4. Returns score + feedback
        socket.emit("interview:evaluation", {
          score: evaluation.score,
          feedback: evaluation.feedback,
          missingPoints: evaluation.missing_points,
          conversationalResponse: evaluation.conversational_response
        });
      } catch (error) {
        logger.error(`Error processing answer for session ${currentSessionId}`, error);
        socket.emit("error:socket", { message: "Failed to evaluate answer", code: "EVAL_ERR" });
      }
    });

    // 5. Basic Proctoring - log events
    socket.on("proctor:event", ({ type, details }: { type: ProctoringEvent['type']; details?: string }) => {
      if (currentSessionId) {
        sessionService.logProctoringEvent(currentSessionId, type, details);
      }
    });

    // 6. End interview session
    socket.on("session:end", () => {
      if (currentSessionId) {
        const summary = sessionService.endSession(currentSessionId);
        if (summary) {
          socket.emit("session:summary", summary);
          logger.info(`Interview summary sent for ${currentSessionId}: Score ${summary.finalScore}, Warnings ${summary.warnings}`);
        }
      }
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });
};
