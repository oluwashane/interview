import { Request, Response, NextFunction } from 'express';
import { ServiceError } from '@utils/error.util';
import Logger from '@config/logger.config';

const logger = Logger.getChildLogger('ErrorMiddleware');

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  logger.error('Error occurred', {
    error: err,
    body: req.body,
    query: req.query,
    params: req.params,
    path: req.path,
    method: req.method,
  });

  if (statusCode === 404) {
    return res.status(404).json({
      success: false,
      errorCode: 'NOT_FOUND',
      message: err.message || 'Resource not found',
      details: {
        path: req.originalUrl,
        method: req.method,
      },
    });
  }

  if (err instanceof ServiceError) {
    return res.status(err.statusCode).json({
      success: false,
      errorCode: err.code,
      message: err.message,
      details: err.details,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: Object.values(err?.errors || {}).map((error: any) => ({
        field: error.path,
        message: error.message,
      })),
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      errorCode: 'DUPLICATE_KEY',
      message: 'Duplicate key error',
      details: {
        duplicateFields: Object.keys(err?.keyPattern || {}),
      },
    });
  }

  res.status(500).json({
    success: false,
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details:
      process.env.NODE_ENV !== 'production'
        ? {
            name: err.name,
            message: err.message,
            stack: err.stack,
          }
        : {},
  });
};

