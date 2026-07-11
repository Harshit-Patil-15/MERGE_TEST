import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/env.js';

interface MessagePayload {
  roomId: string;
  message: string;
  sender: string;
}

/**
 * Initialize Socket.io Server instance.
 * @param httpServer - Node.js HTTP Server instance.
 */
export const initSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  console.log('[Socket] Socket.io Server initialized successfully');

  // Socket Connection event
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room event handler
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`[Socket] Socket ${socket.id} joined room: ${roomId}`);
      io.to(roomId).emit('sys-message', {
        message: `Socket ${socket.id} joined the room.`,
      });
    });

    // Leave room event handler
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`[Socket] Socket ${socket.id} left room: ${roomId}`);
      io.to(roomId).emit('sys-message', {
        message: `Socket ${socket.id} left the room.`,
      });
    });

    // Send Message event handler
    socket.on('send-message', ({ roomId, message, sender }: MessagePayload) => {
      console.log(`[Socket] Message from ${sender} in room ${roomId}: ${message}`);
      
      // Emit receive-message event to all participants inside the target room
      io.to(roomId).emit('receive-message', {
        roomId,
        message,
        sender,
        timestamp: new Date().toISOString(),
      });
    });

    // Disconnect event handler
    socket.on('disconnect', (reason: string) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
};
