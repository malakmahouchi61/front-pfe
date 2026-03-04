// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Si l'utilisateur n'a pas le bon rôle, rediriger vers l'accueil (ou une page d'erreur)
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/accueil" replace />;
  }

  // Sinon, afficher la page demandée
  return children;
};

export default ProtectedRoute;