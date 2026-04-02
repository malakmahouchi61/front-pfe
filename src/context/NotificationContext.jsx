import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger les notifications depuis l'API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });
      const data = res.data.notifications;
      // Transformer les données : `read` boolean, `timestamp` = date_envoi
      const formatted = data.map((n) => ({
        id: n.id_notification,
        type: n.type,
        title: n.title || "Notification",
        message: n.message,
        read: n.read,
        timestamp: new Date(n.date_envoi),
        icon: getIconForType(n.type),
        data: n.data,
      }));
      setNotifications(formatted);
      const unread = formatted.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Erreur chargement notifications :", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Recharger quand userId change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Ajouter une notification (utilisée par le listener)
  const addNotification = useCallback((notification) => {
    // Éviter les doublons si l'id existe déjà
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [notification, ...prev];
    });
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Marquer une notification comme lue (API + local)
  const markAsRead = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur markAsRead :", err);
    }
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur markAllAsRead :", err);
    }
  }, []);

  // Effacer tout (uniquement du state local)
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Helper pour l'icône
function getIconForType(type) {
  switch (type) {
    case "donation": return "💰";
    case "demande": return "📋";
    case "campagne": return "🎯";
    case "goal": return "🏆";
    default: return "🔔";
  }
}