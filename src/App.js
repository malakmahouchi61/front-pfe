// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationListener from "./components/NotificationListener";

// Pages
import Accueil from "./pages/Accueil";
import Connexion from "./pages/Connexion";
import Inscriptions from "./pages/Inscriptions";
import Missions from "./pages/Missions";
import Campagnes from "./pages/Campagnes";
import CampagnesDetail from "./pages/CampagnesDetail";
import Classement from "./pages/Classement";
import Profil from "./pages/Profil";
import DemandeAide from "./pages/DemandeAide";
import CreerCampagne from "./pages/CreerCampagne";
import Dashboard from "./pages/Dashboard";
import DemandeDetail from "./pages/DemandeDetail";

import "./App.css";

/**
 * Composant interne qui a accès à useAuth()
 * → passe l'id utilisateur au SocketProvider pour créer
 *   le socket uniquement quand l'utilisateur est connecté.
 */
const AppContent = () => {
  const { user } = useAuth();

  // Récupère l'id peu importe la forme retournée par votre AuthContext
  const userId = user?.id_utilisateur ?? user?.id ?? null;

  return (
    <SocketProvider userId={userId}>
      <NotificationProvider>
        <Router>
          <Navbar />
          <ToastContainer position="top-right" autoClose={5000} />
          <NotificationListener />
          <Routes>
            {/* ── Pages publiques ──────────────────────────────── */}
            <Route path="/"              element={<Accueil />} />
            <Route path="/accueil"       element={<Accueil />} />
            <Route path="/connexion"     element={<Connexion />} />
            <Route path="/inscription"   element={<Inscriptions />} />
            <Route path="/missions"      element={<Missions />} />
            <Route path="/missions/:id"  element={<DemandeDetail />} />
            <Route path="/campagnes"     element={<Campagnes />} />
            <Route path="/campagnes/:id" element={<CampagnesDetail />} />
            <Route path="/classement"    element={<Classement />} />
            <Route path="/profil"        element={<Profil />} />

            {/* ── Pages protégées ──────────────────────────────── */}
            <Route
              path="/demander-aide"
              element={
                <ProtectedRoute allowedRoles={["beneficiaire"]}>
                  <DemandeAide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creer-campagne"
              element={
                <ProtectedRoute allowedRoles={["association"]}>
                  <CreerCampagne />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </NotificationProvider>
    </SocketProvider>
  );
};

/**
 * App racine : ThemeProvider et AuthProvider enveloppent tout.
 * AppContent est à l'intérieur pour pouvoir appeler useAuth().
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
