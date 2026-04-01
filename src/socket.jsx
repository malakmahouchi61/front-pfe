// socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3000";

let socket = null;

/**
 * Crée ou retourne le socket existant, lié au token JWT actuel.
 */
export const getSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  // Si un socket existe déjà et est connecté, on le réutilise
  if (socket && socket.connected) return socket;

  // Sinon on crée un nouveau socket (ou on reconnecte)
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () =>
    console.log("✅ Socket connecté :", socket.id)
  );
  socket.on("disconnect", (reason) =>
    console.log("❌ Socket déconnecté :", reason)
  );
  socket.on("connect_error", (err) =>
    console.error("🔌 Erreur socket :", err.message)
  );

  return socket;
};

/**
 * Déconnecte et supprime le socket courant.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket détruit");
  }
};