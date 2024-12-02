import Logger from '@config/logger.config';
import { UserService } from '@services/user.service';
import { Request, Response, NextFunction } from 'express';


const logger = Logger.getChildLogger('UserController');

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const sortField = req.query.sortField as string || 'createdAt';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

      logger.info('Retrieving paginated users', { 
        page, 
        pageSize, 
        sortField, 
        sortOrder 
      });

      const result = await this.userService.getPaginatedUsers(
        page,
        pageSize,
        sortField,
        sortOrder
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error in getUsers', { error });
      next(error);
    }
  }


  async getCityAgeStats(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Retrieving city age statistics');

      const stats = await this.userService.getUserAgeStatsByCity();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      logger.error('Error in getCityAgeStats', { error });
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
      try {
      logger.info('Creating new user', { 
        username: req.body.username, 
        email: req.body.email 
      });

        const user = await this.userService.createUser(req.body);
        
      res.status(201).json({
        success: true,
        user
      });
    } catch (error) {
      logger.error('Error in createUser', { 
        error, 
        body: req.body 
      });
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Updating user', { 
        userId: req.params.id, 
        updateFields: Object.keys(req.body) 
      });

      const user = await this.userService.updateUser(
        req.params.id, 
        req.body
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      logger.error('Error in updateUser', { 
        error, 
        userId: req.params.id, 
        body: req.body 
      });
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Deleting user', { userId: req.params.id });

      const user = await this.userService.deleteUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteUser', { 
        error, 
        userId: req.params.id 
      });
      next(error);
    }
  }
}