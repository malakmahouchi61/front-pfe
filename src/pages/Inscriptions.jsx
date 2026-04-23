import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaHandHoldingHeart, FaUserPlus, FaBuilding, FaUser, FaCamera, FaTrash } from 'react-icons/fa';
import "./Inscriptions.css";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Inscriptions = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("donateur");
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ville, setVille] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const fileInputRef = useRef(null);

  const roles = [
    {
      id: "donateur",
      label: t('auth.role_donateur', "Donateur / Kafil"),
      desc: t('auth.role_donateur_desc', "Je veux aider et faire des dons"),
      icon: <FaHandHoldingHeart className="role-icon" />
    },
    {
      id: "beneficiaire",
      label: t('auth.role_beneficiaire', "Bénéficiaire"),
      desc: t('auth.role_beneficiaire_desc', "J'ai besoin d'aide"),
      icon: <FaUserPlus className="role-icon" />
    },
    {
      id: "ong",
      label: t('auth.role_association', "Association / ONG"),
      desc: t('auth.role_association_desc', "Je gère des projets caritatifs"),
      icon: <FaBuilding className="role-icon" />
    },
  ];

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError(t('auth.erreur_format_fichier', "Seuls les fichiers JPG, PNG et PDF sont acceptés."));
        e.target.value = '';
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPreview(null);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();
  const openZoom = () => { if (preview) setShowZoom(true); };
  const closeZoom = () => setShowZoom(false);

  const deletePhoto = (e) => {
    e.stopPropagation();
    setPhotoFile(null);
    setPreview(null);
    setShowZoom(false);
    fileInputRef.current.value = '';
  };

  const handlePreferenceChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setPreferences(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let roleBDD = selectedRole;
    if (selectedRole === 'ong') roleBDD = 'Association';
    else if (selectedRole === 'beneficiaire') roleBDD = 'Beneficiaire';
    else if (selectedRole === 'donateur') roleBDD = 'Donateur';

    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('prenom', prenom);
    formData.append('email', email);
    formData.append('mot_de_passe', password);
    formData.append('role', roleBDD);
    if (photoFile) formData.append('avatar', photoFile);
    formData.append('ville', ville);
    formData.append('preferences', JSON.stringify(preferences));

    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('auth.erreur_inscription', "Erreur lors de l'inscription"));
      localStorage.setItem('token', data.token);
      login(data.user);
      navigate('/accueil');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-wrapper">
      <div className="inscription-card">
        <h1 className="card-title">{t('auth.inscription_titre', 'Créer un compte')}</h1>
        <p className="card-subtitle">{t('auth.inscription_sous_titre', 'Choisissez votre rôle pour commencer')}</p>

        {/* Avatar */}
        <div className="avatar-container">
          <div className="avatar-wrapper">
            <div className={`avatar-circle-large ${preview ? 'has-photo' : ''}`} onClick={openZoom}>
              {preview ? <img src={preview} alt={t('auth.avatar', 'avatar')} className="avatar-preview" /> : <FaUser className="avatar-icon-large" />}
              <div className="camera-badge" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                <FaCamera className="badge-icon" />
              </div>
            </div>
          </div>
          <span className="avatar-upload-text">{t('auth.avatar_upload_text', 'Ajouter une photo (optionnel)')}</span>
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} />
        </div>

        {showZoom && preview && (
          <div className="zoom-overlay" onClick={closeZoom}>
            <div className="zoom-modal" onClick={(e) => e.stopPropagation()}>
              <div className="zoom-circle"><img src={preview} alt={t('auth.zoom', "zoom")} /></div>
              <button className="delete-btn" onClick={deletePhoto} title={t('auth.supprimer_photo', "Supprimer la photo")}><FaTrash /></button>
              <button className="close-btn" onClick={closeZoom}>×</button>
            </div>
          </div>
        )}

        <div className="role-section">
          <span className="role-label">{t('auth.votre_role', 'VOTRE RÔLE')}</span>
          <div className="role-options">
            {roles.map((role) => (
              <div key={role.id} className={`role-option ${selectedRole === role.id ? "selected" : ""}`} onClick={() => setSelectedRole(role.id)}>
                <div className="role-content">
                  <span className="role-title">{role.icon} {role.label}</span>
                  <span className="role-desc">{role.desc}</span>
                </div>
                <div className="role-check"><span className={`custom-radio ${selectedRole === role.id ? 'selected' : ''}`} /></div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="inscription-form">
          <div className="form-group">
            <label>{t('auth.nom', 'NOM')}</label>
            <input type="text" placeholder={t('auth.nom_placeholder', 'Votre nom')} value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t('auth.prenom', 'PRÉNOM')}</label>
            <input type="text" placeholder={t('auth.prenom_placeholder', 'Votre prénom')} value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t('auth.email', 'EMAIL')}</label>
            <input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t('auth.mot_de_passe', 'MOT DE PASSE')}</label>
            <input type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>{t('auth.ville_optionnel', 'VILLE (optionnel)')}</label>
            <input type="text" placeholder={t('auth.ville_placeholder', 'Votre ville')} value={ville} onChange={(e) => setVille(e.target.value)} />
          </div>

          <div className="form-group">
            <label>{t('auth.centres_interet', 'VOS CENTRES D’INTÉRÊT (optionnel)')}</label>
            <select multiple value={preferences} onChange={handlePreferenceChange} style={{ height: '100px' }}>
              <option value="éducation">{t('auth.education', 'Éducation')}</option>
              <option value="santé">{t('auth.sante', 'Santé')}</option>
              <option value="environnement">{t('auth.environnement', 'Environnement')}</option>
              <option value="urgence">{t('auth.urgence', 'Urgence')}</option>
              <option value="eau">{t('auth.eau', 'Eau')}</option>
              <option value="nourriture">{t('auth.nourriture', 'Nourriture')}</option>
              <option value="enfants">{t('auth.enfants', 'Enfants')}</option>
              <option value="personnes_agees">{t('auth.personnes_agees', 'Personnes âgées')}</option>
            </select>
            <small>{t('auth.select_multiple_hint', 'Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs')}</small>
          </div>

          <button type="submit" className="btn-inscription" disabled={loading}>
            {loading ? t('common.chargement', 'Inscription...') : t('auth.btn_inscription', "S'inscrire")}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>

        <p className="connexion-lien">
          {t('auth.deja_compte', 'Déjà un compte ?')} <Link to="/connexion">{t('auth.connexion_lien', 'Se connecter')}</Link>
        </p>
        <Link to="/accueil" className="retour-accueil">{t('auth.retour_accueil', '← Retour à l’accueil')}</Link>
      </div>
    </div>
  );
};

export default Inscriptions;