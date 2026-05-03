import { Response } from 'express';
import { InterviewService } from '../services/InterviewService';
import { AuthenticatedRequest } from '../types/express.d';
import logger from '../utils/logger';

export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  createInterview = async (req: any, res: Response) => {
    const { company, role, roleDescription } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: 'Company and role are required' });
    }

    try {
      const interview = await this.interviewService.createInterview(req.user.id, {
        company,
        role,
        roleDescription,
      });
      
      logger.info(`Interview created: ${interview.id}`);
      return res.status(201).json(interview);
    } catch (error: any) {
      logger.error('Failed to create interview controller', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  };

  getInterview = async (req: any, res: Response) => {
    const { id } = req.params;

    try {
      const interview = await this.interviewService.getInterview(id);
      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      // Authorization check: ensure user owns the interview
      if (interview.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return res.json(interview);
    } catch (error) {
      logger.error('Failed to get interview controller', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  listInterviews = async (req: any, res: Response) => {
    try {
      const interviews = await this.interviewService.getUserInterviews(req.user.id);
      return res.json(interviews);
    } catch (error) {
      logger.error('Failed to list interviews controller', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  transcribeAudio = async (req: any, res: Response) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const { TranscriptionService } = require('../services/TranscriptionService');
      const { v4: uuidv4 } = require('uuid');

      // Create tmp directory if not exists
      const tmpDir = path.join(__dirname, '../../tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Save raw audio buffer to a file
      const audioPath = path.join(tmpDir, `${uuidv4()}.webm`);
      
      // We expect raw binary data in req.body because of express.raw in the route
      // Wait, I need to make sure express.raw is applied to this route!
      fs.writeFileSync(audioPath, req.body);

      const text = await TranscriptionService.transcribe(audioPath);

      // Clean up the file
      try { fs.unlinkSync(audioPath); } catch (e) {}

      return res.json({ text });
    } catch (error: any) {
      logger.error('Transcription failed:', error);
      return res.status(500).json({ error: error.message || 'Transcription failed' });
    }
  };
}
