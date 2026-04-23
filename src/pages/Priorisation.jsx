import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaClock, FaUsers, FaChartLine, FaFilter } from "react-icons/fa";
import "./Priorisation.css";

const Priorisation = () => {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFiltre, setTypeFiltre] = useState("tous");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resDemandes, resCampagnes] = await Promise.all([
          fetch("/api/priorite/demandes"),
          fetch("/api/priorite/campagnes")
        ]);
        if (!resDemandes.ok || !resCampagnes.ok) throw new Error(t('priorisation.erreur_chargement', "Erreur chargement"));
        const demandesData = await resDemandes.json();
        const campagnesData = await resCampagnes.json();
        setDemandes(demandesData);
        setCampagnes(campagnesData);
      } catch (err) {
        console.error(err);
        setError(t('priorisation.erreur_priorites', "Impossible de charger les priorités."));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  const filtrerParType = (items, typeField) => {
    if (typeFiltre === "tous") return items;
    return items.filter(item => item[typeField] === typeFiltre);
  };
  const demandesFiltrees = filtrerParType(demandes, "type");
  const campagnesFiltrees = filtrerParType(campagnes, "type");
  const getPriorityColor = (score) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) return <div className="priorisation-loading">{t('priorisation.calcul_priorites', "📊 Calcul des priorités...")}</div>;
  if (error) return <div className="priorisation-error">{error}</div>;

  return (
    <div className="priorisation-container">
      <div className="priorisation-header">
        <h1>{t('priorisation.titre', "📋 Priorisation des besoins")}</h1>
        <p className="subtitle">{t('priorisation.sous_titre', "Classement objectif (date de fin, besoin restant, nombre de donateurs)")}</p>
      </div>
      <div className="filters-bar">
        <FaFilter className="filter-icon" />
        <button className={typeFiltre === "tous" ? "filter-active" : ""} onClick={() => setTypeFiltre("tous")}>{t('priorisation.filtre_tous', "Tous")}</button>
        <button className={typeFiltre === "financier" ? "filter-active" : ""} onClick={() => setTypeFiltre("financier")}>{t('priorisation.filtre_financier', "Financier")}</button>
        <button className={typeFiltre === "materiel" ? "filter-active" : ""} onClick={() => setTypeFiltre("materiel")}>{t('priorisation.filtre_materiel', "Matériel")}</button>
        <button className={typeFiltre === "competences" ? "filter-active" : ""} onClick={() => setTypeFiltre("competences")}>{t('priorisation.filtre_competences', "Compétences")}</button>
        <button className={typeFiltre === "kafala" ? "filter-active" : ""} onClick={() => setTypeFiltre("kafala")}>{t('priorisation.filtre_kafala', "Kafala")}</button>
      </div>
      <section className="priorisation-section">
        <div className="section-title">
          <FaChartLine className="title-icon" />
          <h2>{t('priorisation.missions_prioritaires', "Missions prioritaires (bénéficiaires)")}</h2>
          <span className="badge">{demandesFiltrees.length}</span>
        </div>
        {demandesFiltrees.length === 0 ? (
          <div className="empty-state">{t('priorisation.aucune_mission', "Aucune mission pour le moment.")}</div>
        ) : (
          <div className="cards-grid">
            {demandesFiltrees.slice(0, 3).map((item) => (
              <div key={item.id} className="priority-card" onClick={() => navigate(`/missions/${item.id}`)}>
                <div className="card-header">
                  <h3>{item.titre}</h3>
                  <div className="priority-score" style={{ background: getPriorityColor(item.score) }}>{item.score}%</div>
                </div>
                <div className="card-details">
                  <p><FaMapMarkerAlt /> {item.ville}</p>
                  <p><FaClock /> {t('priorisation.urgence_label', "Urgence")} : {item.urgence}</p>
                  <p><FaUsers /> {t('priorisation.type_label', "Type")} : {item.type}</p>
                </div>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${item.score}%` }} />
                </div>
                <button className="btn-view">{t('priorisation.btn_voir_mission', "Voir la mission")}</button>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="priorisation-section">
        <div className="section-title">
          <FaChartLine className="title-icon" />
          <h2>{t('priorisation.campagnes_prioritaires', "Campagnes prioritaires (associations)")}</h2>
          <span className="badge">{campagnesFiltrees.length}</span>
        </div>
        {campagnesFiltrees.length === 0 ? (
          <div className="empty-state">{t('priorisation.aucune_campagne', "Aucune campagne pour le moment.")}</div>
        ) : (
          <div className="cards-grid">
            {campagnesFiltrees.slice(0, 3).map((item) => (
              <div key={item.id} className="priority-card" onClick={() => navigate(`/campagnes/${item.id}`)}>
                <div className="card-header">
                  <h3>{item.titre}</h3>
                  <div className="priority-score" style={{ background: getPriorityColor(item.score) }}>{item.score}%</div>
                </div>
                <div className="card-details">
                  <p><FaMapMarkerAlt /> {item.ville}</p>
                  <p><FaClock /> {t('priorisation.urgence_label', "Urgence")} : {item.urgence}</p>
                  <p><FaUsers /> {t('priorisation.type_label', "Type")} : {item.type}</p>
                </div>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${item.score}%` }} />
                </div>
                <button className="btn-view">{t('priorisation.btn_voir_campagne', "Voir la campagne")}</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Priorisation;