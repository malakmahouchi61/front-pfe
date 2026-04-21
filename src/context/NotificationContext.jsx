import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  // Helper icône
  const getIconForType = (type) => {
    switch (type) {
      case "donation": return "💰";
      case "demande": return "📋";
      case "campagne": return "🎯";
      case "goal": return "🏆";
      default: return "🔔";
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });
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

  useEffect(() => {
    isMounted.current = true;
    fetchNotifications();
    return () => { isMounted.current = false; };
  }, [fetchNotifications]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [notification, ...prev];
    });
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

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