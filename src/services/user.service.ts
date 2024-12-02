import Logger from '@config/logger.config';
import { User, IUser } from '../models/user.model';
import { SortOrder } from 'mongoose';
import { ServiceError } from '@utils/error.util';


const logger = Logger.getChildLogger('UserService');

export class UserService {
  async getPaginatedUsers(
    page: number = 1,
    pageSize: number = 10,
    sortField: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    try {
      const skip = (page - 1) * pageSize;
      const sortOptions = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

      const users = await User.find()
        .sort(sortOptions as { [key: string]: SortOrder })
        .skip(skip)
        .limit(pageSize);

      const total = await User.countDocuments();

      if (!users.length) {
        throw ServiceError.notFound('No users found for the given page and pageSize', { page, pageSize });
      }
      
      logger.info(`Retrieved ${users.length} users for page ${page}`);

      return {
        users,
        page,
        pageSize,
        totalUsers: total,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      logger.error('Error retrieving paginated users', { error, page, pageSize });
      throw new ServiceError('Failed to retrieve paginated users', 'INTERNAL_ERROR', 500, { page, pageSize, originalError: error });
    }
  }

  async getUserAgeStatsByCity() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: '$city',
            averageAge: { $avg: '$age' },
            minAge: { $min: '$age' },
            maxAge: { $max: '$age' },
            totalUsers: { $sum: 1 }
          }
        },
        {
          $sort: { totalUsers: -1 }
        },
        {
          $limit: 10
        }
      ]);

      if (!stats.length) {
        throw ServiceError.notFound('No user stats found for cities');
      }

      logger.info(`Retrieved age stats for ${stats.length} cities`);
      return stats;
    } catch (error) {
      logger.error('Error retrieving user age stats', error);
      throw new ServiceError('Failed to retrieve user age stats', 'INTERNAL_ERROR', 500, { originalError: error });
    }
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
      try {
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        logger.warn('User creation attempted with existing email or username', { 
          email: userData.email, 
          username: userData.username 
        });
        throw ServiceError.conflict('User with this email or username already exists', {
          email: userData.email,
          username: userData.username
        })
      }

      const user = new User(userData);
      const savedUser = await user.save();

      logger.info('User created successfully', { 
        userId: savedUser._id, 
        username: savedUser.username 
      });

      return savedUser;
    } catch (error) {
      logger.error('Error creating user', { 
        error, 
        userData: { 
          username: userData.username, 
          email: userData.email 
        } 
      });
      throw new ServiceError('Failed to create user', 'INTERNAL_ERROR', 500, {originalError: error});
    }
  }

  async updateUser(
    userId: string, 
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      const { email, username, ...safeUpdateData } = updateData;

      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        safeUpdateData, 
        { 
          new: true,
          runValidators: true 
        }
      );

      if (!updatedUser) {
        logger.warn('Attempt to update non-existent user', { userId });
        throw ServiceError.notFound('User not found for the given ID', { userId });
      }

      logger.info('User updated successfully', { 
        userId, 
        updatedFields: Object.keys(safeUpdateData) 
      });

      return updatedUser;
    } catch (error) {
      logger.error('Error updating user', { 
        error, 
        userId, 
        updateData 
      });
      throw new ServiceError('Failed to update user', 'INTERNAL_ERROR', 500, { userId, originalError: error });
    }
  }

  async deleteUser(userId: string): Promise<IUser | null> {
    try {
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        logger.warn('Attempt to delete non-existent user', { userId });
         throw ServiceError.notFound('User not found for the given ID', { userId });
      }

      logger.info('User deleted successfully', { 
        userId, 
        username: deletedUser.username 
      });

      return deletedUser;
    } catch (error) {
      logger.error('Error deleting user', { error, userId });
      throw new ServiceError('Failed to delete user', 'INTERNAL_ERROR', 500, { userId, originalError: error });
    }
  }
}