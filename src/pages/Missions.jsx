import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Missions.css';
import {
  FaSearch,
  FaHome,
  FaHeart,
  FaMoneyBillWave,
  FaBox,
  FaGraduationCap,
  FaUsers,
  FaClock,
  FaUserFriends,
  FaMapMarkerAlt,
  FaImage
} from 'react-icons/fa';

function Missions() {
  const [missions, setMissions] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Format numbers (two decimals, space as thousand separator)
  const formatNumber = (num) => {
    const number = Number(num);
    if (isNaN(number)) return '0,00';
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');
  };

  const filterOptions = [
    { label: 'Tous', icon: <FaHome /> },
    { label: 'Kafala', icon: <FaHeart /> },
    { label: 'Financier', icon: <FaMoneyBillWave /> },
    { label: 'Matériel', icon: <FaBox /> },
    { label: 'Compétences', icon: <FaGraduationCap /> },
    { label: 'Collectif', icon: <FaUsers /> }
  ];

  useEffect(() => {
    fetchMissions();
  }, []);

  useEffect(() => {
    let filtered = missions;

    if (activeFilter !== 'Tous') {
      const typeMap = {
        'Kafala': 'kafala',
        'Financier': 'financier',
        'Matériel': 'materiel',
        'Compétences': 'competences',
        'Collectif': 'collectif'
      };
      filtered = filtered.filter(m => m.type_demande === typeMap[activeFilter]);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        getTitre(m.description).toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        (getLocalisationFromMission(m) && getLocalisationFromMission(m).toLowerCase().includes(term))
      );
    }

    setFilteredMissions(filtered);
  }, [activeFilter, missions, searchTerm]);

  const fetchMissions = async () => {
    try {
      const res = await fetch('http://localhost:3000/demandes?statut=validée');
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMissions(data);
      } else {
        setMissions([]);
        setError('Format de données incorrect');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  };

  const joursRestants = (dateFin) => {
    const aujourdhui = new Date();
    const fin = new Date(dateFin);
    const diff = fin - aujourdhui;
    const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return jours > 0 ? jours : 0;
  };

  const getTitre = (desc) => {
    if (!desc) return '';
    return desc.split('\n')[0];
  };

  const getDescriptionComplete = (desc) => {
    if (!desc) return '';
    const lignes = desc.split('\n');
    if (lignes.length <= 1) return '';
    return lignes.slice(1).join(' ').replace(/\s+/g, ' ').trim();
  };

  const getDescriptionToShow = (mission) => {
    const fullDesc = getDescriptionComplete(mission.description);
    if (expandedId === mission.id_demande) return fullDesc;
    return fullDesc.length > 150 ? fullDesc.substring(0, 150) + '...' : fullDesc;
  };

  const getLocalisationFromMission = (mission) => {
    if (mission.localisation && mission.localisation.trim() !== '') {
      return mission.localisation;
    }
    const desc = mission.description || '';
    const match = desc.match(/Localisation:\s*([^\n]+)/i);
    return match ? match[1].trim() : null;
  };

  const getUrgenceFromMission = (mission) => {
    if (mission.urgence && mission.urgence.trim() !== '') {
      return mission.urgence;
    }
    const desc = mission.description || '';
    const match = desc.match(/Urgence:\s*([^\n]+)/i);
    return match ? match[1].trim() : null;
  };

  const getTypeLabel = (type) => {
    const types = {
      kafala: 'Kafala / Parrainage',
      financier: 'Aide financière',
      materiel: 'Don matériel',
      competences: 'Compétences / Bénévolat',
      collectif: 'Projet collectif'
    };
    return types[type] || type;
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="missions-container">
      <h1>Missions disponibles</h1>
      <p className="subtitle">Trouvez une mission qui correspond à vos compétences et envies</p>

      <div className="missions-header">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une mission..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {filterOptions.map(option => (
            <button
              key={option.label}
              className={`filter-tab ${activeFilter === option.label ? 'active' : ''}`}
              onClick={() => setActiveFilter(option.label)}
            >
              <span className="filter-icon">{option.icon}</span>
              <span className="filter-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="results-count">
        {filteredMissions.length} mission(s) trouvée(s)
      </div>

      <div className="missions-list">
        {filteredMissions.length === 0 ? (
          <p className="no-missions">Aucune mission disponible pour le moment.</p>
        ) : (
          filteredMissions.map(mission => {
            const localisation = getLocalisationFromMission(mission);
            const urgence = getUrgenceFromMission(mission);
            const descriptionToShow = getDescriptionToShow(mission);
            const fullDescription = getDescriptionComplete(mission.description);
            const hasLongDesc = fullDescription.length > 150;
            const isFinancial = mission.type_demande === 'financier';

            return (
              <div key={mission.id_demande} className="mission-card">
                {/* Image section */}
                <div className="mission-image-wrapper">
                  {mission.justificatif ? (
                    <img
                      src={`http://localhost:3000${mission.justificatif}`}
                      alt={getTitre(mission.description)}
                      className="mission-image"
                    />
                  ) : (
                    <div className="mission-image-placeholder">
                      <FaImage className="placeholder-icon" />
                      <span className="placeholder-text">Pas d'image</span>
                    </div>
                  )}
                </div>

                <div className="mission-card-content">
                  <div className="mission-header">
                    <h3>{getTitre(mission.description)}</h3>
                    {urgence && urgence.toLowerCase() === 'urgente' && (
                      <span className="urgence-badge">Urgente</span>
                    )}
                  </div>

                  {localisation && (
                    <div className="mission-location">
                      <FaMapMarkerAlt className="location-icon" />
                      <span>{localisation}</span>
                    </div>
                  )}

                  <p className="mission-description">{descriptionToShow}</p>

                  {hasLongDesc && (
                    <button
                      className="read-more-btn"
                      onClick={() => setExpandedId(expandedId === mission.id_demande ? null : mission.id_demande)}
                    >
                      {expandedId === mission.id_demande ? 'Réduire' : 'Lire la suite'}
                    </button>
                  )}

                  <div className="meta-row">
                    <span className={`type-badge ${mission.type_demande}`}>
                      {getTypeLabel(mission.type_demande)}
                    </span>
                  </div>

                  {isFinancial && (
                    <div className="progress-section">
                      <div className="progress-numbers">
                        <span className="collected">{formatNumber(mission.collecte || 0)} TND</span>
                        <span className="goal">{formatNumber(mission.objectif)} TND</span>
                      </div>
                      <progress value={mission.collecte || 0} max={mission.objectif}></progress>
                    </div>
                  )}

                  <div className="stats-row">
                    <span><FaUserFriends /> {mission.nombre_donateurs || 0} donateurs</span>
                    <span><FaClock /> {joursRestants(mission.date_fin)}j restants</span>
                  </div>

                  <Link to={`/missions/${mission.id_demande}`} className="btn-participer">
                    Participer
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Missions;