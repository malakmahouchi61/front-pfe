import React from "react";
import { Link } from "react-router-dom";
import { FaHandsHelping, FaBullhorn, FaHeart } from "react-icons/fa";
import "./Accueil.css";

const Accueil = () => {
  return (
    <>
      {/* Section Hero */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Plateforme Solidaire Intelligente</h1>
          <p className="hero-subtitle">Donnez avec impact, changez des vies</p>
          <p className="hero-description">
            Une plateforme qui relie les cœurs aux besoins réels, en centralisant tous les types de dons et en garantissant transparence, confiance et impact durable.
          </p>
          <div className="hero-buttons">
            <Link to="/donner" className="btn btn-primary">Commencer à donner</Link>
            <Link to="/missions" className="btn btn-outline">Découvrir les missions</Link>
          </div>
        </div>
      </section>

      {/* Section : Que souhaitez-vous faire ? */}
      <section className="choix-section">
        <h2 className="choix-titre">Que souhaitez-vous faire ?</h2>
        <p className="choix-sous-titre">Choisissez votre parcours selon votre situation</p>

        <div className="choix-cartes">
          {/* Carte Demander du soutien */}
          <div className="carte">
            <div className="carte-icon">
              <FaHandsHelping />
            </div>
            <h3>Demander du soutien</h3>
            <p>Vous avez besoin d'aide ? Soumettez une demande et notre IA trouvera les donateurs adaptés.</p>
            <Link to="/demander-aide" className="carte-btn">Faire une demande →</Link>
          </div>

          {/* Carte Créer une campagne */}
          <div className="carte">
            <div className="carte-icon">
              <FaBullhorn />
            </div>
            <h3>Créer une campagne</h3>
            <p>Vous êtes une association ? Lancez une campagne pour mobiliser des donateurs autour de votre projet.</p>
            <Link to="/creer-campagne" className="carte-btn">Lancer une campagne →</Link>
          </div>

          {/* Carte Faire un don */}
          <div className="carte">
            <div className="carte-icon">
              <FaHeart />
            </div>
            <h3>Faire un don</h3>
            <p>Kafala, financier, matériel ou compétences — choisissez votre mission et faites la différence.</p>
             <Link to="/missions" className="carte-btn">Voir les missions →</Link>  {/* ← corrigé */}
          </div>
        </div>
      </section>
    </>
  );
};

export default Accueil;