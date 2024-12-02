export class ServiceError extends Error {
  public code: string;
  public statusCode: number;
  public details: Record<string, any>;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = { ...details };

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, details: Record<string, any> = {}) {
    return new ServiceError(message, 'BAD_REQUEST', 400, details);
  }

  static notFound(message: string, details: Record<string, any> = {}) {
    return new ServiceError(message, 'NOT_FOUND', 404, details);
  }

  static conflict(message: string, details: Record<string, any> = {}) {
    return new ServiceError(message, 'CONFLICT', 409, details);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}
