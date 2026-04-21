import React, { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "../socket"; // disconnectSocket supprimé (non utilisé)

const SocketContext = createContext({ socket: null, isConnected: false });

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context ?? { socket: null, isConnected: false };
};

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userId) {
      const newSocket = getSocket();
      if (newSocket) {
        setSocket(newSocket);
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        newSocket.on("connect", onConnect);
        newSocket.on("disconnect", onDisconnect);
        setIsConnected(newSocket.connected);

        return () => {
          newSocket.off("connect", onConnect);
          newSocket.off("disconnect", onDisconnect);
        };
      }
    } else {
      setSocket(null);
      setIsConnected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // userId est la seule dépendance nécessaire

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};