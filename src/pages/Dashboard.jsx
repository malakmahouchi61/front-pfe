import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [dons, setDons] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [modal, setModal] = useState({ open: false, action: null, type: null, id: null, name: '', title: '', message: '' });

  const formatNumber = (num) => {
    const number = Number(num);
    if (isNaN(number)) return '0,00';
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');
  };

  const refreshCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { console.warn('Impossible de rafraîchir l’utilisateur'); return; }
      const updatedUser = await res.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (login) login(token, updatedUser);
    } catch (err) { console.error('Erreur rafraîchissement utilisateur:', err); }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [donsRes, demandesRes, campagnesRes] = await Promise.all([
          fetch('/dons/en-attente', { headers }),
          fetch('/demandes?statut=en_attente', { headers }),
          fetch('/campagnes?statut=en_attente', { headers }),
        ]);
        if (!donsRes.ok) throw new Error('Erreur chargement dons');
        if (!demandesRes.ok) throw new Error('Erreur chargement demandes');
        if (!campagnesRes.ok) throw new Error('Erreur chargement campagnes');
        const donsData = await donsRes.json();
        const demandesData = await demandesRes.json();
        const campagnesData = await campagnesRes.json();
        setDons(Array.isArray(donsData) ? donsData : []);
        setDemandes(Array.isArray(demandesData) ? demandesData : []);
        setCampagnes(Array.isArray(campagnesData) ? campagnesData : []);
      } catch (error) { console.error(error); setMessage({ type: 'error', text: t('dashboard.erreur_chargement', 'Erreur de chargement des données') }); } finally { setLoading(false); }
    };
    fetchAll();
  }, [t]);

  const showMessage = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); };
  const openModal = (action, type, id, name) => {
    const actionText = action === 'validate' ? t('dashboard.valider', 'valider') : t('dashboard.refuser', 'refuser');
    const typeName = type === 'don' ? t('dashboard.type_don', 'ce don') : type === 'demande' ? t('dashboard.type_demande', 'cette demande') : t('dashboard.type_campagne', 'cette campagne');
    setModal({
      open: true, action, type, id, name,
      title: action === 'validate' ? t('dashboard.modal_validation_titre', 'Valider') : t('dashboard.modal_refus_titre', 'Refuser'),
      message: t('dashboard.modal_message', `Êtes-vous sûr de vouloir ${actionText} ${typeName} "${name}" ?`)
    });
  };
  const closeModal = () => setModal({ ...modal, open: false });

  const confirmAction = async () => {
    const { action, type, id } = modal;
    try {
      const token = localStorage.getItem('token');
      let res;
      if (type === 'don') {
        const endpoint = action === 'validate' ? `/dons/${id}/valider` : `/dons/${id}/refuser`;
        res = await fetch(endpoint, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { setDons(dons.filter(d => d.id_don !== id)); showMessage('success', t('dashboard.don_action_succes', `Don ${action === 'validate' ? 'validé' : 'refusé'} avec succès`)); await refreshCurrentUser(); }
        else { const err = await res.json(); showMessage('error', err.error || t('common.erreur', 'Erreur')); }
      } else if (type === 'demande') {
        const newStatus = action === 'validate' ? 'validée' : 'refusée';
        res = await fetch(`/demandes/${id}/statut`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ etat_demande: newStatus }) });
        if (res.ok) { setDemandes(demandes.filter(d => d.id_demande !== id)); showMessage('success', t('dashboard.demande_action_succes', `Demande ${action === 'validate' ? 'validée' : 'refusée'} avec succès`)); await refreshCurrentUser(); }
        else { const err = await res.json(); showMessage('error', err.error || t('common.erreur', 'Erreur')); }
      } else if (type === 'campagne') {
        const newStatus = action === 'validate' ? 'active' : 'refusée';
        res = await fetch(`/campagnes/${id}/statut`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ statut: newStatus }) });
        if (res.ok) { setCampagnes(campagnes.filter(c => c.id_campagne !== id)); showMessage('success', t('dashboard.campagne_action_succes', `Campagne ${action === 'validate' ? 'validée' : 'refusée'} avec succès`)); await refreshCurrentUser(); }
        else { const err = await res.json(); showMessage('error', err.error || t('common.erreur', 'Erreur')); }
      }
    } catch (err) { console.error(err); showMessage('error', t('dashboard.erreur_reseau', 'Erreur réseau')); } finally { closeModal(); }
  };

  if (loading) return <div className="loading">{t('common.chargement', 'Chargement...')}</div>;

  return (
    <div className="dashboard-modern">
      <div className="dashboard-header">
        <h1>{t('dashboard.titre', 'Tableau de bord administrateur')}</h1>
        <p className="welcome">{t('dashboard.bienvenue', 'Bienvenue, {name}', { name: user?.prenom || user?.nom || 'Admin' })}</p>
      </div>
      {message.text && <div className={`alert ${message.type}`}>{message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}<span>{message.text}</span></div>}
      <div className="dashboard-columns">
        {/* Dons en attente */}
        <div className="dashboard-column">
          <div className="column-header"><h2>{t('dashboard.dons_attente', 'Dons en attente')} ({dons.length})</h2></div>
          <div className="cards-container">
            {dons.length === 0 ? (<p className="no-data">{t('dashboard.aucun_don', 'Aucun don en attente')}</p>) : (
              dons.map(don => (
                <div key={don.id_don} className="card">
                  <div className="card-header">
                    <span className="card-type">{don.type_don}</span>
                    <span className="card-date">{new Date(don.date_don).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>{t('dashboard.donateur', 'Donateur')} :</strong> {don.nom_donateur || 'Anonyme'} {don.prenom_donateur || ''}</p>
                    {don.montant && <p><strong>{t('dashboard.montant', 'Montant')} :</strong> {formatNumber(don.montant)} TND</p>}
                    {don.description && <p><strong>{t('dashboard.description', 'Description')} :</strong> {don.description}</p>}
                    {don.quantite && <p><strong>{t('dashboard.quantite', 'Quantité')} :</strong> {don.quantite}</p>}
                    {don.id_demande && <p><strong>{t('dashboard.demande', 'Demande')} :</strong> {don.titre_demande || `#${don.id_demande}`}</p>}
                    {don.id_campagne && <p><strong>{t('dashboard.campagne', 'Campagne')} :</strong> {don.titre_campagne || `#${don.id_campagne}`}</p>}
                  </div>
                  <div className="card-actions">
                    <button className="btn-valider" onClick={() => openModal('validate', 'don', don.id_don, don.nom_donateur || `Don #${don.id_don}`)}><FaCheck /> {t('dashboard.btn_valider', 'Valider')}</button>
                    <button className="btn-refuser" onClick={() => openModal('refuse', 'don', don.id_don, don.nom_donateur || `Don #${don.id_don}`)}><FaTimes /> {t('dashboard.btn_refuser', 'Refuser')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Demandes en attente */}
        <div className="dashboard-column">
          <div className="column-header"><h2>{t('dashboard.demandes_attente', 'Demandes en attente')} ({demandes.length})</h2></div>
          <div className="cards-container">
            {demandes.length === 0 ? (<p className="no-data">{t('dashboard.aucune_demande', 'Aucune demande en attente')}</p>) : (
              demandes.map(dem => (
                <div key={dem.id_demande} className="card">
                  <div className="card-header">
                    <span className="card-type">{dem.type_demande}</span>
                    {dem.urgence === 'urgente' && <span className="card-urgent">⚠️ {t('dashboard.urgent', 'Urgent')}</span>}
                  </div>
                  <div className="card-body">
                    <p><strong>{t('dashboard.titre_demande', 'Titre')} :</strong> {dem.titre || dem.description?.split('\n')[0]}</p>
                    <p><strong>{t('dashboard.beneficiaire', 'Bénéficiaire')} :</strong> {dem.nom} {dem.prenom}</p>
                    <p><strong>{t('dashboard.objectif', 'Objectif')} :</strong> {formatNumber(dem.objectif)} TND</p>
                    <p><strong>{t('dashboard.date_fin', 'Date fin')} :</strong> {new Date(dem.date_fin).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="card-actions">
                    <button className="btn-valider" onClick={() => openModal('validate', 'demande', dem.id_demande, dem.titre || `Demande #${dem.id_demande}`)}><FaCheck /> {t('dashboard.btn_valider', 'Valider')}</button>
                    <button className="btn-refuser" onClick={() => openModal('refuse', 'demande', dem.id_demande, dem.titre || `Demande #${dem.id_demande}`)}><FaTimes /> {t('dashboard.btn_refuser', 'Refuser')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Campagnes en attente */}
        <div className="dashboard-column">
          <div className="column-header"><h2>{t('dashboard.campagnes_attente', 'Campagnes en attente')} ({campagnes.length})</h2></div>
          <div className="cards-container">
            {campagnes.length === 0 ? (<p className="no-data">{t('dashboard.aucune_campagne', 'Aucune campagne en attente')}</p>) : (
              campagnes.map(camp => (
                <div key={camp.id_campagne} className="card">
                  <div className="card-header"><span className="card-type">{camp.type_campagne}</span></div>
                  <div className="card-body">
                    <p><strong>{t('dashboard.titre_campagne', 'Titre')} :</strong> {camp.titre}</p>
                    <p><strong>{t('dashboard.association', 'Association')} :</strong> {camp.nom} {camp.prenom}</p>
                    <p><strong>{t('dashboard.objectif', 'Objectif')} :</strong> {formatNumber(camp.objectif)} TND</p>
                    <p><strong>{t('dashboard.date_fin', 'Date fin')} :</strong> {new Date(camp.date_fin).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="card-actions">
                    <button className="btn-valider" onClick={() => openModal('validate', 'campagne', camp.id_campagne, camp.titre)}><FaCheck /> {t('dashboard.btn_valider', 'Valider')}</button>
                    <button className="btn-refuser" onClick={() => openModal('refuse', 'campagne', camp.id_campagne, camp.titre)}><FaTimes /> {t('dashboard.btn_refuser', 'Refuser')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modale de confirmation */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-container ${modal.action === 'validate' ? 'validate' : 'refuse'}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{modal.title}</h3><button className="modal-close" onClick={closeModal}>&times;</button></div>
            <div className="modal-body"><p>{modal.message}</p></div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={closeModal}>{t('common.annuler', 'Annuler')}</button>
              <button className={`modal-btn confirm ${modal.action}`} onClick={confirmAction}>
                {modal.action === 'validate' ? t('dashboard.confirmer_valider', 'Valider') : t('dashboard.confirmer_refuser', 'Refuser')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;