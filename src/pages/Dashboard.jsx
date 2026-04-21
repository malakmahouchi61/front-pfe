import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaCheck, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
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
      const res = await fetch('http://localhost:3000/users/me', { headers: { Authorization: `Bearer ${token}` } });
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
          fetch('http://localhost:3000/dons/en-attente', { headers }),
          fetch('http://localhost:3000/demandes?statut=en_attente', { headers }),
          fetch('http://localhost:3000/campagnes?statut=en_attente', { headers }),
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
      } catch (error) { console.error(error); setMessage({ type: 'error', text: 'Erreur de chargement des données' }); } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const showMessage = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); };
  const openModal = (action, type, id, name) => {
    const actionText = action === 'validate' ? 'valider' : 'refuser';
    const typeName = type === 'don' ? 'ce don' : type === 'demande' ? 'cette demande' : 'cette campagne';
    setModal({ open: true, action, type, id, name, title: action === 'validate' ? 'Valider' : 'Refuser', message: `Êtes-vous sûr de vouloir ${actionText} ${typeName} "${name}" ?` });
  };
  const closeModal = () => setModal({ ...modal, open: false });

  const confirmAction = async () => {
    const { action, type, id } = modal;
    try {
      const token = localStorage.getItem('token');
      let res;
      if (type === 'don') {
        const endpoint = action === 'validate' ? `http://localhost:3000/dons/${id}/valider` : `http://localhost:3000/dons/${id}/refuser`;
        res = await fetch(endpoint, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { setDons(dons.filter(d => d.id_don !== id)); showMessage('success', `Don ${action === 'validate' ? 'validé' : 'refusé'} avec succès`); await refreshCurrentUser(); }
        else { const err = await res.json(); showMessage('error', err.error || 'Erreur'); }
      } else if (type === 'demande') {
        const newStatus = action === 'validate' ? 'validée' : 'refusée';
        res = await fetch(`http://localhost:3000/demandes/${id}/statut`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ etat_demande: newStatus }) });
        if (res.ok) { setDemandes(demandes.filter(d => d.id_demande !== id)); showMessage('success', `Demande ${action === 'validate' ? 'validée' : 'refusée'} avec succès`); await refreshCurrentUser(); }
        else { const err = await res.json(); showMessage('error', err.error || 'Erreur'); }
      } else if (type === 'campagne') {
        const newStatus = action === 'validate' ? 'active' : 'refusée';
        res = await fetch(`http://localhost:3000/campagnes/${id}/statut`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ statut: newStatus }) });
        if (res.ok) { setCampagnes(campagnes.filter(c => c.id_campagne !== id)); showMessage('success', `Campagne ${action === 'validate' ? 'validée' : 'refusée'} avec succès`); await refreshCurrentUser(); }
        else { const err = await res.json(); showMessage('error', err.error || 'Erreur'); }
      }
    } catch (err) { console.error(err); showMessage('error', 'Erreur réseau'); } finally { closeModal(); }
  };

  if (loading) return <div className="loading">Chargement du tableau de bord...</div>;

  return (
    <div className="dashboard-modern">
      <div className="dashboard-header"><h1>Tableau de bord administrateur</h1><p className="welcome">Bienvenue, {user?.prenom || user?.nom || 'Admin'}</p></div>
      {message.text && <div className={`alert ${message.type}`}>{message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}<span>{message.text}</span></div>}
      <div className="dashboard-columns">
        <div className="dashboard-column"><div className="column-header"><h2>Dons en attente ({dons.length})</h2></div><div className="cards-container">
          {dons.length === 0 ? (<p className="no-data">Aucun don en attente</p>) : (dons.map(don => (<div key={don.id_don} className="card"><div className="card-header"><span className="card-type">{don.type_don}</span><span className="card-date">{new Date(don.date_don).toLocaleDateString('fr-FR')}</span></div><div className="card-body"><p><strong>Donateur :</strong> {don.nom_donateur || 'Anonyme'} {don.prenom_donateur || ''}</p>{don.montant && <p><strong>Montant :</strong> {formatNumber(don.montant)} TND</p>}{don.description && <p><strong>Description :</strong> {don.description}</p>}{don.quantite && <p><strong>Quantité :</strong> {don.quantite}</p>}{don.id_demande && <p><strong>Demande :</strong> {don.titre_demande || `#${don.id_demande}`}</p>}{don.id_campagne && <p><strong>Campagne :</strong> {don.titre_campagne || `#${don.id_campagne}`}</p>}</div><div className="card-actions"><button className="btn-valider" onClick={() => openModal('validate', 'don', don.id_don, don.nom_donateur || `Don #${don.id_don}`)}><FaCheck /> Valider</button><button className="btn-refuser" onClick={() => openModal('refuse', 'don', don.id_don, don.nom_donateur || `Don #${don.id_don}`)}><FaTimes /> Refuser</button></div></div>)))}
        </div></div>
        <div className="dashboard-column"><div className="column-header"><h2>Demandes en attente ({demandes.length})</h2></div><div className="cards-container">
          {demandes.length === 0 ? (<p className="no-data">Aucune demande en attente</p>) : (demandes.map(dem => (<div key={dem.id_demande} className="card"><div className="card-header"><span className="card-type">{dem.type_demande}</span>{dem.urgence === 'urgente' && <span className="card-urgent">⚠️ Urgent</span>}</div><div className="card-body"><p><strong>Titre :</strong> {dem.titre || dem.description?.split('\n')[0]}</p><p><strong>Bénéficiaire :</strong> {dem.nom} {dem.prenom}</p><p><strong>Objectif :</strong> {formatNumber(dem.objectif)} TND</p><p><strong>Date fin :</strong> {new Date(dem.date_fin).toLocaleDateString('fr-FR')}</p></div><div className="card-actions"><button className="btn-valider" onClick={() => openModal('validate', 'demande', dem.id_demande, dem.titre || `Demande #${dem.id_demande}`)}><FaCheck /> Valider</button><button className="btn-refuser" onClick={() => openModal('refuse', 'demande', dem.id_demande, dem.titre || `Demande #${dem.id_demande}`)}><FaTimes /> Refuser</button></div></div>)))}
        </div></div>
        <div className="dashboard-column"><div className="column-header"><h2>Campagnes en attente ({campagnes.length})</h2></div><div className="cards-container">
          {campagnes.length === 0 ? (<p className="no-data">Aucune campagne en attente</p>) : (campagnes.map(camp => (<div key={camp.id_campagne} className="card"><div className="card-header"><span className="card-type">{camp.type_campagne}</span></div><div className="card-body"><p><strong>Titre :</strong> {camp.titre}</p><p><strong>Association :</strong> {camp.nom} {camp.prenom}</p><p><strong>Objectif :</strong> {formatNumber(camp.objectif)} TND</p><p><strong>Date fin :</strong> {new Date(camp.date_fin).toLocaleDateString('fr-FR')}</p></div><div className="card-actions"><button className="btn-valider" onClick={() => openModal('validate', 'campagne', camp.id_campagne, camp.titre)}><FaCheck /> Valider</button><button className="btn-refuser" onClick={() => openModal('refuse', 'campagne', camp.id_campagne, camp.titre)}><FaTimes /> Refuser</button></div></div>)))}
        </div></div>
      </div>
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className={`modal-container ${modal.action === 'validate' ? 'validate' : 'refuse'}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{modal.title}</h3><button className="modal-close" onClick={closeModal}>&times;</button></div>
            <div className="modal-body"><p>{modal.message}</p></div>
            <div className="modal-footer"><button className="modal-btn cancel" onClick={closeModal}>Annuler</button><button className={`modal-btn confirm ${modal.action}`} onClick={confirmAction}>{modal.action === 'validate' ? 'Valider' : 'Refuser'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;