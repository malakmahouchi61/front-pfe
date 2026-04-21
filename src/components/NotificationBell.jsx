import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { FaBell, FaCheckDouble, FaTrashAlt } from "react-icons/fa";
import { useNotifications } from "../context/NotificationContext";
import "./NotificationBell.css";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const bellRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target) && !event.target.closest(".notification-dropdown-portal")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    if (!isOpen && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + window.scrollY + 8, right: window.innerWidth - rect.right + window.scrollX });
    }
    setIsOpen(!isOpen);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    return `il y a ${Math.floor(diff / 86400)} j`;
  };

  const dropdownContent = isOpen && (
    <div className="notification-dropdown-portal" style={{ position: "absolute", top: dropdownPosition.top, right: dropdownPosition.right, width: "340px", maxWidth: "calc(100vw - 20px)" }}>
      <div className="dropdown-header"><span>Notifications</span><div className="dropdown-actions">{notifications.length > 0 && (<><button onClick={markAllAsRead} title="Tout marquer comme lu"><FaCheckDouble /></button><button onClick={clearNotifications} title="Effacer tout"><FaTrashAlt /></button></>)}</div></div>
      <div className="dropdown-list">{loading && <div className="empty-state">Chargement...</div>}{!loading && notifications.length === 0 && <div className="empty-state">Aucune notification</div>}{!loading && notifications.map((notif) => (<div key={notif.id} className={`notification-item ${!notif.read ? "unread" : ""}`} onClick={() => markAsRead(notif.id)}><div className="notification-icon">{notif.icon || "🔔"}</div><div className="notification-content"><div className="notification-title">{notif.title}</div><div className="notification-message">{notif.message}</div><div className="notification-time">{formatTime(notif.timestamp)}</div></div></div>))}</div>
    </div>
  );

  return (<div className="notification-bell" ref={bellRef}><button className="bell-button" onClick={handleBellClick}><FaBell size={20} />{unreadCount > 0 && <span className="badge">{unreadCount}</span>}</button>{ReactDOM.createPortal(dropdownContent, document.body)}</div>);
};

export default NotificationBell;