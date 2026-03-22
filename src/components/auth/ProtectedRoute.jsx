import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, loading } = useSelector(state => state.auth);
  const location = useLocation();

  // Show loading while auth is being initialized
  if (!isInitialized || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended route
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
