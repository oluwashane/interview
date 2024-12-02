import Logger from '@config/logger.config';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';


const logger = Logger.getChildLogger('ValidationMiddleware');

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  age: z.number().min(18).max(120),
  city: z.string().min(2).max(50)
});

export const validateRequest = (schema: z.ZodObject<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error', { 
          errors: error.errors,
          body: req.body 
        });

        return res.status(400).json({
          success: false,
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};
