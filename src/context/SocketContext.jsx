// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "../socket";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

/**
 * SocketProvider doit être placé APRÈS AuthProvider dans votre arbre React.
 * Il accepte un prop `userId` (ou `isAuthenticated`) pour savoir quand
 * (re)créer le socket.
 *
 * Exemple d'utilisation :
 *   <SocketProvider userId={user?.id}>
 *     {children}
 *   </SocketProvider>
 */
export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // userId défini → utilisateur connecté → on crée le socket
    if (userId) {
      const newSocket = getSocket();
      if (newSocket) {
        setSocket(newSocket);
      }
    } else {
      // Pas d'utilisateur → on détruit le socket
      disconnectSocket();
      setSocket(null);
    }

    // Nettoyage quand le composant est démonté ou userId change
    return () => {
      // On ne déconnecte PAS ici pour éviter les déconnexions sur les
      // re-renders. La déconnexion est gérée explicitement au logout.
    };
  }, [userId]); // ← Se redéclenche à chaque changement d'utilisateur

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
