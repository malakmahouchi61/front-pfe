import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './DemandeAide.css';

const DemandeAide = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    type: 'kafala',
    titre: '',
    description: '',
    ville: '',
    urgence: 'normale',
    objectif: '',
    dateFin: '',
    besoinMateriel: '',
    fichier: null,
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

  const handleParcourirClick = () => fileInputRef.current.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert(t('demande_aide.erreur_non_connecte', 'Utilisateur non connecté'));
      return;
    }
    if (formData.type === 'financier' && !formData.objectif) {
      alert(t('demande_aide.erreur_objectif_financier', 'Veuillez saisir un objectif financier.'));
      return;
    }
    if (formData.type === 'kafala' && kafalaAvecObjectif && !formData.objectif) {
      alert(t('demande_aide.erreur_objectif_kafala', 'Veuillez saisir un objectif financier pour cette demande.'));
      return;
    }
    if (formData.type !== 'financier' && !kafalaAvecObjectif && !formData.besoinMateriel) {
      alert(t('demande_aide.erreur_besoin', 'Veuillez décrire le besoin.'));
      return;
    }
    if (!formData.dateFin) {
      alert(t('demande_aide.erreur_date_fin', 'Veuillez saisir une date de fin.'));
      return;
    }

    let objectifValue = formData.objectif ? Math.round(parseFloat(formData.objectif)) : 0;

    let fullDescription = `${formData.titre}\n\n${formData.description}\n\n${t('demande_aide.ville_label', 'Ville')}: ${formData.ville}\n${t('demande_aide.urgence_label', 'Urgence')}: ${formData.urgence}\n${t('demande_aide.date_fin_label', 'Date fin')}: ${formData.dateFin}`;
    if (formData.type === 'financier') {
      fullDescription += `\n${t('demande_aide.objectif_label', 'Objectif')}: ${objectifValue} TND`;
    } else if (formData.type === 'kafala') {
      if (kafalaAvecObjectif) fullDescription += `\n${t('demande_aide.objectif_label', 'Objectif')}: ${objectifValue} TND`;
      fullDescription += `\n${t('demande_aide.besoin_label', 'Besoin')}: ${formData.besoinMateriel}`;
    } else {
      fullDescription += `\n${t('demande_aide.besoin_label', 'Besoin')}: ${formData.besoinMateriel}`;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('id_beneficiaire', user.id_utilisateur);
    formDataToSend.append('type_demande', formData.type);
    formDataToSend.append('description', fullDescription);
    formDataToSend.append('objectif', objectifValue);
    formDataToSend.append('date_fin', formData.dateFin);
    formDataToSend.append('ville', formData.ville);
    formDataToSend.append('urgence', formData.urgence);
    if (formData.fichier) formDataToSend.append('piece_justificative', formData.fichier);

    try {
      const response = await fetch('/demandes', { method: 'POST', body: formDataToSend });
      const result = await response.json();
      if (response.ok) {
        alert(t('demande_aide.succes', '✅ Demande envoyée avec succès ! Elle sera examinée par l’équipe.'));
        navigate('/');
      } else {
        alert(t('demande_aide.erreur_serveur', 'Erreur : ') + (result.error || ''));
      }
    } catch (err) {
      console.error(err);
      alert(t('demande_aide.erreur_connexion', 'Problème de connexion au serveur.'));
    }
  };

  return (
    <div className="demande-page-simple">
      <div className="container-simple">
        <Link to="/" className="back-link">
          <FaArrowLeft /> {t('demande_aide.retour', 'Retour')}
        </Link>
        <div className="form-card">
          <h1>{t('demande_aide.titre', 'Demander de l’aide')}</h1>
          <p className="subtitle">
            {t('demande_aide.sous_titre', 'Remplissez ce formulaire pour soumettre votre besoin. L’équipe Sanad l’étudiera et le publiera s’il correspond à nos critères.')}
          </p>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>{t('demande_aide.type_aide', 'Type d’aide recherché')} *</label>
              <select
                name="type"
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value });
                  setKafalaAvecObjectif(false);
                }}
                required
              >
                <option value="kafala">{t('demande_aide.type_kafala', 'Kafala (parrainage)')}</option>
                <option value="financier">{t('demande_aide.type_financier', 'Aide financière')}</option>
                <option value="materiel">{t('demande_aide.type_materiel', 'Aide matérielle')}</option>
                <option value="competences">{t('demande_aide.type_competences', 'Compétences / Bénévolat')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('demande_aide.titre_demande', 'Titre de la demande')} *</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder={t('demande_aide.titre_placeholder', 'Ex: Aide pour scolariser mes enfants')}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('demande_aide.description', 'Description détaillée')} *</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('demande_aide.description_placeholder', 'Décrivez votre situation, vos besoins, le nombre de personnes concernées...')}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('demande_aide.ville', 'Ville')} *</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder={t('demande_aide.ville_placeholder', 'Ville, région')}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('demande_aide.urgence', "Niveau d'urgence")}</label>
                <select name="urgence" value={formData.urgence} onChange={handleChange}>
                  <option value="normale">{t('demande_aide.urgence_normale', 'Moyenne')}</option>
                  <option value="urgente">{t('demande_aide.urgence_urgente', 'Urgente')}</option>
                  <option value="critique">{t('demande_aide.urgence_critique', 'Critique')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>{t('demande_aide.date_fin', 'Date de fin de la demande')} *</label>
              <input type="date" name="dateFin" value={formData.dateFin} onChange={handleChange} required />
            </div>

            {formData.type === 'financier' && (
              <div className="form-group">
                <label>{t('demande_aide.objectif_financier', 'Objectif financier (TND)')} *</label>
                <input
                  type="number"
                  name="objectif"
                  value={formData.objectif}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </div>
            )}

            {formData.type === 'kafala' && (
              <>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={kafalaAvecObjectif}
                      onChange={(e) => setKafalaAvecObjectif(e.target.checked)}
                    />
                    {t('demande_aide.objectif_optionnel', 'Cette demande a un objectif financier')}
                  </label>
                </div>
                {kafalaAvecObjectif && (
                  <div className="form-group">
                    <label>{t('demande_aide.objectif_financier', 'Objectif financier (TND)')} *</label>
                    <input
                      type="number"
                      name="objectif"
                      value={formData.objectif}
                      onChange={handleChange}
                      min="1"
                      step="1"
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>
                    {kafalaAvecObjectif
                      ? t('demande_aide.description_besoin_optionnel', 'Description du besoin (optionnelle)')
                      : t('demande_aide.description_besoin', 'Description du besoin') + ' *'}
                  </label>
                  <textarea
                    name="besoinMateriel"
                    rows="3"
                    value={formData.besoinMateriel}
                    onChange={handleChange}
                    placeholder={t('demande_aide.besoin_placeholder', 'Décrivez le contexte...')}
                    required={!kafalaAvecObjectif}
                  />
                </div>
              </>
            )}

            {formData.type && formData.type !== 'financier' && formData.type !== 'kafala' && (
              <div className="form-group">
                <label>{t('demande_aide.description_besoin', 'Description du besoin')} *</label>
                <textarea
                  name="besoinMateriel"
                  rows="3"
                  value={formData.besoinMateriel}
                  onChange={handleChange}
                  placeholder={t('demande_aide.besoin_placeholder_materiel', 'Décrivez précisément ce dont vous avez besoin...')}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>{t('demande_aide.pieces_justificatives', 'Pièces justificatives (optionnel)')}</label>
              <div className="file-upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*, .pdf"
                  id="file-input"
                />
                <button type="button" onClick={handleParcourirClick} className="btn-outline">
                  <FaImage /> {t('demande_aide.choisir_fichier', 'Choisir un fichier')}
                </button>
                <span className="file-name">
                  {formData.fichier ? formData.fichier.name : t('demande_aide.aucun_fichier', 'Aucun fichier choisi')}
                </span>
              </div>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt={t('demande_aide.apercu', 'Aperçu')} />
                </div>
              )}
              <small>{t('demande_aide.formats_acceptes', 'Formats acceptés : images (tous formats) et PDF (max 5 Mo)')}</small>
            </div>

            <button type="submit" className="btn-submit">
              {t('demande_aide.btn_envoyer', 'Envoyer la demande')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DemandeAide;