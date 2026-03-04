// Connexion.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import "./Connexion.css";

const Connexion = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/accueil";

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Email ou mot de passe incorrect");
      }

      // Succès
      localStorage.setItem('token', data.token);
      login(data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connexion-wrapper">
      <div className="connexion-card">
        <h1>Bon retour</h1>
        <p>Connectez-vous à votre compte</p>

        <form onSubmit={handleSubmit} className="connexion-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-connexion" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          {error && <div className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
        </form>

        <p className="inscription-lien">
          Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
        </p>
        <Link to="/accueil" className="retour-accueil">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default Connexion;