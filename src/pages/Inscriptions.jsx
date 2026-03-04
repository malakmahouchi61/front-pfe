import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import "./Inscriptions.css";

const Inscription = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("donateur");

  // États pour les champs du formulaire
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "donateur", label: "Donateur / Kafil", desc: "Je veux aider et faire des dons", emoji: "🫂" },
    { id: "beneficiaire", label: "Bénéficiaire", desc: "J'ai besoin d'aide", emoji: "🤲" },
    { id: "ong", label: "Association / ONG", desc: "Je gère des projets caritatifs", emoji: "🏢" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Adapter le rôle pour le backend (le backend attend "donateur", "beneficiaire", "association")
    let roleBDD = selectedRole;
    if (selectedRole === 'ong') roleBDD = 'association'; // car le backend utilise "association" pour les ONG

    try {
      // Appel à l'API d'inscription (backend sur port 3000)
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          mot_de_passe: password,
          role: roleBDD,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Succès : stocker le token et l'utilisateur
      localStorage.setItem('token', data.token);
      login(data.user); // met à jour le contexte
      navigate('/accueil'); // redirige vers l'accueil
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-wrapper">
      <div className="inscription-card">
        <h1 className="card-title">Créer un compte</h1>
        <p className="card-subtitle">Choisissez votre rôle pour commencer</p>

        <div className="role-section">
          <span className="role-label">VOTRE RÔLE</span>
          <div className="role-options">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`role-option ${selectedRole === role.id ? "selected" : ""}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="role-content">
                  <span className="role-title">
                    <span className="role-emoji">{role.emoji}</span> {role.label}
                  </span>
                  <span className="role-desc">{role.desc}</span>
                </div>
                <div className="role-check">
                  <span className={`custom-radio ${selectedRole === role.id ? 'selected' : ''}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="inscription-form">
          {/* Deux champs au lieu d'un seul "NOM COMPLET" */}
          <div className="form-group">
            <label>NOM</label>
            <input
              type="text"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>PRÉNOM</label>
            <input
              type="text"
              placeholder="Votre prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>EMAIL</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>MOT DE PASSE</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-inscription" disabled={loading}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
          {error && <div className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
        </form>

        <p className="connexion-lien">
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
        </p>
        <Link to="/accueil" className="retour-accueil">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default Inscription;