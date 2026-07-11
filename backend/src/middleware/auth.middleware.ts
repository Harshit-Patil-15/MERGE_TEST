import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/user.model.js';
import { ApiError } from './error.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Protect routes - Verification of authentication JWT.
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Retrieve token from Authorization header or from request cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    throw new ApiError('Not Authorized: Access token is missing', 401);
  }

  // Verify JWT Token
  const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;

  // Retrieve matching user profile from Database and exclude password field
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new ApiError('Not Authorized: User associated with this token does not exist', 401);
  }

  // Attach user identity to request object
  req.user = user;
  next();
});

/**
 * Authorize roles - Grant endpoint access to specific roles.
 * @param roles Permissible roles list (e.g. 'admin', 'user')
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        `Forbidden: Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};
