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

  const formatNumber = (num) => {
    const number = Number(num);
    if (isNaN(number)) return '0,00';
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');
  };

  const filterOptions = [
    { label: 'Tous', icon: <FaHome />, key: 'Tous' },
    { label: 'Kafala', icon: <FaHeart />, key: 'Kafala' },
    { label: 'Financier', icon: <FaMoneyBillWave />, key: 'Financier' },
    { label: 'Matériel', icon: <FaBox />, key: 'Matériel' },
    { label: 'Compétences', icon: <FaGraduationCap />, key: 'Compétences' },
    { label: 'Collectif', icon: <FaUsers />, key: 'Collectif' }
  ];

  useEffect(() => {
    const fetchMissions = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3000/demandes?statut=valider');
        if (!res.ok) throw new Error('Erreur HTTP');
        const data = await res.json();
        setMissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Erreur chargement missions');
      } finally {
        setLoading(false);
      }
    };
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
        (m.titre || '').toLowerCase().includes(term) ||
        (m.description || '').toLowerCase().includes(term) ||
        (m.ville || '').toLowerCase().includes(term)
      );
    }
    setFilteredMissions(filtered);
  }, [activeFilter, missions, searchTerm]);

  const joursRestants = (dateFin) => {
    const aujourdhui = new Date();
    const fin = new Date(dateFin);
    const diff = fin - aujourdhui;
    const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return jours > 0 ? jours : 0;
  };

  const getDescriptionToShow = (mission) => {
    const desc = mission.description || '';
    if (expandedId === mission.id_demande) return desc;
    return desc.length > 150 ? desc.substring(0, 150) + '...' : desc;
  };

  const getTypeBadgeText = (type) => {
    switch (type) {
      case 'kafala': return 'Kafala / Parrainage';
      case 'financier': return 'Aide financière';
      case 'materiel': return 'Don matériel';
      case 'competences': return 'Compétences / Bénévolat';
      case 'collectif': return 'Projet collectif';
      default: return type;
    }
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
          <input type="text" placeholder="Rechercher une mission..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {filterOptions.map(option => (
            <button key={option.key} className={`filter-tab ${activeFilter === option.key ? 'active' : ''}`} onClick={() => setActiveFilter(option.key)}>
              <span className="filter-icon">{option.icon}</span>
              <span className="filter-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="results-count">{filteredMissions.length} mission(s) trouvée(s)</div>

      <div className="missions-list">
        {filteredMissions.length === 0 ? (
          <p className="no-missions">Aucune mission disponible pour le moment.</p>
        ) : (
          filteredMissions.map(mission => {
            const isFinancial = mission.type_demande === 'financier';
            const hasLongDesc = (mission.description || '').length > 150;

            return (
              <div key={mission.id_demande} className="mission-card">
                <div className="mission-image-wrapper">
                  {mission.image_path ? (
                    <img src={`http://localhost:3000${mission.image_path}`} alt={mission.titre} className="mission-image" />
                  ) : (
                    <div className="mission-image-placeholder">
                      <FaImage className="placeholder-icon" />
                      <span className="placeholder-text">Pas d'image</span>
                    </div>
                  )}
                </div>
                <div className="mission-card-content">
                  <div className="mission-header">
                    <h3>{mission.titre || 'Sans titre'}</h3>
                    {mission.urgence === 'urgente' && <span className="urgence-badge">Urgente</span>}
                  </div>
                  {mission.ville && (
                    <div className="mission-location"><FaMapMarkerAlt className="location-icon" /><span>{mission.ville}</span></div>
                  )}
                  <p className="mission-description">{getDescriptionToShow(mission)}</p>
                  {hasLongDesc && (
                    <button className="read-more-btn" onClick={() => setExpandedId(expandedId === mission.id_demande ? null : mission.id_demande)}>
                      {expandedId === mission.id_demande ? 'Réduire' : 'Lire la suite'}
                    </button>
                  )}
                  <div className="meta-row">
                    <span className={`type-badge ${mission.type_demande}`}>{getTypeBadgeText(mission.type_demande)}</span>
                  </div>
                  {isFinancial && (
                    <div className="progress-section">
                      <div className="progress-numbers">
                        <span className="collected">{formatNumber(mission.collecte || 0)} TND</span>
                        <span className="goal">Objectif : {formatNumber(mission.objectif)} TND</span>
                      </div>
                      <progress value={mission.collecte || 0} max={mission.objectif} />
                    </div>
                  )}
                  <div className="stats-row">
                    <span><FaUserFriends /> {mission.nombre_donateurs || 0} donateurs</span>
                    <span><FaClock /> {joursRestants(mission.date_fin)}j restants</span>
                  </div>
                  <Link to={`/missions/${mission.id_demande}`} className="btn-participer">Participer</Link>
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