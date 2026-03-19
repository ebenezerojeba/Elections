/**
 * Initialises Socket.io and attaches event handlers.
 * Called once from server.js after the HTTP server is created.
 *
 * Real-time flow:
 *  1. Dashboard client connects → joins 'results_room'
 *  2. Agent submits via POST /api/results
 *  3. resultsController calls io.to('results_room').emit('new_result', payload)
 *  4. All dashboard clients receive the event and update their UI without a reload
 */
import { Server } from 'socket.io';

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:  process.env.CLIENT_ORIGINS?.split(',') || ['http://localhost:5173'],
      methods: ['GET', 'POST'],
    },
    // Graceful degradation: fall back to long-polling if WebSocket unavailable
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // All dashboard viewers join this room so we can broadcast to them collectively
    socket.on('join_results', () => {
      socket.join('results_room');
      console.log(`📺 Socket ${socket.id} joined results_room`);

      // Acknowledge successful join
      socket.emit('joined', { room: 'results_room', socketId: socket.id });
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} — ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`Socket error [${socket.id}]:`, err.message);
    });
  });

  return io;
};

export default initSocket;