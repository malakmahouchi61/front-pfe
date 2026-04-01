import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './DemandeAide.css';

const DemandeAide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    type: 'kafala',
    titre: '',
    description: '',
    localisation: '',
    urgence: 'normale',
    objectif: '',
    dateFin: '',
    besoinMateriel: '',
    fichier: null
  });

  const [kafalaAvecObjectif, setKafalaAvecObjectif] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, fichier: file });
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

    // Validation
    if (formData.type === 'financier' && !formData.objectif) {
      alert('Veuillez saisir un objectif financier.');
      return;
    }
    if (formData.type === 'kafala' && kafalaAvecObjectif && !formData.objectif) {
      alert('Veuillez saisir un objectif financier pour cette demande.');
      return;
    }
    if (formData.type !== 'financier' && !kafalaAvecObjectif && !formData.besoinMateriel) {
      alert('Veuillez décrire le besoin.');
      return;
    }
    if (!formData.dateFin) {
      alert('Veuillez saisir une date de fin.');
      return;
    }

    // Construction de la description complète
    let fullDescription = `${formData.titre}\n\n${formData.description}\n\nLocalisation: ${formData.localisation}\nUrgence: ${formData.urgence}\nDate fin: ${formData.dateFin}`;
    if (formData.type === 'financier') {
      fullDescription += `\nObjectif: ${formData.objectif} €`;
    } else if (formData.type === 'kafala') {
      if (kafalaAvecObjectif) {
        fullDescription += `\nObjectif: ${formData.objectif} €`;
      }
      fullDescription += `\nBesoin: ${formData.besoinMateriel}`;
    } else {
      fullDescription += `\nBesoin: ${formData.besoinMateriel}`;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('id_beneficiaire', user.id_utilisateur); // ← correction
    formDataToSend.append('type_demande', formData.type);
    formDataToSend.append('description', fullDescription);
    formDataToSend.append('objectif', formData.objectif || 0);
    formDataToSend.append('date_fin', formData.dateFin);

    if (formData.fichier) {
      formDataToSend.append('piece_justificative', formData.fichier);
    }

    try {
      const response = await fetch('http://localhost:3000/demandes', {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (response.ok) {
        alert('✅ Demande envoyée avec succès ! Elle sera examinée par l\'équipe.');
        navigate('/');
      } else {
        alert('Erreur : ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Problème de connexion au serveur.');
    }
  };

  return (
    <div className="demande-page-simple">
      <div className="container-simple">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Retour
        </Link>

        <div className="form-card">
          <h1>Demander de l'aide</h1>
          <p className="subtitle">
            Remplissez ce formulaire pour soumettre votre besoin. L'équipe Sanad l'étudiera et le publiera s'il correspond à nos critères.
          </p>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Type d'aide */}
            <div className="form-group">
              <label>Type d'aide recherché *</label>
              <select
                name="type"
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value });
                  setKafalaAvecObjectif(false);
                }}
                required
              >
                <option value="kafala">Kafala (parrainage)</option>
                <option value="financier">Aide financière</option>
                <option value="materiel">Aide matérielle</option>
                <option value="competences">Compétences / Bénévolat</option>
                <option value="collectif">Projet collectif</option>
              </select>
            </div>

            {/* Titre */}
            <div className="form-group">
              <label>Titre de la demande *</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Aide pour scolariser mes enfants"
                required
              />
            </div>

            {/* Description détaillée */}
            <div className="form-group">
              <label>Description détaillée *</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre situation, vos besoins, le nombre de personnes concernées..."
                required
              />
            </div>

            {/* Localisation & Urgence */}
            <div className="form-row">
              <div className="form-group">
                <label>Localisation *</label>
                <input
                  type="text"
                  name="localisation"
                  value={formData.localisation}
                  onChange={handleChange}
                  placeholder="Ville, région"
                  required
                />
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
              <label>Date de fin de la demande *</label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                required
              />
            </div>

            {/* Cas financier pur */}
            {formData.type === 'financier' && (
              <div className="form-group">
                <label>Objectif financier (€) *</label>
                <input
                  type="number"
                  name="objectif"
                  value={formData.objectif}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            )}

            {/* Cas Kafala */}
            {formData.type === 'kafala' && (
              <>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={kafalaAvecObjectif}
                      onChange={(e) => setKafalaAvecObjectif(e.target.checked)}
                    />
                    Cette demande a un objectif financier
                  </label>
                </div>

                {kafalaAvecObjectif && (
                  <div className="form-group">
                    <label>Objectif financier (€) *</label>
                    <input
                      type="number"
                      name="objectif"
                      value={formData.objectif}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>{kafalaAvecObjectif ? 'Description du besoin (optionnelle)' : 'Description du besoin *'}</label>
                  <textarea
                    name="besoinMateriel"
                    rows="3"
                    value={formData.besoinMateriel}
                    onChange={handleChange}
                    placeholder="Décrivez le contexte, le nombre d'enfants, les conditions..."
                    required={!kafalaAvecObjectif}
                  />
                </div>
              </>
            )}

            {/* Autres types */}
            {formData.type && formData.type !== 'financier' && formData.type !== 'kafala' && (
              <div className="form-group">
                <label>Description du besoin *</label>
                <textarea
                  name="besoinMateriel"
                  rows="3"
                  value={formData.besoinMateriel}
                  onChange={handleChange}
                  placeholder="Décrivez précisément ce dont vous avez besoin..."
                  required
                />
              </div>
            )}

           {/* Upload de fichier */}
<div className="form-group">
  <label>Pièces justificatives (optionnel)</label>
  <div className="file-upload">
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      accept="image/*, .pdf"   // ← modification ici
      id="file-input"
    />
    <button type="button" onClick={handleParcourirClick} className="btn-outline">
      <FaImage /> Choisir un fichier
    </button>
    <span className="file-name">
      {formData.fichier ? formData.fichier.name : 'Aucun fichier choisi'}
    </span>
  </div>
  {imagePreview && (
    <div className="image-preview">
      <img src={imagePreview} alt="Aperçu" />
    </div>
  )}
  <small>Formats acceptés : images (tous formats) et PDF (max 5 Mo)</small>
</div>

            <button type="submit" className="btn-submit">Envoyer la demande</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DemandeAide;