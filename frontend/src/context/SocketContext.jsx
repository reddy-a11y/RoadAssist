import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if user is logged in
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketInstance = io('/', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to real-time server with id:', socketInstance.id);
    });

    // Real-time toast alerts for customer
    socketInstance.on('customer_request_updated', (data) => {
      const statusTitle = data.status ? data.status.replace(/_/g, ' ') : 'Updated';
      toast.info(`Request ${data.request?.request_code || ''}: ${statusTitle}`, {
        description: `Current status has advanced to ${statusTitle}.`
      });
    });

    // Real-time alert for service provider
    socketInstance.on('new_assistance_request', (data) => {
      toast.warning(`New Breakdown Request!`, {
        description: `${data.category} assistance needed nearby (${data.address || 'Local spot'})`
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context?.socket || null;
};
