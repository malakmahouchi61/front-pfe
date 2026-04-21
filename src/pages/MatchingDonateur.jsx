import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FaHeart, 
  FaHandHoldingHeart, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaStar, 
  FaFilter 
} from "react-icons/fa";
import "./MatchingDonateur.css";

const MatchingDonateur = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFiltre, setTypeFiltre] = useState("tous");

  useEffect(() => {
    if (!user) {
      navigate("/connexion");
      return;
    }
    if (user.role !== "donateur") {
      setError("Accès réservé aux donateurs.");
      setLoading(false);
      return;
    }

    const fetchMatching = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/api/matching/donateur/${user.id_utilisateur}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        setDemandes(data.demandes || []);
        setCampagnes(data.campagnes || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les recommandations.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatching();
  }, [user, navigate]);

  const filtrerParType = (items, typeField) => {
    if (typeFiltre === "tous") return items;
    return items.filter(item => item[typeField] === typeFiltre);
  };
  const demandesFiltrees = filtrerParType(demandes, "type_demande");
  const campagnesFiltrees = filtrerParType(campagnes, "type_campagne");

  const getScoreColor = (score) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) return <div className="matching-loading">🔍 Analyse de votre profil...</div>;
  if (error) return <div className="matching-error">{error}</div>;

  return (
    <div className="matching-container">
      <div className="matching-header">
        <h1>🤝 Recommandations personnalisées</h1>
        <p className="subtitle">Basées sur votre ville, vos centres d’intérêt et l’urgence</p>
      </div>

      <div className="filters-bar">
        <FaFilter className="filter-icon" />
        <button className={typeFiltre === "tous" ? "filter-active" : ""} onClick={() => setTypeFiltre("tous")}>Tous</button>
        <button className={typeFiltre === "financier" ? "filter-active" : ""} onClick={() => setTypeFiltre("financier")}>Financier</button>
        <button className={typeFiltre === "materiel" ? "filter-active" : ""} onClick={() => setTypeFiltre("materiel")}>Matériel</button>
        <button className={typeFiltre === "competences" ? "filter-active" : ""} onClick={() => setTypeFiltre("competences")}>Compétences</button>
        <button className={typeFiltre === "kafala" ? "filter-active" : ""} onClick={() => setTypeFiltre("kafala")}>Kafala</button>
      </div>

      <section className="matching-section">
        <div className="section-title">
          <FaHeart className="title-icon" />
          <h2>Missions solidaires – Bénéficiaires</h2>
          <span className="badge">{demandesFiltrees.length}</span>
        </div>
        {demandesFiltrees.length === 0 ? (
          <div className="empty-state">Aucune mission correspondante</div>
        ) : (
          <div className="cards-grid">
            {demandesFiltrees.slice(0, 6).map((item) => (
              <div key={item.id_demande} className="matching-card" onClick={() => navigate(`/missions/${item.id_demande}`)}>
                <div className="card-header">
                  <h3>{item.titre}</h3>
                  <div className="score-badge" style={{ background: getScoreColor(item.score) }}>
                    {item.score}%
                  </div>
                </div>
                <div className="card-details">
                  <p><FaMapMarkerAlt /> {item.ville}</p>
                  <p><FaClock /> Urgence : <span className="urgence-value">{item.urgence}</span></p>
                  <p><FaUsers /> Type : {item.type_demande}</p>
                  <p><FaStar /> Compatibilité : <strong>{item.score}%</strong></p>
                </div>
                <button className="btn-action">Voir et aider</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="matching-section">
        <div className="section-title">
          <FaHandHoldingHeart className="title-icon" />
          <h2>Campagnes associatives</h2>
          <span className="badge">{campagnesFiltrees.length}</span>
        </div>
        {campagnesFiltrees.length === 0 ? (
          <div className="empty-state">Aucune campagne correspondante</div>
        ) : (
          <div className="cards-grid">
            {campagnesFiltrees.slice(0, 6).map((item) => (
              <div key={item.id_campagne} className="matching-card" onClick={() => navigate(`/campagnes/${item.id_campagne}`)}>
                <div className="card-header">
                  <h3>{item.titre}</h3>
                  <div className="score-badge" style={{ background: getScoreColor(item.score) }}>
                    {item.score}%
                  </div>
                </div>
                <div className="card-details">
                  <p><FaMapMarkerAlt /> {item.ville}</p>
                  <p><FaClock /> Urgence : {item.urgence}</p>
                  <p><FaUsers /> Type : {item.type_campagne}</p>
                  <p><FaStar /> Compatibilité : <strong>{item.score}%</strong></p>
                </div>
                <button className="btn-action">Voir et soutenir</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MatchingDonateur;