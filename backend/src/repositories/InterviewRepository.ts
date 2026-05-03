// src/repositories/InterviewRepository.ts
export class InterviewRepository {
  private interviews = new Map<string, any>();

  async create(data: any): Promise<any> {
    const interview = { 
      ...data, 
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING'
    };
    this.interviews.set(interview.id, interview);
    return interview;
  }

  async findById(id: string): Promise<any | null> {
    return this.interviews.get(id) || null;
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const interview = this.interviews.get(id);
    if (interview) {
      interview.status = status;
      interview.updatedAt = new Date();
    }
    return interview;
  }

  async findByUserId(userId: string): Promise<any[]> {
    return Array.from(this.interviews.values()).filter(i => i.userId === userId);
  }
}
