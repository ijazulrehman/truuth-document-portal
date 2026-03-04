import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config';
import { UsersService } from './users.service';
import { JwtPayload, UserDto, LoginResponseDto } from '../types';
import { IUser } from '../models';
import { logger } from '../utils/logger';

export class AuthService {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  /**
   * Validate user credentials
   * Returns user if valid, null if invalid
   */
  async validateUser(username: string, password: string): Promise<IUser | null> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      logger.warn(`Login attempt for non-existent user: ${username}`);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn(`Invalid password attempt for user: ${username}`);
      return null;
    }

    logger.info(`User authenticated successfully: ${username}`);
    return user;
  }

  /**
   * Generate JWT token
   */
  generateToken(user: IUser): string {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      username: user.username,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Generate JWT token and return login response
   */
  async login(user: IUser): Promise<LoginResponseDto> {
    const accessToken = this.generateToken(user);

    logger.info(`JWT token generated for user: ${user.username}`);

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  /**
   * Get user profile from user ID
   */
  async getProfile(userId: string): Promise<UserDto | null> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      username: user.username,
      createdAt: user.createdAt,
    };
  }

  /**
   * Verify a JWT token and return the payload
   */
  verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch {
      return null;
    }
  }
}
