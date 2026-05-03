import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import backendConfig from '../backend-config.json';

export const useInterviewSocket = (interviewId: string, userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const port = backendConfig.port || 3001;
    const SOCKET_URL = `http://127.0.0.1:${port}/interview`;
    
    console.log(`Connecting to socket at: ${SOCKET_URL}`);
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to interview socket');
      setIsConnected(true);
      newSocket.emit('session:join', { interviewId, userId });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from interview socket');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [interviewId, userId]);

  return { socket, isConnected };
};
