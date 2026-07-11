import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Middleware wrapper to validate route requests based on express-validator schemas.
 * If validation violations occur, sends a standardized failure payload.
 */
export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // Execute all validation rules set on coordinates of the request
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    // If validation fails
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err: any) => `${err.path}: ${err.msg}`);
      return ApiResponse.error(res, 'Validation failed', extractedErrors, 400);
    }
    
    return next();
  };
};
