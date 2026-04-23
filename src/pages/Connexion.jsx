import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './Connexion.css';

const Connexion = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  // Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/login', { email, mot_de_passe: motDePasse });
      const { token, user } = response.data;
      login(token, user);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || t('auth.erreur_connexion', 'Erreur de connexion'));
    }
  };

  return (
    <div className="connexion-container">
      <div className="connexion-card">
        <h2>{t('auth.connexion_titre', 'Connexion')}</h2>
        <p className="subtitle">{t('auth.connexion_sous_titre', 'Accédez à votre espace personnel')}</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.email', 'EMAIL')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth.mot_de_passe', 'MOT DE PASSE')}</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-connexion">
            {t('auth.btn_connexion', 'Se connecter')}
          </button>
        </form>
        <p className="inscription-link">
          {t('auth.pas_compte', 'Pas encore de compte ?')}{' '}
          <Link to="/inscription">{t('auth.inscription_lien', 'Inscrivez-vous')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Connexion;