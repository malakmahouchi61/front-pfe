import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaImage, FaBullhorn } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './CreerCampagne.css';

const CreerCampagne = () => {
  const { t } = useTranslation();
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
      alert(t('creer_campagne.erreur_non_connecte', 'Utilisateur non connecté'));
      return;
    }

    // Validations
    if (formData.type_campagne === 'financier' && !formData.objectif) {
      alert(t('creer_campagne.erreur_objectif_financier', 'Veuillez saisir un objectif financier.'));
      return;
    }
    if (formData.type_campagne === 'kafala' && avecObjectif && !formData.objectif) {
      alert(t('creer_campagne.erreur_objectif_kafala', 'Veuillez saisir un objectif financier pour cette campagne.'));
      return;
    }
    if (formData.type_campagne !== 'financier' && !avecObjectif && !formData.besoinMateriel) {
      alert(t('creer_campagne.erreur_besoin', 'Veuillez décrire le besoin.'));
      return;
    }
    if (!formData.date_fin) {
      alert(t('creer_campagne.erreur_date_fin', 'Veuillez saisir une date de fin.'));
      return;
    }
    if (!formData.titre || !formData.description) {
      alert(t('creer_campagne.erreur_titre_description', 'Veuillez remplir le titre et la description.'));
      return;
    }

    // Arrondir l'objectif à l'entier le plus proche
    let objectifValue = formData.objectif ? Math.round(parseFloat(formData.objectif)) : 0;

    let fullDescription = formData.description;
    if (formData.type_campagne === 'financier') {
      fullDescription += `\n${t('creer_campagne.objectif_label', 'Objectif')}: ${objectifValue} TND`;
    } else if (formData.type_campagne === 'kafala') {
      if (avecObjectif) fullDescription += `\n${t('creer_campagne.objectif_label', 'Objectif')}: ${objectifValue} TND`;
      fullDescription += `\n${t('creer_campagne.besoin_label', 'Besoin')}: ${formData.besoinMateriel}`;
    } else {
      fullDescription += `\n${t('creer_campagne.besoin_label', 'Besoin')}: ${formData.besoinMateriel}`;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('id_association', user.id_utilisateur);
    formDataToSend.append('type_campagne', formData.type_campagne);
    formDataToSend.append('titre', formData.titre);
    formDataToSend.append('description', fullDescription);
    formDataToSend.append('objectif', objectifValue);
    formDataToSend.append('date_fin', formData.date_fin);
    formDataToSend.append('urgence', formData.urgence);
    formDataToSend.append('ville', formData.ville || '');
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch('/campagnes', {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (response.ok) {
        alert(t('creer_campagne.succes', '✅ Campagne créée avec succès ! Elle sera visible après validation.'));
        navigate('/campagnes');
      } else {
        alert(t('creer_campagne.erreur_serveur', 'Erreur : ') + (result.error || ''));
      }
    } catch (err) {
      console.error(err);
      alert(t('creer_campagne.erreur_connexion', 'Problème de connexion au serveur.'));
    }
  };

  return (
    <div className="campagne-page">
      <div className="container-campagne">
        <Link to="/" className="back-link">
          <FaArrowLeft /> {t('creer_campagne.retour', 'Retour')}
        </Link>

        <div className="form-card">
          <h1>{t('creer_campagne.titre', 'Lancer une campagne')}</h1>
          <p className="subtitle">
            {t('creer_campagne.sous_titre', 'Remplissez ce formulaire pour créer votre campagne. Elle sera examinée par notre équipe avant publication.')}
          </p>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Type de campagne */}
            <div className="form-group">
              <label>{t('creer_campagne.type_campagne', 'Type de campagne')} *</label>
              <select name="type_campagne" value={formData.type_campagne} onChange={handleChange} required>
                <option value="kafala">{t('creer_campagne.type_kafala', 'Kafala (parrainage)')}</option>
                <option value="financier">{t('creer_campagne.type_financier', 'Collecte financière')}</option>
                <option value="materiel">{t('creer_campagne.type_materiel', 'Collecte de matériel')}</option>
                <option value="competences">{t('creer_campagne.type_competences', 'Bénévolat / Compétences')}</option>
              </select>
            </div>

            {/* Titre */}
            <div className="form-group">
              <label>{t('creer_campagne.titre_campagne', 'Titre de la campagne')} *</label>
              <input type="text" name="titre" value={formData.titre} onChange={handleChange} required />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>{t('creer_campagne.description', 'Description détaillée')} *</label>
              <textarea name="description" rows="5" value={formData.description} onChange={handleChange} required />
            </div>

            {/* Ville & Urgence */}
            <div className="form-row">
              <div className="form-group">
                <label>{t('creer_campagne.ville', 'Ville')} *</label>
                <input type="text" name="ville" value={formData.ville} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>{t('creer_campagne.urgence', "Niveau d'urgence")}</label>
                <select name="urgence" value={formData.urgence} onChange={handleChange}>
                  <option value="normale">{t('creer_campagne.urgence_normale', 'Moyenne')}</option>
                  <option value="urgente">{t('creer_campagne.urgence_urgente', 'Urgente')}</option>
                  <option value="critique">{t('creer_campagne.urgence_critique', 'Critique')}</option>
                </select>
              </div>
            </div>

            {/* Date de fin */}
            <div className="form-group">
              <label>{t('creer_campagne.date_fin', 'Date de fin')} *</label>
              <input type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} required />
            </div>

            {/* Objectif financier (si type = financier) */}
            {formData.type_campagne === 'financier' && (
              <div className="form-group">
                <label>{t('creer_campagne.objectif_financier', 'Objectif financier (TND)')} *</label>
                <input type="number" name="objectif" value={formData.objectif} onChange={handleChange} step="1" required />
              </div>
            )}

            {/* Cas Kafala : objectif optionnel + besoin */}
            {formData.type_campagne === 'kafala' && (
              <>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" checked={avecObjectif} onChange={(e) => setAvecObjectif(e.target.checked)} />
                    {t('creer_campagne.objectif_optionnel', 'Cette campagne a un objectif financier')}
                  </label>
                </div>
                {avecObjectif && (
                  <div className="form-group">
                    <label>{t('creer_campagne.objectif_financier', 'Objectif financier (TND)')}</label>
                    <input type="number" name="objectif" value={formData.objectif} onChange={handleChange} step="1" />
                  </div>
                )}
                <div className="form-group">
                  <label>
                    {t('creer_campagne.description_besoin', 'Description du besoin')}
                    {!avecObjectif && '*'}
                  </label>
                  <textarea name="besoinMateriel" rows="3" value={formData.besoinMateriel} onChange={handleChange} required={!avecObjectif} />
                </div>
              </>
            )}

            {/* Autres types (matériel, compétences) : besoin obligatoire */}
            {!['financier', 'kafala'].includes(formData.type_campagne) && (
              <div className="form-group">
                <label>{t('creer_campagne.description_besoin', 'Description du besoin')} *</label>
                <textarea name="besoinMateriel" rows="3" value={formData.besoinMateriel} onChange={handleChange} required />
              </div>
            )}

            {/* Image */}
            <div className="form-group">
              <label>{t('creer_campagne.image_optionnelle', 'Image de la campagne (optionnel)')}</label>
              <div className="file-upload">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*, .pdf" />
                <button type="button" onClick={handleParcourirClick} className="btn-outline">
                  <FaImage /> {t('creer_campagne.choisir_fichier', 'Choisir un fichier')}
                </button>
                <span className="file-name">{formData.image ? formData.image.name : t('creer_campagne.aucun_fichier', 'Aucun fichier choisi')}</span>
              </div>
              {imagePreview && <div className="image-preview"><img src={imagePreview} alt={t('creer_campagne.apercu', 'Aperçu')} /></div>}
              <small>{t('creer_campagne.formats_acceptes', 'Formats acceptés : images (tous formats) et PDF (max 5 Mo)')}</small>
            </div>

            <button type="submit" className="btn-submit">
              <FaBullhorn /> {t('creer_campagne.btn_creer', 'Créer la campagne')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreerCampagne;