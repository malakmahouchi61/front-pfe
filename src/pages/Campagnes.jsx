import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaUserFriends, FaClock, FaImage } from 'react-icons/fa';
import './Campagnes.css';

const Campagnes = () => {
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatNumber = (num) => {
    const number = Number(num);
    if (isNaN(number)) return '0.00';
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  useEffect(() => {
    const fetchCampagnes = async () => {
      try {
        const res = await fetch('http://localhost:3000/campagnes');
        const data = await res.json();
        setCampagnes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampagnes();
  }, []);

  const handleClick = (id) => {
    navigate(`/campagnes/${id}`);
  };

  if (loading) return <div className="loading">Chargement des campagnes...</div>;

  return (
    <div className="campagnes-container">
      <h1>Découvrez nos campagnes</h1>
      <p className="subtitle">Soutenez une cause qui vous touche</p>

      <div className="campagnes-grid">
        {campagnes.length === 0 ? (
          <div className="no-campagnes">Aucune campagne pour le moment</div>
        ) : (
          campagnes.map((campagne) => (
            <div
              key={campagne.id_campagne}
              className="campagne-card"
              onClick={() => handleClick(campagne.id_campagne)}
            >
              <div className="campagne-image-wrapper">
                {campagne.image_path ? (
                  <img
                    src={`http://localhost:3000${campagne.image_path}`}
                    alt={campagne.titre}
                    className="campagne-image"
                  />
                ) : (
                  <div className="campagne-image-placeholder">
                    <FaImage className="placeholder-icon" />
                    <span className="placeholder-text">Pas d'image</span>
                  </div>
                )}
              </div>

              <div className="campagne-content">
                <div className="campagne-header">
                  <h3>{campagne.titre}</h3>
                  {campagne.urgence === 'urgente' && (
                    <span className="urgence-badge">URGENTE</span>
                  )}
                </div>

                <div className="campagne-location">
                  <FaMapMarkerAlt className="location-icon" />
                  <span>{campagne.ville || 'Localisation non spécifiée'}</span>
                </div>

                <p className="campagne-description">{campagne.description}</p>

                <div className="meta-row">
                  <span className="type-badge">{campagne.type_campagne}</span>
                </div>

                {campagne.type_campagne === 'financier' && (
                  <div className="progress-section">
                    <div className="progress-numbers">
                      <span className="collected">{formatNumber(campagne.collecte)} TND</span>
                      <span className="goal">{formatNumber(campagne.objectif)} TND</span>
                    </div>
                    <progress value={campagne.collecte || 0} max={campagne.objectif || 0} />
                  </div>
                )}

                <div className="stats-row">
                  <span>
                    <FaUserFriends className="stats-icon" /> {campagne.nombre_donateurs || 0} donateurs
                  </span>
                  <span>
                    <FaClock className="stats-icon" /> {Math.max(0, Math.ceil(
                      (new Date(campagne.date_fin) - new Date()) / (1000 * 60 * 60 * 24)
                    ))} jours restants
                  </span>
                </div>

                <button
                  className="btn-voir-campagne"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(campagne.id_campagne);
                  }}
                >
                  Voir la campagne
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Campagnes;