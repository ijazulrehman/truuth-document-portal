import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { JwtPayload } from '../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials
   * Returns user without password hash if valid, null if invalid
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      this.logger.warn(`Login attempt for non-existent user: ${username}`);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for user: ${username}`);
      return null;
    }

    this.logger.log(`User authenticated successfully: ${username}`);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Generate JWT token and return login response
   */
  async login(user: Omit<User, 'passwordHash'>) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`JWT token generated for user: ${user.username}`);

    return {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  /**
   * Get user profile from JWT payload
   */
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    };
  }

  /**
   * Verify a JWT token and return the payload
   */
  verifyToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
