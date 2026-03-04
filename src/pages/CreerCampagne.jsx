import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './CreerCampagne.css';

const CreerCampagne = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/connexion', { state: { from: '/creer-campagne' } });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    typeCampagne: '',
    objectif: '',
    dateFin: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Campagne soumise :', formData);
    alert('✅ Votre campagne a été créée. Elle sera examinée par notre équipe.');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="campagne-container">
      <Link to="/" className="retour-lien">
        <FaArrowLeft /> Retour
      </Link>

      <div className="campagne-content">
        <div className="campagne-left">
          <h1>Créer une campagne</h1>
          <p className="sous-titre">Lancez un appel aux dons pour votre projet associatif</p>
          <div className="etapes">
            <h2>Comment ça marche ?</h2>
            <ol>
              <li>Remplissez le formulaire détaillé de votre campagne</li>
              <li>Notre équipe valide votre projet sous 48h</li>
              <li>Votre campagne est publiée et visible des donateurs</li>
              <li>Suivez les dons et gérez votre campagne depuis votre tableau de bord</li>
            </ol>
          </div>
        </div>

        <div className="campagne-right">
          <form onSubmit={handleSubmit} className="campagne-form">
            <div className="form-group">
              <label htmlFor="titre">Titre de la campagne *</label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Achat de fournitures scolaires pour les enfants"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description détaillée *</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre projet, les bénéficiaires, l'impact visé..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="typeCampagne">Type de campagne *</label>
              <select
                id="typeCampagne"
                name="typeCampagne"
                value={formData.typeCampagne}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Sélectionner...</option>
                <option value="kafala">Kafala (parrainage)</option>
                <option value="financier">Financement de projet</option>
                <option value="materiel">Collecte de matériel</option>
                <option value="urgent">Aide d'urgence</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="objectif">Objectif financier (DA) *</label>
                <input
                  type="number"
                  id="objectif"
                  name="objectif"
                  value={formData.objectif}
                  onChange={handleChange}
                  placeholder="Ex: 200000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateFin">Date de fin *</label>
                <input
                  type="date"
                  id="dateFin"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image de couverture (optionnel)</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                />
                <span className="file-name">
                  {formData.image ? formData.image.name : 'Choisir une image'}
                </span>
              </div>
              <small>Formats acceptés : JPG, PNG – Taille max : 5 Mo</small>
            </div>

            <button type="submit" className="btn-soumettre">
              Créer la campagne
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreerCampagne;