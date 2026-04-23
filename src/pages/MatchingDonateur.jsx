import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setError(t('matching.erreur_acces', "Accès réservé aux donateurs."));
      setLoading(false);
      return;
    }

    const fetchMatching = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/matching/donateur/${user.id_utilisateur}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(t('matching.erreur_chargement', "Erreur chargement"));
        const data = await res.json();
        setDemandes(data.demandes || []);
        setCampagnes(data.campagnes || []);
      } catch (err) {
        console.error(err);
        setError(t('matching.erreur_recommandations', "Impossible de charger les recommandations."));
      } finally {
        setLoading(false);
      }
    };
    fetchMatching();
  }, [user, navigate, t]);

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

  if (loading) return <div className="matching-loading">{t('matching.analyse_profil', "🔍 Analyse de votre profil...")}</div>;
  if (error) return <div className="matching-error">{error}</div>;

  return (
    <div className="matching-container">
      <div className="matching-header">
        <h1>{t('matching.titre', "🤝 Recommandations personnalisées")}</h1>
        <p className="subtitle">{t('matching.sous_titre', "Basées sur votre ville, vos centres d’intérêt et l’urgence")}</p>
      </div>

      <div className="filters-bar">
        <FaFilter className="filter-icon" />
        <button className={typeFiltre === "tous" ? "filter-active" : ""} onClick={() => setTypeFiltre("tous")}>{t('matching.filtre_tous', "Tous")}</button>
        <button className={typeFiltre === "financier" ? "filter-active" : ""} onClick={() => setTypeFiltre("financier")}>{t('matching.filtre_financier', "Financier")}</button>
        <button className={typeFiltre === "materiel" ? "filter-active" : ""} onClick={() => setTypeFiltre("materiel")}>{t('matching.filtre_materiel', "Matériel")}</button>
        <button className={typeFiltre === "competences" ? "filter-active" : ""} onClick={() => setTypeFiltre("competences")}>{t('matching.filtre_competences', "Compétences")}</button>
        <button className={typeFiltre === "kafala" ? "filter-active" : ""} onClick={() => setTypeFiltre("kafala")}>{t('matching.filtre_kafala', "Kafala")}</button>
      </div>

      <section className="matching-section">
        <div className="section-title">
          <FaHeart className="title-icon" />
          <h2>{t('matching.missions_solidaires', "Missions solidaires – Bénéficiaires")}</h2>
          <span className="badge">{demandesFiltrees.length}</span>
        </div>
        {demandesFiltrees.length === 0 ? (
          <div className="empty-state">{t('matching.aucune_mission', "Aucune mission correspondante")}</div>
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
                  <p><FaClock /> {t('matching.urgence_label', "Urgence")} : <span className="urgence-value">{item.urgence}</span></p>
                  <p><FaUsers /> {t('matching.type_label', "Type")} : {item.type_demande}</p>
                  <p><FaStar /> {t('matching.compatibilite_label', "Compatibilité")} : <strong>{item.score}%</strong></p>
                </div>
                <button className="btn-action">{t('matching.voir_aider', "Voir et aider")}</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="matching-section">
        <div className="section-title">
          <FaHandHoldingHeart className="title-icon" />
          <h2>{t('matching.campagnes_associatives', "Campagnes associatives")}</h2>
          <span className="badge">{campagnesFiltrees.length}</span>
        </div>
        {campagnesFiltrees.length === 0 ? (
          <div className="empty-state">{t('matching.aucune_campagne', "Aucune campagne correspondante")}</div>
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
                  <p><FaClock /> {t('matching.urgence_label', "Urgence")} : {item.urgence}</p>
                  <p><FaUsers /> {t('matching.type_label', "Type")} : {item.type_campagne}</p>
                  <p><FaStar /> {t('matching.compatibilite_label', "Compatibilité")} : <strong>{item.score}%</strong></p>
                </div>
                <button className="btn-action">{t('matching.voir_soutenir', "Voir et soutenir")}</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MatchingDonateur;