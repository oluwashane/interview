import mongoose from 'mongoose';
import Logger from './logger.config';

const logger = Logger.getChildLogger('DatabaseConnection');

export class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri, {
        retryWrites: true,
        w: 'majority'
      });

      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to database');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('Mongoose connection error', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected from database');
      });
    } catch (error) {
      logger.error('MongoDB connection error', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    logger.info('Mongoose disconnected');
  }
}