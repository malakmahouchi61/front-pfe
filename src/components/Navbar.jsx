import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaUserCircle, FaSun, FaMoon, FaHandHoldingHeart, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const languages = [
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'de', name: 'Deutsch', flag: 'de' }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setLangDropdownOpen(false);
  };

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FaHandHoldingHeart className="logo-icon" /> Sanad
        </Link>

        <ul className="nav-menu">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.accueil', 'Accueil')}</NavLink></li>
          <li><NavLink to="/missions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.missions', 'Missions')}</NavLink></li>
          <li><NavLink to="/campagnes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.campagnes', 'Campagnes')}</NavLink></li>
          <li><NavLink to="/classement" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.classement', 'Classement')}</NavLink></li>
          {isAdmin && <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('nav.dashboard', 'Dashboard')}</NavLink></li>}
        </ul>

        <div className="nav-right">
          {/* Sélecteur de langue : icône globe + drapeau actuel */}
          <div className="lang-dropdown" ref={dropdownRef}>
            <button className="lang-dropdown-trigger" onClick={() => setLangDropdownOpen(!langDropdownOpen)}>
              <FaGlobe size={20} />
              <span className={`fi fi-${currentLang.flag} current-flag`}></span>
            </button>
            {langDropdownOpen && (
              <div className="lang-dropdown-menu">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                  >
                    <span className={`fi fi-${lang.flag}`}></span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleTheme} className="theme-toggle">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {user && <NotificationBell />}

          {user ? (
            <div className="user-menu">
              <Link to="/profil" className="profile-link">
                <div className="avatar-small">
                  {user.avatar ? <img key={user.avatar} src={getAvatarUrl()} alt="Avatar" className="avatar-img" /> : <FaUserCircle className="avatar-icon-small" />}
                </div>
                <span className="nav-greeting">{getDisplayName()}</span>
              </Link>
              <button onClick={logout} className="btn-orange">{t('nav.deconnexion', 'Déconnexion')}</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/connexion" className="btn-orange">{t('nav.connexion', 'Connexion')}</Link>
              <Link to="/inscription" className="btn-orange btn-outline">{t('nav.inscription', 'Inscription')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;