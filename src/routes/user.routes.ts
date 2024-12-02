import express from 'express';
import { UserController } from '../controllers/user.controller';
import Logger from '@config/logger.config';


const logger = Logger.getChildLogger('UserRoutes');

export class UserRoutes {
  router = express.Router();
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.initRoutes();
  }

  private initRoutes() {
    logger.info('Initializing user routes');

    
    this.router.get('/', 
      this.asyncHandler(this.userController.getUsers.bind(this.userController))
    );

    this.router.get('/stats/city-age', 
      this.asyncHandler(this.userController.getCityAgeStats.bind(this.userController))
    );

    
    this.router.post('/', 
      this.asyncHandler(this.userController.createUser.bind(this.userController))
    );

    
    this.router.put('/:id', 
      this.asyncHandler(this.userController.updateUser.bind(this.userController))
    );

    
    this.router.delete('/:id', 
      this.asyncHandler(this.userController.deleteUser.bind(this.userController))
    );
  }

  
  private asyncHandler(fn: Function) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}