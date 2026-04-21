import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaTrash, FaUser, FaEnvelope, FaKey, FaCheck } from 'react-icons/fa';
import './Profil.css';

const Profil = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '' });
  const [originalUser, setOriginalUser] = useState({ nom: '', prenom: '', email: '' });
  const [passwordData, setPasswordData] = useState({ ancien: '', nouveau: '', confirm: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showZoom, setShowZoom] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ valid: false, message: '' });

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    if (pwd.length === 0) return { valid: false, message: '' };
    if (pwd.length < minLength) return { valid: false, message: `Au moins ${minLength} caractères` };
    if (!hasLetter) return { valid: false, message: 'Au moins une lettre' };
    if (!hasNumber) return { valid: false, message: 'Au moins un chiffre' };
    return { valid: true, message: 'Mot de passe fort ✓' };
  };

  const hasChanges = () => (formData.nom !== originalUser.nom || formData.prenom !== originalUser.prenom || formData.email !== originalUser.email);
  const isPasswordValid = () => (passwordData.ancien.trim() !== '' && passwordData.nouveau.trim() !== '' && passwordData.nouveau === passwordData.confirm && passwordStrength.valid);
  const handleUnauthorized = () => { logout(); navigate('/connexion'); setMessage({ type: 'error', text: 'Session expirée, veuillez vous reconnecter.' }); };

  useEffect(() => {
    if (!user) { navigate('/connexion'); return; }
    const initialData = { nom: user.nom || '', prenom: user.prenom || '', email: user.email || '' };
    setFormData(initialData);
    setOriginalUser(initialData);
    setAvatarPreview(user.avatar ? `http://localhost:3000${user.avatar}` : null);
  }, [user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (name === 'nouveau') setPasswordStrength(validatePassword(value));
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const triggerFileInput = () => fileInputRef.current.click();
  const openZoom = () => avatarPreview && setShowZoom(true);
  const closeZoom = () => setShowZoom(false);
  const deletePhoto = (e) => { e.stopPropagation(); setAvatarFile(null); setAvatarPreview(null); setShowZoom(false); fileInputRef.current.value = ''; };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploading(true);
    setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const res = await fetch(`http://localhost:3000/users/${user.id_utilisateur}/avatar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur upload');
      const updatedUser = { ...user, avatar: data.avatar };
      const token = localStorage.getItem('token');
      login(token, updatedUser);
      setMessage({ type: 'success', text: 'Photo mise à jour' });
      setAvatarFile(null);
    } catch (err) { console.error(err); setMessage({ type: 'error', text: err.message }); } finally { setUploading(false); }
  };

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    if (!hasChanges()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/users/${user.id_utilisateur}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur mise à jour');
      login(token, data);
      setOriginalUser({ nom: data.nom, prenom: data.prenom, email: data.email });
      setMessage({ type: 'success', text: 'Informations mises à jour' });
    } catch (err) { console.error(err); setMessage({ type: 'error', text: err.message }); } finally { setLoading(false); }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/users/${user.id_utilisateur}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: passwordData.ancien, newPassword: passwordData.nouveau }),
      });
      if (res.status === 401) { handleUnauthorized(); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur changement mot de passe');
      setMessage({ type: 'success', text: 'Mot de passe modifié' });
      setPasswordData({ ancien: '', nouveau: '', confirm: '' });
      setPasswordStrength({ valid: false, message: '' });
    } catch (err) { console.error(err); setMessage({ type: 'error', text: err.message }); } finally { setLoading(false); }
  };

  const handleCancel = () => { setFormData(originalUser); setMessage({ type: '', text: '' }); };

  return (
    <div className="profil-container">
      <div className="profil-header"><h1>Mon Profil</h1><p className="subtitle">Gérez vos informations personnelles et votre sécurité</p></div>
      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
      <div className="profil-grid">
        <div className="avatar-card">
          <h2>Photo de profil</h2>
          <div className="avatar-wrapper">
            <div className={`avatar-circle ${avatarPreview ? 'has-photo' : ''}`} onClick={openZoom}>
              {avatarPreview ? <img src={avatarPreview} alt="avatar" className="avatar-preview" /> : <FaUser className="avatar-icon" />}
              <div className="camera-badge" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}><FaCamera /></div>
            </div>
            {avatarFile && <button className="btn-avatar-save" onClick={handleAvatarUpload} disabled={uploading}>{uploading ? 'Enregistrement...' : 'Enregistrer la photo'}</button>}
          </div>
          <p className="avatar-hint">Cliquez sur l'icône caméra pour modifier</p>
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept=".jpg,.jpeg,.png" style={{ display: 'none' }} />
        </div>
        <div className="info-column">
          <div className="info-card">
            <h2>Informations personnelles</h2>
            <form onSubmit={handleSubmitInfo}>
              <div className="form-group"><label>NOM</label><input type="text" name="nom" value={formData.nom} onChange={handleChange} required /></div>
              <div className="form-group"><label>PRÉNOM</label><input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required /></div>
              <div className="form-group"><label>EMAIL</label><div className="input-with-icon"><FaEnvelope className="input-icon" /><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div></div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={!hasChanges() || loading}>{loading ? 'Mise à jour...' : 'Mettre à jour'}</button>
                {hasChanges() && <button type="button" className="btn-cancel" onClick={handleCancel}>Annuler</button>}
              </div>
            </form>
          </div>
          <div className="security-card">
            <h2>Sécurité</h2>
            <form onSubmit={handleSubmitPassword}>
              <div className="form-group"><label>ANCIEN MOT DE PASSE</label><div className="input-with-icon"><FaKey className="input-icon" /><input type="password" name="ancien" value={passwordData.ancien} onChange={handlePasswordChange} required /></div></div>
              <div className="form-group"><label>NOUVEAU MOT DE PASSE</label><input type="password" name="nouveau" value={passwordData.nouveau} onChange={handlePasswordChange} required />
                {passwordData.nouveau && <small className={passwordStrength.valid ? 'success-message' : 'error-message'}>{passwordStrength.message}</small>}
              </div>
              <div className="form-group"><label>CONFIRMER</label><input type="password" name="confirm" value={passwordData.confirm} onChange={handlePasswordChange} required />
                {passwordData.nouveau && passwordData.confirm && passwordData.nouveau !== passwordData.confirm && <small className="error-message">Les mots de passe ne correspondent pas</small>}
              </div>
              <button type="submit" className="btn-primary" disabled={!isPasswordValid() || loading}><FaCheck style={{ marginRight: '0.5rem' }} /> Changer le mot de passe</button>
            </form>
          </div>
        </div>
      </div>
      {showZoom && avatarPreview && (
        <div className="zoom-overlay" onClick={closeZoom}>
          <div className="zoom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="zoom-circle"><img src={avatarPreview} alt="zoom" /></div>
            <button className="delete-btn" onClick={deletePhoto} title="Supprimer la photo"><FaTrash /></button>
            <button className="close-btn" onClick={closeZoom}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;