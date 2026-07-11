import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

/**
 * @desc    API Health check
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  // Check Database connection state
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'disconnected';
  if (dbState === 1) dbStatus = 'connected';
  else if (dbState === 2) dbStatus = 'connecting';
  else if (dbState === 3) dbStatus = 'disconnecting';

  const healthInfo = {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    sys: {
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    },
  };

  return ApiResponse.success(res, 'Backend service is healthy', healthInfo);
});

export default router;
