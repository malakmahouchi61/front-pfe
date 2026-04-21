// DemandeDetail.jsx – version définitive sans LanguageContext
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaArrowLeft, FaMoneyBillWave, FaBox, FaGraduationCap, FaHeart,
  FaDonate, FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaImage
} from 'react-icons/fa';
import './DemandeDetail.css';

function DemandeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeDon, setTypeDon] = useState('financier');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [quantite, setQuantite] = useState('');
  const [competence, setCompetence] = useState('');
  const [disponibilite, setDisponibilite] = useState('');
  const [descriptionDon, setDescriptionDon] = useState('');
  const [messageFinancier, setMessageFinancier] = useState('');
  const [message, setMessage] = useState(null);
  const presetAmounts = [10, 20, 50, 100];
  const formatNumber = (num) => Number(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  useEffect(() => {
    const fetchDemande = async () => {
      try {
        const res = await fetch(`http://localhost:3000/demandes/${id}`);
        if (!res.ok) throw new Error('Demande non trouvée');
        const data = await res.json();
        setDemande(data);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchDemande();
  }, [id]);

  useEffect(() => {
    setSelectedAmount(null); setCustomAmount(''); setQuantite(''); setCompetence('');
    setDisponibilite(''); setDescriptionDon(''); setMessageFinancier(''); setMessage(null);
  }, [typeDon]);

  const handleDon = async (e) => {
    e.preventDefault();
    setMessage(null);
    const token = localStorage.getItem('token');
    if (!user || !token) return setMessage({ type: 'error', text: 'Vous devez être connecté pour faire un don.' });

    let donData = {};
    if (typeDon === 'financier') {
      let montantVal = selectedAmount || parseFloat(customAmount);
      if (isNaN(montantVal) || montantVal <= 0) return setMessage({ type: 'error', text: 'Veuillez indiquer un montant valide.' });
      donData = { id_donateur: user.id_utilisateur, type_don: typeDon, montant: montantVal, description: `Don financier pour "${demande.titre}"${messageFinancier ? ` | Message : ${messageFinancier}` : ''}`, id_demande: demande.id_demande };
    } else if (typeDon === 'materiel') {
      if (!quantite.trim()) return setMessage({ type: 'error', text: 'Veuillez renseigner la quantité.' });
      donData = { id_donateur: user.id_utilisateur, type_don: typeDon, montant: 0, description: `[Matériel] Quantité : ${quantite} | Détails : ${descriptionDon}`, id_demande: demande.id_demande };
    } else {
      if (!competence.trim() || !disponibilite.trim()) return setMessage({ type: 'error', text: 'Veuillez renseigner la compétence proposée et la disponibilité.' });
      donData = { id_donateur: user.id_utilisateur, type_don: typeDon, montant: 0, description: `[Compétence] Compétence : ${competence} | Disponibilité : ${disponibilite} | Détails : ${descriptionDon}`, id_demande: demande.id_demande };
    }

    try {
      const res = await fetch('http://localhost:3000/dons', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(donData) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur lors du don');
      setMessage({ type: 'success', text: 'Votre contribution a été enregistrée et sera validée par l’administrateur.' });
      setSelectedAmount(null); setCustomAmount(''); setQuantite(''); setCompetence(''); setDisponibilite(''); setDescriptionDon(''); setMessageFinancier('');
    } catch (err) { setMessage({ type: 'error', text: err.message }); }
  };

  if (loading) return <div className="loading">Chargement de la demande...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!demande) return <div className="error-message">Demande introuvable</div>;

  const isFinancial = demande.type_demande === 'financier';
  const collecte = Number(demande.collecte) || 0;
  const objectif = Number(demande.objectif) || 0;
  const joursRestants = () => Math.max(0, Math.ceil((new Date(demande.date_fin) - new Date()) / (1000 * 60 * 60 * 24)));

  const getTypeIcon = (type) => {
    switch (type) {
      case 'financier': return <FaMoneyBillWave />;
      case 'materiel': return <FaBox />;
      case 'competences': return <FaGraduationCap />;
      default: return <FaHeart />;
    }
  };
  const getTypeLabel = (type) => ({ financier: 'FINANCIER', materiel: 'MATÉRIEL', competences: 'COMPÉTENCE' }[type] || type.toUpperCase());
  const getTypeColor = (type) => ({ financier: '#10b981', materiel: '#3b82f6', competences: '#8b5cf6' }[type] || '#f59e0b');

  return (
    <div className="demande-detail-container">
      <Link to="/missions" className="back-link"><FaArrowLeft /> Retour aux missions</Link>
      <div className="demande-detail-card">
        <div className="demande-image-wrapper">
          {demande.image_path ? <img src={`http://localhost:3000${demande.image_path}`} alt={demande.titre} className="demande-detail-image" />
            : <div className="placeholder-image"><FaImage className="placeholder-icon" /><span>Image non disponible</span></div>}
          <div className="demande-type-badge" style={{ backgroundColor: `${getTypeColor(demande.type_demande)}20`, color: getTypeColor(demande.type_demande) }}>
            {getTypeIcon(demande.type_demande)} {getTypeLabel(demande.type_demande)}
          </div>
        </div>
        <div className="demande-content">
          <h1>{demande.titre || 'Sans titre'}</h1>
          <div className="demande-description">{demande.description || ''}</div>
          <div className="demande-meta">
            {demande.ville && <p><FaMapMarkerAlt /> {demande.ville}</p>}
            <p><FaCalendarAlt /> Date limite : {new Date(demande.date_fin).toLocaleDateString('fr-FR')} ({joursRestants()} jours restants)</p>
          </div>
          {isFinancial && (
            <div className="progress-section">
              <div className="progress-stats"><span className="collected">{formatNumber(collecte)} TND</span><span className="goal">Objectif : {formatNumber(objectif)} TND</span></div>
              <progress value={collecte} max={objectif} />
              <div className="progress-percent">{((collecte / objectif) * 100).toFixed(0)}%</div>
              <div className="extra-stats"><span><FaUsers /> {demande.nombre_donateurs || 0} donateurs</span></div>
            </div>
          )}
          <div className="don-section">
            <h3>Proposer votre aide</h3>
            <div className="don-type-tiles">
              {['financier', 'materiel', 'competences'].map(type => (
                <div key={type} className={`don-tile ${typeDon === type ? 'selected' : ''}`} data-type={type} onClick={() => setTypeDon(type)}>
                  <div className="tile-icon" style={{ color: getTypeColor(type) }}>{getTypeIcon(type)}</div>
                  <div className="tile-label">{getTypeLabel(type)}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleDon} className="don-form">
              {typeDon === 'financier' && (
                <>
                  <div className="amount-presets">
                    {presetAmounts.map(amount => <button type="button" key={amount} className={`preset-amount ${selectedAmount === amount ? 'active' : ''}`} onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}>{amount} TND</button>)}
                    <button type="button" className={`preset-amount ${!selectedAmount && customAmount ? 'active' : ''}`} onClick={() => setSelectedAmount(null)}>Autre</button>
                  </div>
                  {!selectedAmount && <div className="form-group"><input type="number" step="0.01" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="Montant personnalisé" required /></div>}
                  <div className="form-group"><label>MESSAGE (optionnel)</label><textarea value={messageFinancier} onChange={(e) => setMessageFinancier(e.target.value)} placeholder="Un petit message pour le bénéficiaire..." /></div>
                </>
              )}
              {typeDon === 'materiel' && (
                <>
                  <div className="form-group"><label>QUANTITÉ *</label><input type="text" value={quantite} onChange={(e) => setQuantite(e.target.value)} required placeholder="Ex: 10 kg de riz, 5 cahiers..." /></div>
                  <div className="form-group"><label>DESCRIPTION (optionnel)</label><textarea value={descriptionDon} onChange={(e) => setDescriptionDon(e.target.value)} placeholder="Plus de détails sur votre don matériel..." /></div>
                </>
              )}
              {typeDon === 'competences' && (
                <>
                  <div className="form-group"><label>COMPÉTENCE PROPOSÉE *</label><input type="text" value={competence} onChange={(e) => setCompetence(e.target.value)} required placeholder="Ex: Cours de maths, aide administrative..." /></div>
                  <div className="form-group"><label>DISPONIBILITÉ *</label><input type="text" value={disponibilite} onChange={(e) => setDisponibilite(e.target.value)} required placeholder="Quand et comment pouvez-vous aider ?" /></div>
                  <div className="form-group"><label>DÉTAILS (optionnel)</label><textarea value={descriptionDon} onChange={(e) => setDescriptionDon(e.target.value)} placeholder="Informations complémentaires sur votre compétence..." /></div>
                </>
              )}
              <button type="submit" className="btn-don"><FaDonate /> Proposer mon aide</button>
            </form>
            {message && <div className={`message ${message.type}`}><FaCheckCircle /> {message.text}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemandeDetail;