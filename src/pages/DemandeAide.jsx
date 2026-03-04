import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './DemandeAide.css';

const DemandeAide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/connexion', { state: { from: '/demander-aide' } });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    type: 'kafala',
    titre: '',
    description: '',
    localisation: '',
    urgence: 'normale',
    pieces: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, pieces: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Soumission:', formData);
    alert('✅ Demande envoyée avec succès ! Nous reviendrons vers vous rapidement.');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="demande-page">
      <div className="demande-card">
        <Link to="/" className="retour-lien">
          <FaArrowLeft /> Retour
        </Link>

        <h1> Demander de l'aide</h1>
        <p className="soustitre">
          Remplissez ce formulaire pour soumettre votre besoin. 
          L'équipe Sanad l'étudiera et le publiera s'il correspond à nos critères.
        </p>

        <form onSubmit={handleSubmit} className="demande-form">
          <div className="form-group">
            <label htmlFor="type">Type d'aide recherché *</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} required>
              <option value="kafala">Kafala (parrainage d'enfant ou famille)</option>
              <option value="financier">Aide financière</option>
              <option value="materiel">Aide matérielle (vêtements, nourriture...)</option>
              <option value="competences">Compétences / Bénévolat</option>
              <option value="collectif">Projet collectif</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="titre">Titre de la demande *</label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Aide pour scolariser mes enfants"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description détaillée *</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre situation, vos besoins, le nombre de personnes concernées..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="localisation">Localisation *</label>
              <input
                type="text"
                id="localisation"
                name="localisation"
                value={formData.localisation}
                onChange={handleChange}
                placeholder="Ville, région"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="urgence">Niveau d'urgence</label>
              <select id="urgence" name="urgence" value={formData.urgence} onChange={handleChange}>
                <option value="normale">Normale</option>
                <option value="urgente">Urgente</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pieces">Pièces justificatives (optionnel)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="pieces"
                name="pieces"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <span className="file-name">{formData.pieces ? formData.pieces.name : 'Aucun fichier choisi'}</span>
            </div>
            <small>Formats acceptés : PDF, JPG, PNG (max 5 Mo)</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">Envoyer la demande</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemandeAide;