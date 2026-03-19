import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Connects to the Socket.io server, joins 'results_room',
 * and returns the latest event payloads.
 *
 * Usage in Dashboard:
 *   const { connected, newResult } = useSocket();
 *   useEffect(() => { if (newResult) refetchResults(); }, [newResult]);
 */
export const useSocket = () => {
  const socketRef              = useRef(null);
  const [connected, setConnected]   = useState(false);
  const [newResult, setNewResult]   = useState(null);
  const [updatedResult, setUpdated] = useState(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay:    2000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_results');
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    // Incoming new submission from any agent
    socket.on('new_result', (payload) => {
      setNewResult({ ...payload, _receivedAt: Date.now() });
    });

    // Status update (verified / rejected) from admin
    socket.on('result_updated', (payload) => {
      setUpdated({ ...payload, _receivedAt: Date.now() });
    });

    return () => socket.disconnect();
  }, []);

  return { connected, newResult, updatedResult };
};