import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaBox,
  FaGraduationCap,
  FaHeart,
  FaDonate,
  FaCheckCircle
} from 'react-icons/fa';
import './DemandeDetail.css';

function DemandeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeDon, setTypeDon] = useState('financier');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [quantite, setQuantite] = useState('');
  const [competence, setCompetence] = useState('');
  const [disponibilite, setDisponibilite] = useState('');
  const [description, setDescription] = useState('');
  const [messageFinancier, setMessageFinancier] = useState('');
  const [message, setMessage] = useState('');

  const formatNumber = (num) => {
    const number = Number(num);
    if (isNaN(number)) return '0.00';
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const presetAmounts = [10, 20, 50, 100];

  useEffect(() => {
    const fetchDemande = async () => {
      try {
        const res = await fetch(`http://localhost:3000/demandes/${id}`);
        const data = await res.json();
        setDemande(data);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDemande();
  }, [id]);

  useEffect(() => {
    setSelectedAmount(null);
    setCustomAmount('');
    setQuantite('');
    setCompetence('');
    setDisponibilite('');
    setDescription('');
    setMessageFinancier('');
    setMessage('');
  }, [typeDon]);

  const handleDon = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Vous devez être connecté pour faire un don.' });
      return;
    }

    let donData = {};

    if (typeDon === 'financier') {
      let montantVal = selectedAmount ? selectedAmount : parseFloat(customAmount);
      if (isNaN(montantVal) || montantVal <= 0) {
        setMessage({ type: 'error', text: 'Veuillez indiquer un montant valide.' });
        return;
      }
      const fullDescription = `Don financier pour "${demande.titre}"${messageFinancier ? ` | Message : ${messageFinancier}` : ''}`;
      donData = {
        id_donateur: user.id_utilisateur,
        type_don: typeDon,
        montant: montantVal,
        description: fullDescription,
        id_demande: demande.id_demande
      };
    } else if (typeDon === 'materiel') {
      if (!quantite.trim()) {
        setMessage({ type: 'error', text: 'Veuillez renseigner la quantité.' });
        return;
      }
      const descriptionComplete = `[Matériel] Quantité : ${quantite} | Détails : ${description}`;
      donData = {
        id_donateur: user.id_utilisateur,
        type_don: typeDon,
        montant: 0,
        description: descriptionComplete,
        id_demande: demande.id_demande
      };
    } else {
      if (!competence.trim() || !disponibilite.trim()) {
        setMessage({ type: 'error', text: 'Veuillez renseigner la compétence proposée et la disponibilité.' });
        return;
      }
      const descriptionComplete = `[Compétence] Compétence : ${competence} | Disponibilité : ${disponibilite} | Détails : ${description}`;
      donData = {
        id_donateur: user.id_utilisateur,
        type_don: typeDon,
        montant: 0,
        description: descriptionComplete,
        id_demande: demande.id_demande
      };
    }

    try {
      const res = await fetch('http://localhost:3000/dons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(donData)
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Contribution enregistrée avec succès ! En attente de validation.' });
        setSelectedAmount(null);
        setCustomAmount('');
        setQuantite('');
        setCompetence('');
        setDisponibilite('');
        setDescription('');
        setMessageFinancier('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de l’enregistrement.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur réseau' });
    }
  };

  if (loading) return <div className="loading">Chargement de la demande...</div>;
  if (!demande) return <div className="error-message">Demande introuvable</div>;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'financier': return <FaMoneyBillWave />;
      case 'materiel': return <FaBox />;
      case 'competences': return <FaGraduationCap />;
      default: return <FaHeart />;
    }
  };

  const getTypeLabel = (type) => {
    if (!type) return 'Type non défini';
    const types = {
      financier: 'FINANCIER',
      materiel: 'MATÉRIEL',
      competences: 'COMPÉTENCE'
    };
    return types[type] || type.toUpperCase();
  };

  const getTypeColor = (type) => {
    if (!type) return '#f59e0b';
    switch (type) {
      case 'financier': return '#10b981';
      case 'materiel': return '#3b82f6';
      case 'competences': return '#8b5cf6';
      default: return '#f59e0b';
    }
  };

  return (
    <div className="demande-detail-container">
      <Link to="/missions" className="back-link">
        <FaArrowLeft /> Retour aux missions
      </Link>

      <div className="demande-detail-card">
        <div className="demande-image-wrapper">
          {demande.justificatif ? (
            <img
              src={`http://localhost:3000${demande.justificatif}`}
              alt={demande.titre}
              className="demande-detail-image"
            />
          ) : (
            <div className="placeholder-image">Image non disponible</div>
          )}
          <div className="demande-type-badge" style={{ backgroundColor: `${getTypeColor(demande.type_demande)}20`, color: getTypeColor(demande.type_demande) }}>
            {getTypeIcon(demande.type_demande)} {getTypeLabel(demande.type_demande)}
          </div>
        </div>

        <div className="demande-content">
          <h1>{demande.titre}</h1>
          <div className="demande-description">{demande.description}</div>

          {demande.type_demande === 'financier' && (
            <div className="campagne-progress">
              <div className="progress-stats">
                <span className="collected">{formatNumber(demande.collecte || 0)} TND</span>
                <span className="goal">Objectif : {formatNumber(demande.objectif)} TND</span>
              </div>
              <progress value={demande.collecte || 0} max={demande.objectif || 0} />
            </div>
          )}

          <div className="don-section">
            <h3>Proposer votre aide</h3>
            <div className="don-type-tiles">
              {['financier', 'materiel', 'competences'].map(type => (
                <div
                  key={type}
                  className={`don-tile ${typeDon === type ? 'selected' : ''}`}
                  onClick={() => setTypeDon(type)}
                  style={{ borderColor: typeDon === type ? getTypeColor(type) : '#e9ecef' }}
                >
                  <div className="tile-icon" style={{ color: getTypeColor(type) }}>{getTypeIcon(type)}</div>
                  <div className="tile-label">{getTypeLabel(type)}</div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="don-form">
              {typeDon === 'financier' && (
                <>
                  <div className="amount-presets">
                    {presetAmounts.map(amount => (
                      <button
                        type="button"
                        key={amount}
                        className={`preset-amount ${selectedAmount === amount ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                      >
                        {amount} TND
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`preset-amount ${!selectedAmount && customAmount ? 'active' : ''}`}
                      onClick={() => setSelectedAmount(null)}
                    >
                      Autre
                    </button>
                  </div>
                  {!selectedAmount && (
                    <div className="form-group">
                      <input
                        type="number"
                        step="0.01"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Montant personnalisé"
                        required={!selectedAmount}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>MESSAGE (optionnel)</label>
                    <textarea
                      value={messageFinancier}
                      onChange={(e) => setMessageFinancier(e.target.value)}
                      placeholder="Un petit message pour le bénéficiaire..."
                    />
                  </div>
                </>
              )}

              {typeDon === 'materiel' && (
                <>
                  <div className="form-group">
                    <label>QUANTITÉ *</label>
                    <input
                      type="text"
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                      required
                      placeholder="Ex: 10 kg de riz, 5 cahiers..."
                    />
                  </div>
                  <div className="form-group">
                    <label>DESCRIPTION (optionnel)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Plus de détails sur votre don matériel..."
                    />
                  </div>
                </>
              )}

              {typeDon === 'competences' && (
                <>
                  <div className="form-group">
                    <label>COMPÉTENCE PROPOSÉE *</label>
                    <input
                      type="text"
                      value={competence}
                      onChange={(e) => setCompetence(e.target.value)}
                      required
                      placeholder="Ex: Cours de maths, aide administrative..."
                    />
                  </div>
                  <div className="form-group">
                    <label>DISPONIBILITÉ *</label>
                    <input
                      type="text"
                      value={disponibilite}
                      onChange={(e) => setDisponibilite(e.target.value)}
                      required
                      placeholder="Quand et comment pouvez-vous aider ?"
                    />
                  </div>
                  <div className="form-group">
                    <label>DÉTAILS (optionnel)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Informations complémentaires sur votre compétence..."
                    />
                  </div>
                </>
              )}

              <button type="button" className="btn-don" onClick={handleDon}>
                <FaDonate /> Proposer mon aide
              </button>
            </form>

            {message && (
              <div className={`message ${message.type}`}>
                <FaCheckCircle /> {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemandeDetail;