import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Composant de protection des routes
 * @param {object} props
 * @param {React.ReactNode} props.children - Le composant à afficher si autorisé
 * @param {string[]} props.allowedRoles - Liste des rôles autorisés (ex: ['beneficiaire', 'association'])
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Chargement...</div>;

  // Non connecté → redirection vers connexion
  if (!user) return <Navigate to="/connexion" replace />;

  // Si une liste de rôles est fournie, vérifier que l'utilisateur a un rôle autorisé
  if (allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole);
    if (!isAllowed) return <Navigate to="/" replace />;
  }

  // Autorisation accordée
  return children;
};

export default ProtectedRoute;