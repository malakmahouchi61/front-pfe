import React from "react";
import "./TypesDons.css";

const TypesDons = () => {
  return (
    <div className="types-dons-page">
      <section className="types-dons">
        <h2>TYPES DE DONS</h2>
        <p className="sous-titre">Plusieurs façons d'aider</p>
        <p className="description">
          Choisissez le type de don qui vous correspond. Chaque geste compte.
        </p>

        <div className="cards-grid">
          <div className="card">
            <h3>Kafala</h3>
            <p>Parrainage d'orphelins, étudiants, malades ou familles en difficulté.</p>
          </div>
          <div className="card">
            <h3>Dons matériels</h3>
            <p>Vêtements, nourriture, livres, équipements pour ceux qui en ont besoin.</p>
          </div>
          <div className="card">
            <h3>Dons de compétences</h3>
            <p>Cours, aide technique, coaching et soutien moral pour aider à grandir.</p>
          </div>
          <div className="card">
            <h3>Don de temps</h3>
            <p>Bénévolat, accompagnement et présence pour les personnes isolées.</p>
          </div>
          <div className="card">
            <h3>Dons collectifs</h3>
            <p>Plusieurs donateurs s'unissent pour aider une même personne ou projet.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TypesDons;