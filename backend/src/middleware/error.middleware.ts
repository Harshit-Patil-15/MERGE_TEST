import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';

/**
 * Custom Error Class to raise API-specific exceptions.
 */
export class ApiError extends Error {
  statusCode: number;
  errors: any[];

  constructor(message: string, statusCode: number, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler middleware.
 * Formats all unhandled errors into a standardized JSON response.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  // Console log error for developers on server logs
  console.error(`[Error Middleware] Internal Error: ${err.message}`);
  if (config.env === 'development') {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose duplicate key error (MongoDB code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered: ${field}. Please use another value!`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((val: any) => val.message);
    message = 'Validation Input Error';
  }

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of: ${err.value}`;
  }

  // JWT configuration errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not Authorized: Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not Authorized: Session expired, please login again';
  }

  // Send uniform JSON error response
  return ApiResponse.error(
    res,
    message,
    errors.length > 0 ? errors : [message],
    statusCode
  );
};
