import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaUserCircle, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const getDisplayName = () => {
    if (!user) return '';
    if (user.prenom && user.nom) return `${user.prenom} ${user.nom}`;
    if (user.prenom) return user.prenom;
    if (user.nom) return user.nom;
    if (user.email) return user.email;
    return 'Utilisateur';
  };

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    const baseUrl = user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000${user.avatar}`;
    return `${baseUrl}?t=${Date.now()}`;
  };

  const isAdmin = user && (user.role?.toLowerCase() === 'admin');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">Sanad</Link>

        <ul className="nav-menu">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Accueil
            </NavLink>
          </li>
          <li>
            <NavLink to="/missions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Missions
            </NavLink>
          </li>
          <li>
            <NavLink to="/campagnes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Campagnes
            </NavLink>
          </li>
          <li>
            <NavLink to="/classement" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Classement
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Dashboard
              </NavLink>
            </li>
          )}
        </ul>

        <div className="nav-right">
          <button onClick={toggleTheme} className="theme-toggle">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Notification Bell – affichée seulement si connecté */}
          {user && <NotificationBell />}

          {user ? (
            <div className="user-menu">
              <Link to="/profil" className="profile-link">
                <div className="avatar-small">
                  {user.avatar ? (
                    <img
                      key={user.avatar}
                      src={getAvatarUrl()}
                      alt="Avatar"
                      className="avatar-img"
                    />
                  ) : (
                    <FaUserCircle className="avatar-icon-small" />
                  )}
                </div>
                <span className="nav-greeting">{getDisplayName()}</span>
              </Link>
              <button onClick={logout} className="btn-orange">Déconnexion</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/connexion" className="btn-orange">Connexion</Link>
              <Link to="/inscription" className="btn-orange btn-outline">Inscription</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;