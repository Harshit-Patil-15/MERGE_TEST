import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ApiError } from './middleware/error.middleware.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import healthRoutes from './routes/health.routes.js';

// Define ES module replacements for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// ==========================================
// 1. Core Global Middlewares
// ==========================================

// Helmet for security headers addition
app.use(helmet());

// CORS configuration (flexible for local and client connections)
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Logging middleware using morgan
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser utility
app.use(cookieParser());

// Expose static files upload directory (e.g. For avatars and task attachments)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// 2. Base Routes Setup
// ==========================================

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Fallback Route for Undefined endpoints (404 Handler)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(`Endpoint not found: Route ${req.originalUrl} does not exist on this backend`, 404));
});

// ==========================================
// 3. Global Error Handler Middleware
// ==========================================
app.use(errorHandler);

export default app;
