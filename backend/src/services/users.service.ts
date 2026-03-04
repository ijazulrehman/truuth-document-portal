import { User, IUser } from '../models';
import { logger } from '../utils/logger';

export class UsersService {
  /**
   * Find a user by their unique ID
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  /**
   * Find a user by their username
   */
  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username: username.toLowerCase() });
  }

  /**
   * Create a new user
   */
  async create(username: string, passwordHash: string): Promise<IUser> {
    logger.info(`Creating new user: ${username}`);

    return User.create({
      username: username.toLowerCase(),
      passwordHash,
    });
  }

  /**
   * Check if a username already exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const user = await User.findOne({ username: username.toLowerCase() }).select('_id');
    return !!user;
  }
}
