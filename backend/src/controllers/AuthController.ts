import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import logger from '../utils/logger';

export class AuthController {
  constructor(
    private authService: AuthService,
    private userRepo: UserRepository
  ) {}

  register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const existingUser = await this.userRepo.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await this.authService.hashPassword(password);
      const user = await this.userRepo.create({
        email,
        password: hashedPassword,
      });

      const token = this.authService.generateToken(user.id);
      return res.status(201).json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
      logger.error('Registration failed', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await this.authService.comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = this.authService.generateToken(user.id);
      return res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
      logger.error('Login failed', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
