import { Router } from 'express';
import { InterviewController } from '../controllers/InterviewController';
import { authMiddleware } from '../middlewares/auth';
import { AuthService } from '../services/AuthService';

export const setupInterviewRoutes = (
  interviewController: InterviewController,
  authService: AuthService
) => {
  const router = Router();
  const auth = authMiddleware(authService);

  router.post('/', auth, interviewController.createInterview);
  router.get('/', auth, interviewController.listInterviews);
  router.get('/scores/history', interviewController.getScores);
  router.get('/:id', auth, interviewController.getInterview);

  // Transcription endpoint for Groq Whisper
  router.post('/transcribe', require('express').raw({ type: 'audio/*', limit: '10mb' }), interviewController.transcribeAudio);

  return router;
};
