import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model.js';
import { ApiError } from '../middleware/error.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';

/**
 * Generate JWT utility function.
 * @param userId - User ID
 */
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

/**
 * Helper to set cookies and send authentication success responses.
 */
const sendTokenResponse = (user: IUser, statusCode: number, res: Response, message: string): Response => {
  // Generate Token
  const token = generateToken((user._id as any).toString());

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // default 7 days matching token
    ),
    httpOnly: true, // Prevents XSS attacks
    secure: config.env === 'production', // Send cookie only over HTTPS in production
    sameSite: config.env === 'production' ? 'none' as const : 'lax' as const,
  };

  // Convert schema properties to vanilla object and remove password
  const userPayload = user.toObject();
  delete userPayload.password;

  return res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      data: {
        token,
        user: userPayload,
      },
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // Assert if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('Registration failed: Email address is already registered', 400);
  }

  // Create User profile
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  return sendTokenResponse(user, 211, res, 'User account registered successfully');
});

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Retrieve user payload explicitly including password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError('Incorrect credentials: Wrong email or password', 401);
  }

  // Check matching password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError('Incorrect credentials: Wrong email or password', 401);
  }

  return sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Get CURRENT user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // Req.user is populated by protect middleware
  const user = await User.findById(req.user.id);
  return ApiResponse.success(res, 'User profile fetched successfully', { user });
});

/**
 * @desc    Logout user & Clear cookie token
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(200)
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expirable in 10s
      httpOnly: true,
    })
    .json({
      success: true,
      message: 'Logged out successfully',
      data: {},
    });
});
