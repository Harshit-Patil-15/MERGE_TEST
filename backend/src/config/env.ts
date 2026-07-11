import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validate that all required environment variables are present.
 * This will crash the app early if key configs are missing.
 */
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'] as const;
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`[ERROR] Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

export interface AppConfig {
  env: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  clientUrl: string;
}

export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};
