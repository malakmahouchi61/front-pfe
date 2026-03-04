import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Accueil from "./pages/Accueil";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscriptions";
import DemandeAide from './pages/DemandeAide';
import CreerCampagne from './pages/CreerCampagne';
import Missions from './pages/Missions';
import Campagnes from './pages/Campagne';
import Classement from './pages/Classement';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Accueil />} />
          <Route path="/accueil" element={<Accueil />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/campagnes" element={<Campagnes />} />
          <Route path="/classement" element={<Classement />} />

          {/* Routes protégées selon le rôle */}
          <Route
            path="/demander-aide"
            element={
              <ProtectedRoute allowedRoles={['Beneficiaire']}>
                <DemandeAide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creer-campagne"
            element={
              <ProtectedRoute allowedRoles={['Association']}>
                <CreerCampagne />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Association']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <div className="spacer"></div>
      </Router>
    </AuthProvider>
  );
}

export default App;