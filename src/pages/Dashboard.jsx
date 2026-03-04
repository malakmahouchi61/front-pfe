import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  const stats = [
    { id: 1, icon: 'fas fa-euro-sign', value: '0 €', label: 'TOTAL DONNÉ' },
    { id: 2, icon: 'fas fa-hand-holding-heart', value: '0', label: 'DONS EFFECTUÉS' },
    { id: 3, icon: 'fas fa-star', value: '0', label: 'POINTS' },
    { id: 4, icon: 'fas fa-medal', value: '0', label: 'BADGES' },
  ];

  const historiqueDons = [];

  return (
    <main className="dashboard">
      <h1 className="welcome-message">Bonjour, {user.prenom || user.nom || 'Utilisateur'}</h1>
      <p className="subtitle">Votre tableau de bord donateur</p>

      <div className="stats-grid">
        {stats.map(stat => (
          <div className="stat-card" key={stat.id}>
            <div className="stat-icon">
              <i className={stat.icon}></i>
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-row">
        <div className="card historique-card">
          <h2><i className="fas fa-history"></i> Historique des dons</h2>
          {historiqueDons.length === 0 ? (
            <p className="empty-message">Aucun don pour le moment.</p>
          ) : (
            <ul>{/* mapper historique */}</ul>
          )}
        </div>

        <div className="card badges-card">
          <h2><i className="fas fa-medal"></i> Badges</h2>
          <p className="empty-message">Aucun badge</p>
        </div>

        <div className="card notifications-card">
          <h2><i className="fas fa-bell"></i> Notifications</h2>
          <p className="empty-message">Aucune notification</p>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;