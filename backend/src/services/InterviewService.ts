// src/services/InterviewService.ts
import { InterviewRepository } from '../repositories/InterviewRepository';
import logger from '../utils/logger';

export class InterviewService {
  constructor(private interviewRepo: InterviewRepository) {}

  async createInterview(userId: string, data: any): Promise<any> {
    logger.info(`Creating interview for user ${userId}`);
    return this.interviewRepo.create({
      userId,
      ...data,
    });
  }

  async getInterview(id: string): Promise<any | null> {
    return this.interviewRepo.findById(id);
  }

  async completeInterview(id: string): Promise<any> {
    return this.interviewRepo.updateStatus(id, 'COMPLETED');
  }

  async getUserInterviews(userId: string): Promise<any[]> {
    return this.interviewRepo.findByUserId(userId);
  }
}
