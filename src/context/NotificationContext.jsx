import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

// URL de l’API backend (ajustez si besoin)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  // const refreshInterval = useRef(null);

  // Icône selon le type de notification
  const getIconForType = (type) => {
    switch (type) {
      case "donation": return "💰";
      case "demande": return "📋";
      case "campagne": return "🎯";
      case "goal": return "🏆";
      default: return "🔔";
    }
  };

  // Chargement des notifications depuis l’API
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      console.log("NotificationProvider: userId manquant, pas de chargement");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("🚀 ~ NotificationProvider ~ token:",`${API_URL}/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      })
      const res = await axios.get(`${API_URL}/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });
      console.log("🚀 ~ NotificationProvider ~ res:", res)
      if (!isMounted.current) return;

      const data = res.data.notifications;
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
      if (isMounted.current) setLoading(false);
    }
  }, [userId]);

  // Rafraîchissement automatique toutes les 30 secondes
  // useEffect(() => {
  //   if (userId) {
  //     fetchNotifications();
  //     refreshInterval.current = setInterval(() => {
  //       fetchNotifications();
  //     }, 30000);
  //   }
  //   return () => {
  //     if (refreshInterval.current) clearInterval(refreshInterval.current);
  //   };
  // }, [userId, fetchNotifications]);

  // Nettoyage au démontage
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Ajouter une notification (utilisé par les events socket)
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [notification, ...prev];
    });
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Marquer une notification comme lue
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

  // Tout marquer comme lu
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

  // Effacer toutes les notifications (local)
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // // Forcer un rafraîchissement manuel
  // const refresh = useCallback(() => {
  //   fetchNotifications();
  // }, [fetchNotifications]);

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