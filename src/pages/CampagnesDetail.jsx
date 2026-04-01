import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaBox,
  FaGraduationCap,
  FaHeart,
  FaUsers,
  FaCalendarAlt,
  FaDonate,
  FaCheckCircle
} from 'react-icons/fa';
import './CampagneDetail.css';

const CampagnesDetail = () => {
  const { id } = useParams();
  const [campagne, setCampagne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donType, setDonType] = useState('financier');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [quantite, setQuantite] = useState('');
  const [competence, setCompetence] = useState('');
  const [disponibilite, setDisponibilite] = useState('');
  const [description, setDescription] = useState('');
  const [messageFinancier, setMessageFinancier] = useState('');
  const [message, setMessage] = useState(null);

  const presetAmounts = [10, 20, 50, 100];

  const formatNumber = (num) => {
    const number = Number(num);
    if (isNaN(number)) return '0,00';
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');
  };

  useEffect(() => {
    const fetchCampagne = async () => {
      try {
        const res = await fetch(`http://localhost:3000/campagnes/${id}`);
        if (!res.ok) throw new Error('Campagne non trouvée');
        const data = await res.json();
        setCampagne(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCampagne();
  }, [id]);

  useEffect(() => {
    setSelectedAmount(null);
    setCustomAmount('');
    setQuantite('');
    setCompetence('');
    setDisponibilite('');
    setDescription('');
    setMessageFinancier('');
    setMessage(null);
  }, [donType]);

  const handleDon = async (e) => {
    e.preventDefault();
    setMessage(null);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token) {
      setMessage({ type: 'error', text: 'Vous devez être connecté pour faire un don.' });
      return;
    }

    let donData = {};
    if (donType === 'financier') {
      let montantVal = selectedAmount ? selectedAmount : parseFloat(customAmount);
      if (isNaN(montantVal) || montantVal <= 0) {
        setMessage({ type: 'error', text: 'Veuillez indiquer un montant valide.' });
        return;
      }
      const fullDescription = `Don financier pour "${campagne.titre}"${messageFinancier ? ` | Message : ${messageFinancier}` : ''}`;
      donData = {
        id_donateur: user.id_utilisateur,
        type_don: donType,
        montant: montantVal,
        description: fullDescription,
        id_campagne: campagne.id_campagne
      };
    } else if (donType === 'materiel') {
      if (!quantite.trim()) {
        setMessage({ type: 'error', text: 'Veuillez renseigner la quantité.' });
        return;
      }
      const descriptionComplete = `[Matériel] Quantité : ${quantite} | Détails : ${description}`;
      donData = {
        id_donateur: user.id_utilisateur,
        type_don: donType,
        montant: 0,
        description: descriptionComplete,
        id_campagne: campagne.id_campagne
      };
    } else {
      if (!competence.trim() || !disponibilite.trim()) {
        setMessage({ type: 'error', text: 'Veuillez renseigner la compétence proposée et la disponibilité.' });
        return;
      }
      const descriptionComplete = `[Compétence] Compétence : ${competence} | Disponibilité : ${disponibilite} | Détails : ${description}`;
      donData = {
        id_donateur: user.id_utilisateur,
        type_don: donType,
        montant: 0,
        description: descriptionComplete,
        id_campagne: campagne.id_campagne
      };
    }

    try {
      const res = await fetch('http://localhost:3000/dons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(donData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du don');
      setMessage({ type: 'success', text: 'Votre don a été enregistré et sera validé par l’administrateur.' });
      setSelectedAmount(null);
      setCustomAmount('');
      setQuantite('');
      setCompetence('');
      setDisponibilite('');
      setDescription('');
      setMessageFinancier('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return <div className="loading">Chargement de la campagne...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!campagne) return <div className="error-message">Campagne introuvable</div>;

  const collecte = Number(campagne.collecte) || 0;
  const objectif = Number(campagne.objectif) || 0;
  const isFinancial = campagne.type_campagne === 'financier';

  const joursRestants = () => {
    if (!campagne.date_fin) return 0;
    const fin = new Date(campagne.date_fin);
    const aujourdhui = new Date();
    const diff = fin - aujourdhui;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'financier': return <FaMoneyBillWave />;
      case 'materiel': return <FaBox />;
      case 'competences': return <FaGraduationCap />;
      default: return <FaHeart />;
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      financier: 'FINANCIER',
      materiel: 'MATÉRIEL',
      competences: 'COMPÉTENCE'
    };
    return types[type] || type.toUpperCase();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'financier': return '#10b981';
      case 'materiel': return '#3b82f6';
      case 'competences': return '#8b5cf6';
      default: return '#f59e0b';
    }
  };

  return (
    <div className="campagne-detail-container">
      <Link to="/campagnes" className="back-link">
        <FaArrowLeft /> Retour aux campagnes
      </Link>

      <div className="campagne-detail-card">
        <div className="campagne-image-wrapper">
          {campagne.image_path ? (
            <img
              src={`http://localhost:3000${campagne.image_path}`}
              alt={campagne.titre}
              className="campagne-detail-image"
            />
          ) : (
            <div className="placeholder-image">Image non disponible</div>
          )}
          <div className="campagne-type-badge" style={{ backgroundColor: `${getTypeColor(campagne.type_campagne)}20`, color: getTypeColor(campagne.type_campagne) }}>
            {getTypeIcon(campagne.type_campagne)} {getTypeLabel(campagne.type_campagne)}
          </div>
        </div>

        <div className="campagne-content">
          <h1>{campagne.titre}</h1>
          <div className="campagne-description">{campagne.description}</div>

          {isFinancial && (
            <div className="campagne-progress">
              <div className="progress-stats">
                <span className="collected">{formatNumber(collecte)} TND</span>
                <span className="goal">Objectif : {formatNumber(objectif)} TND</span>
              </div>
              <progress value={collecte} max={objectif} />
              <div className="progress-percent">{((collecte / objectif) * 100).toFixed(0)}%</div>
              <div className="extra-stats">
                <span><FaUsers /> {Number(campagne.nombre_donateurs) || 0} donateurs</span>
                <span><FaCalendarAlt /> {joursRestants()} jours restants</span>
              </div>
            </div>
          )}

          <div className="don-section">
            <h3>Faire un don</h3>
            <div className="don-type-tiles">
              {['financier', 'materiel', 'competences'].map(type => (
                <div
                  key={type}
                  className={`don-tile ${donType === type ? 'selected' : ''}`}
                  onClick={() => setDonType(type)}
                  style={{ borderColor: donType === type ? getTypeColor(type) : '#e9ecef' }}
                >
                  <div className="tile-icon" style={{ color: getTypeColor(type) }}>{getTypeIcon(type)}</div>
                  <div className="tile-label">{getTypeLabel(type)}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleDon} className="don-form">
              {donType === 'financier' && (
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
                      placeholder="Un petit message pour l'association..."
                    />
                  </div>
                </>
              )}

              {donType === 'materiel' && (
                <>
                  <div className="form-group">
                    <label>QUANTITÉ *</label>
                    <input
                      type="text"
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                      required
                      placeholder="Ex: 10 kg de riz, 5 couvertures..."
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

              {donType === 'competences' && (
                <>
                  <div className="form-group">
                    <label>COMPÉTENCE PROPOSÉE *</label>
                    <input
                      type="text"
                      value={competence}
                      onChange={(e) => setCompetence(e.target.value)}
                      required
                      placeholder="Ex: Comptabilité, Cours de soutien, Bricolage..."
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

              <button type="submit" className="btn-don">
                <FaDonate /> Faire un don
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
};

export default CampagnesDetail;