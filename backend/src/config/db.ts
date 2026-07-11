import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Establish a connection to MongoDB database.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[Database] Connection Error: ${error.message}`);
    process.exit(1);
  }
};
