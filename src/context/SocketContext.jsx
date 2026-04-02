import React, { createContext, useContext, useEffect, useRef } from "react";
import { getSocket, disconnectSocket } from "../socket";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, userId }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (userId) {
      // Créer ou récupérer le socket
      const newSocket = getSocket();
      if (newSocket) {
        socketRef.current = newSocket;
      }
    } else {
      // Déconnexion
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
    }

    return () => {
      // Ne pas déconnecter automatiquement, cela sera fait au logout
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};