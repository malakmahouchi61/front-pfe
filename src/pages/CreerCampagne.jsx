import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaImage, FaBullhorn } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './CreerCampagne.css';

const CreerCampagne = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    type_campagne: 'kafala',
    titre: '',
    description: '',
    urgence: 'normale',
    ville: '',
    objectif: '',
    date_fin: '',
    besoinMateriel: '',
    image: null,
  });

  const [avecObjectif, setAvecObjectif] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleParcourirClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Utilisateur non connecté');
      return;
    }

    // Validations
    if (formData.type_campagne === 'financier' && !formData.objectif) {
      alert('Veuillez saisir un objectif financier.');
      return;
    }
    if (formData.type_campagne === 'kafala' && avecObjectif && !formData.objectif) {
      alert('Veuillez saisir un objectif financier pour cette campagne.');
      return;
    }
    if (formData.type_campagne !== 'financier' && !avecObjectif && !formData.besoinMateriel) {
      alert('Veuillez décrire le besoin.');
      return;
    }
    if (!formData.date_fin) {
      alert('Veuillez saisir une date de fin.');
      return;
    }
    if (!formData.titre || !formData.description) {
      alert('Veuillez remplir le titre et la description.');
      return;
    }

    let fullDescription = formData.description;
    if (formData.type_campagne === 'financier') {
      fullDescription += `\nObjectif: ${formData.objectif} €`;
    } else if (formData.type_campagne === 'kafala') {
      if (avecObjectif) fullDescription += `\nObjectif: ${formData.objectif} €`;
      fullDescription += `\nBesoin: ${formData.besoinMateriel}`;
    } else {
      fullDescription += `\nBesoin: ${formData.besoinMateriel}`;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('id_association', user.id_utilisateur);
    formDataToSend.append('type_campagne', formData.type_campagne);
    formDataToSend.append('titre', formData.titre);
    formDataToSend.append('description', fullDescription);
    formDataToSend.append('objectif', formData.objectif || 0);
    formDataToSend.append('date_fin', formData.date_fin);
    formDataToSend.append('urgence', formData.urgence);
    formDataToSend.append('ville', formData.ville || '');
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch('http://localhost:3000/campagnes', {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (response.ok) {
        alert('✅ Campagne créée avec succès ! Elle sera visible après validation.');
        navigate('/campagnes');
      } else {
        alert('Erreur : ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Problème de connexion au serveur.');
    }
  };

  return (
    <div className="campagne-page">
      <div className="container-campagne">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Retour
        </Link>

        <div className="form-card">
          <h1>Lancer une campagne</h1>
          <p className="subtitle">
            Remplissez ce formulaire pour créer votre campagne. Elle sera examinée par notre équipe avant publication.
          </p>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Type */}
            <div className="form-group">
              <label>Type de campagne *</label>
              <select name="type_campagne" value={formData.type_campagne} onChange={handleChange} required>
                <option value="kafala">Kafala (parrainage)</option>
                <option value="financier">Collecte financière</option>
                <option value="materiel">Collecte de matériel</option>
                <option value="competences">Bénévolat / Compétences</option>
                <option value="collectif">Projet collectif</option>
              </select>
            </div>

            {/* Titre */}
            <div className="form-group">
              <label>Titre de la campagne *</label>
              <input type="text" name="titre" value={formData.titre} onChange={handleChange} required />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description détaillée *</label>
              <textarea name="description" rows="5" value={formData.description} onChange={handleChange} required />
            </div>

            {/* Ville & Urgence */}
            <div className="form-row">
              <div className="form-group">
                <label>Ville *</label>
                <input type="text" name="ville" value={formData.ville} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Niveau d'urgence</label>
                <select name="urgence" value={formData.urgence} onChange={handleChange}>
                  <option value="normale">Normale</option>
                  <option value="urgente">Urgente</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            </div>

            {/* Date de fin */}
            <div className="form-group">
              <label>Date de fin *</label>
              <input type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} required />
            </div>

            {/* Objectif selon type */}
            {formData.type_campagne === 'financier' && (
              <div className="form-group">
                <label>Objectif financier (€) *</label>
                <input type="number" name="objectif" value={formData.objectif} onChange={handleChange} required />
              </div>
            )}

            {formData.type_campagne === 'kafala' && (
              <>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" checked={avecObjectif} onChange={(e) => setAvecObjectif(e.target.checked)} />
                    Cette campagne a un objectif financier
                  </label>
                </div>
                {avecObjectif && (
                  <div className="form-group">
                    <label>Objectif financier (€)</label>
                    <input type="number" name="objectif" value={formData.objectif} onChange={handleChange} />
                  </div>
                )}
                <div className="form-group">
                  <label>Description du besoin {!avecObjectif && '*'}</label>
                  <textarea name="besoinMateriel" rows="3" value={formData.besoinMateriel} onChange={handleChange} required={!avecObjectif} />
                </div>
              </>
            )}

            {!['financier', 'kafala'].includes(formData.type_campagne) && (
              <div className="form-group">
                <label>Description du besoin *</label>
                <textarea name="besoinMateriel" rows="3" value={formData.besoinMateriel} onChange={handleChange} required />
              </div>
            )}

            {/* Image */}
            <div className="form-group">
              <label>Image de la campagne (optionnel)</label>
              <div className="file-upload">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*, .pdf" />
                <button type="button" onClick={handleParcourirClick} className="btn-outline">
                  <FaImage /> Choisir un fichier
                </button>
                <span className="file-name">{formData.image ? formData.image.name : 'Aucun fichier choisi'}</span>
              </div>
              {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Aperçu" /></div>}
              <small>Formats acceptés : images (tous formats) et PDF (max 5 Mo)</small>
            </div>

            <button type="submit" className="btn-submit">
              <FaBullhorn /> Créer la campagne
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreerCampagne;