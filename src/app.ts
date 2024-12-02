import { DatabaseConnection } from '@config/database.config';
import environmentConfig from '@config/environment.config';
import Logger from '@config/logger.config';
import { errorMiddleware } from '@middlewares/error.middleware';
import { UserRoutes } from '@routes/user.routes';
import express from 'express';

const logger = Logger.getChildLogger('App');

class App {
  public app: express.Application;
  private dbConnection: DatabaseConnection;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(environmentConfig.get('PORT'));
    this.dbConnection = DatabaseConnection.getInstance();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.connectToDatabase();
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    const apiPrefix = environmentConfig.get('API_PREFIX');
    const userRoutes = new UserRoutes();
    
    this.app.use(`${apiPrefix}/users`, userRoutes.router);

    this.app.use(errorMiddleware as (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => void);
  }

  private async connectToDatabase() {
    try {
      const mongoUri: any = environmentConfig.get('MONGODB_URI');
      await this.dbConnection.connect(mongoUri);
      logger.info(`Connected to MongoDB at ${mongoUri}`);
    } catch (error) {
      logger.error('Database connection failed', error);
      process.exit(1);
    }
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`Server running on port ${this.port}`);
      logger.info(`Environment: ${environmentConfig.get('NODE_ENV')}`);
    });
  }
}

// Start the application
const app = new App();
app.listen();