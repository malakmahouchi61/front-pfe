import React from 'react';
import { NavLink, Link } from 'react-router-dom'; // Remplace Link par NavLink pour les liens du menu
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo à gauche */}
        <Link to="/" className="nav-logo">Sanad</Link>

        {/* Liens centrés - utilisation de NavLink */}
        <ul className="nav-menu">
          <li>
            <NavLink to="/" className="nav-link" end>Accueil</NavLink>
          </li>
          <li>
            <NavLink to="/missions" className="nav-link">Missions</NavLink>
          </li>
          <li>
            <NavLink to="/campagnes" className="nav-link">Campagnes</NavLink>
          </li>
          <li>
            <NavLink to="/classement" className="nav-link">Classement</NavLink>
          </li>
          {/* Lien Dashboard visible uniquement si connecté */}
          {user && (
            <li>
              <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
            </li>
          )}
        </ul>

        {/* Partie droite : on garde Link pour ces éléments */}
        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-greeting">
                Bonjour, {user.prenom || user.nom || 'Utilisateur'}
              </span>
              <button onClick={logout} className="nav-link btn-logout">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="nav-link">Connexion</Link>
              <Link to="/inscription" className="nav-link btn-inscription">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;