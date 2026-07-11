import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { initSocket } from './sockets/socket.js';

// Setup uncaught exception handling
process.on('uncaughtException', (err: Error) => {
  console.error('[UNCAUGHT EXCEPTION] Shutting down application...');
  console.error(err.name, err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

// Bind Database Connection
connectDB();

// Build node server wrapper around express listener
const server = http.createServer(app);

// Initialize Socket.io integration
initSocket(server);

// Start server
const PORT = config.port;
const serverListener = server.listen(PORT, () => {
  console.log(`[Server] running in [${config.env}] mode on port [${PORT}] with new HTTP server wrapper harshit dev`);
});

// Setup unhandled promise rejection handling
process.on('unhandledRejection', (err: any) => {
  console.error('[UNHANDLED REJECTION] Shutting down application...');
  console.error(err.name || 'Error', err.message || err);
  serverListener.close(() => {
    process.exit(1);
  });
});
