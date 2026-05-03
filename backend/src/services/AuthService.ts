// src/services/AuthService.ts
import { env } from '../config/env';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    // Zero-dependency fallback: just return the string (NOT FOR PRODUCTION)
    return `hashed_${password}`;
  }

  async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    return `hashed_${plain}` === hashed;
  }

  generateToken(userId: string): string {
    // Zero-dependency base64 token
    return Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + 86400000 })).toString('base64');
  }

  verifyToken(token: string) {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (decoded.exp < Date.now()) throw new Error("Expired");
      return decoded;
    } catch (e) {
      throw new Error('Invalid token');
    }
  }
}
