import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';
import { ErrorCode } from '../utils/constants';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/login
   * Login with username and password
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;

      const user = await this.authService.validateUser(username, password);

      if (!user) {
        throw new AppError(
          401,
          ErrorCode.INVALID_CREDENTIALS,
          'Invalid username or password.'
        );
      }

      const result = await this.authService.login(user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/logout
   * Logout (stateless - just returns success)
   */
  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // JWT is stateless, so logout is handled client-side by removing the token
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.sub;

      if (!userId) {
        throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required.');
      }

      const profile = await this.authService.getProfile(userId);

      if (!profile) {
        throw new AppError(404, ErrorCode.NOT_FOUND, 'User not found.');
      }

      res.json(profile);
    } catch (error) {
      next(error);
    }
  };
}
