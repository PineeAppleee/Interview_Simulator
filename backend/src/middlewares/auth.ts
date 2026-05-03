import { Response, NextFunction, Request } from 'express';
import { AuthService } from '../services/AuthService';
import logger from '../utils/logger';

export const authMiddleware = (authService: AuthService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid Authorization header');
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = authService.verifyToken(token) as { sub: string };
      req.user = { id: decoded.sub };
      next();
    } catch (err) {
      logger.warn('Unauthorized access attempt with invalid token');
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
};
