// src/repositories/UserRepository.ts
export class UserRepository {
  private users = new Map<string, any>();

  async findByEmail(email: string): Promise<any | null> {
    return Array.from(this.users.values()).find((u: any) => u.email === email) || null;
  }

  async create(data: any): Promise<any> {
    const user = { ...data, id: Math.random().toString(36).substr(2, 9) };
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<any | null> {
    return this.users.get(id) || null;
  }
}
