import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHandsHelping,
  FaBullhorn,
  FaHeart,
  FaHandHoldingHeart,
  FaRobot,
  FaComments,
  FaChartLine,
} from "react-icons/fa";
import DonorChat from "../components/DonorChat";
import { useTranslation } from 'react-i18next';
import "./Accueil.css";

const Accueil = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showChatModal, setShowChatModal] = useState(false);

  // Animation au scroll (fade-up)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">
            <FaHeart className="badge-icon" /> {t('accueil.hero_badge')}
          </span>
          <h1 className="hero-title">
            {t('accueil.hero_title')}
          </h1>
          <p className="hero-description">
            {t('accueil.hero_description')}
          </p>
          <div className="hero-buttons">
            <Link to="/missions" className="btn btn-primary">
              <FaHandHoldingHeart /> {t('accueil.btn_donner')}
            </Link>
            <Link to="/missions" className="btn btn-outline">
              {t('accueil.btn_decouvrir')}
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">+1 200</span>
            <span className="stat-label">{t('accueil.stat_missions')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">+3 500</span>
            <span className="stat-label">{t('accueil.stat_donateurs')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">{t('accueil.stat_transparence')}</span>
          </div>
        </div>
      </section>

      {/* Section : Que souhaitez-vous faire ? */}
      <section className="choix-section">
        <div className="section-header fade-up">
          <h2>{t('accueil.choix_titre')}</h2>
          <p>{t('accueil.choix_sous_titre')}</p>
        </div>
        <div className="choix-cartes">
          <div className="carte fade-up">
            <div className="carte-icon"><FaHandsHelping /></div>
            <h3>{t('accueil.demander_aide')}</h3>
            <p>{t('accueil.demander_aide_desc')}</p>
            <Link to="/demander-aide" className="carte-btn">{t('accueil.demander_aide_btn')}</Link>
          </div>
          <div className="carte fade-up">
            <div className="carte-icon"><FaBullhorn /></div>
            <h3>{t('accueil.creer_campagne')}</h3>
            <p>{t('accueil.creer_campagne_desc')}</p>
            <Link to="/creer-campagne" className="carte-btn">{t('accueil.creer_campagne_btn')}</Link>
          </div>
          <div className="carte fade-up">
            <div className="carte-icon"><FaHeart /></div>
            <h3>{t('accueil.faire_don')}</h3>
            <p>{t('accueil.faire_don_desc')}</p>
            <Link to="/missions" className="carte-btn">{t('accueil.faire_don_btn')}</Link>
          </div>
        </div>
      </section>

      {/* Section : Pourquoi choisir Sanad ? */}
      <section className="valeurs-section">
        <div className="section-header fade-up">
          <h2>{t('accueil.pourquoi_titre')}</h2>
          <p>{t('accueil.pourquoi_sous_titre')}</p>
        </div>
        <div className="valeurs-grid">
          <div
            className="valeur-card fade-up"
            onClick={() => navigate("/matching-ia")}
            style={{ cursor: "pointer" }}
          >
            <FaRobot className="valeur-icon" />
            <h4>{t('accueil.matching_ia')}</h4>
            <p>{t('accueil.matching_ia_desc')}</p>
            <button className="chat-trigger-btn">{t('accueil.matching_ia_btn')}</button>
          </div>

          <div className="valeur-card fade-up">
            <FaComments className="valeur-icon" />
            <h4>{t('accueil.assistant_ia')}</h4>
            <p>{t('accueil.assistant_ia_desc')}</p>
            <button className="chat-trigger-btn" onClick={() => setShowChatModal(true)}>
              {t('accueil.assistant_ia_btn')}
            </button>
          </div>

          <div
            className="valeur-card fade-up"
            onClick={() => navigate("/priorisation")}
            style={{ cursor: "pointer" }}
          >
            <FaChartLine className="valeur-icon" />
            <h4>{t('accueil.priorisation')}</h4>
            <p>{t('accueil.priorisation_desc')}</p>
            <button className="chat-trigger-btn">{t('accueil.priorisation_btn')}</button>
          </div>
        </div>
      </section>

      {/* Modale du chatbot */}
      {showChatModal && (
        <div className="chat-modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3>{t('chat.titre', 'Assistant Sanad IA')}</h3>
              <button className="close-modal" onClick={() => setShowChatModal(false)}>✕</button>
            </div>
            <DonorChat />
          </div>
        </div>
      )}
    </>
  );
};

export default Accueil;