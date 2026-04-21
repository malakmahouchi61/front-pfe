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
import "./Accueil.css";

const Accueil = () => {
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
            <FaHeart className="badge-icon" /> Plateforme Solidaire
          </span>
          <h1 className="hero-title">
            Donnez avec impact,<br />changez des vies
          </h1>
          <p className="hero-description">
            Une plateforme intelligente qui relie les cœurs aux besoins réels.
          </p>
          <div className="hero-buttons">
            <Link to="/missions" className="btn btn-primary">
              <FaHandHoldingHeart /> Commencer à donner
            </Link>
            <Link to="/missions" className="btn btn-outline">
              Découvrir les missions
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">+1 200</span>
            <span className="stat-label">Missions réalisées</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">+3 500</span>
            <span className="stat-label">Donateurs actifs</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Transparence</span>
          </div>
        </div>
      </section>

      {/* Section : Que souhaitez-vous faire ? */}
      <section className="choix-section">
        <div className="section-header fade-up">
          <h2>Que souhaitez-vous faire ?</h2>
          <p>Choisissez votre parcours selon votre situation</p>
        </div>
        <div className="choix-cartes">
          <div className="carte fade-up">
            <div className="carte-icon"><FaHandsHelping /></div>
            <h3>Demander du soutien</h3>
            <p>Vous avez besoin d’aide ? Soumettez une demande et notre IA trouvera les donateurs adaptés.</p>
            <Link to="/demander-aide" className="carte-btn">Faire une demande →</Link>
          </div>
          <div className="carte fade-up">
            <div className="carte-icon"><FaBullhorn /></div>
            <h3>Créer une campagne</h3>
            <p>Association ? Lancez une campagne pour mobiliser des donateurs autour de votre projet.</p>
            <Link to="/creer-campagne" className="carte-btn">Lancer une campagne →</Link>
          </div>
          <div className="carte fade-up">
            <div className="carte-icon"><FaHeart /></div>
            <h3>Faire un don</h3>
            <p>Kafala, financier, matériel ou compétences — choisissez votre mission et faites la différence.</p>
            <Link to="/missions" className="carte-btn">Voir les missions →</Link>
          </div>
        </div>
      </section>

      {/* Section : Pourquoi choisir Sanad ? */}
      <section className="valeurs-section">
        <div className="section-header fade-up">
          <h2>Pourquoi choisir Sanad ?</h2>
          <p>Une plateforme conçue pour maximiser votre impact</p>
        </div>
        <div className="valeurs-grid">
          <div
            className="valeur-card fade-up"
            onClick={() => navigate("/matching-ia")}
            style={{ cursor: "pointer" }}
          >
            <FaRobot className="valeur-icon" />
            <h4>Matching IA intelligent</h4>
            <p>Notre algorithme met en relation donateurs et bénéficiaires selon la localisation, l’urgence et les centres d’intérêt.</p>
            <button className="chat-trigger-btn">Découvrir le matching →</button>
          </div>

          <div className="valeur-card fade-up">
            <FaComments className="valeur-icon" />
            <h4>Assistant IA</h4>
            <p>Posez toutes vos questions en temps réel : reçu fiscal, impact de votre don, campagne en cours…</p>
            <button className="chat-trigger-btn" onClick={() => setShowChatModal(true)}>
              💬 Discuter avec l'assistant
            </button>
          </div>

          <div
            className="valeur-card fade-up"
            onClick={() => navigate("/priorisation")}
            style={{ cursor: "pointer" }}
          >
            <FaChartLine className="valeur-icon" />
            <h4>Priorisation des besoins</h4>
            <p>Financier, matériel, compétences, kafala… Découvrez les causes les plus urgentes.</p>
            <button className="chat-trigger-btn">Voir les priorités →</button>
          </div>
        </div>
      </section>

      {/* Modale du chatbot */}
      {showChatModal && (
        <div className="chat-modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3>🤖 Assistant Sanad IA</h3>
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