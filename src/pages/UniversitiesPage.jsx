import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUniversities } from '../store/actions/appActions';
import { getTimeSinceLastFetch } from '../utils/cacheUtils';

const UniversitiesPage = () => {
  const dispatch = useDispatch();
  const { universities, loading, error, universitiesLastFetched } = useSelector(state => state.app);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchUniversities());
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchUniversities(true)); // Force refresh
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-xl">
        <div className="universities-page">
          <header className="page-header">
            <h1>Israeli Universities</h1>
            <p className="page-description">
              Explore top universities in Israel offering world-class education and research opportunities.
            </p>
          </header>

          <div className="loading-state">
            <div className="loading-animation">
              <div className="pulse-circle"></div>
              <div className="pulse-circle pulse-delay-1"></div>
              <div className="pulse-circle pulse-delay-2"></div>
            </div>
            <h3>Loading Universities...</h3>
            <p>Fetching the latest information about Israeli universities</p>
            
            {/* Skeleton cards */}
            <div className="universities-grid">
              {[1, 2, 3, 4, 5, 6].map(index => (
                <div key={index} className="skeleton-card">
                  <div className="skeleton-header">
                    <div className="skeleton-logo"></div>
                    <div className="skeleton-info">
                      <div className="skeleton-line skeleton-title"></div>
                      <div className="skeleton-line skeleton-location"></div>
                    </div>
                  </div>
                  <div className="skeleton-description">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line skeleton-short"></div>
                  </div>
                  <div className="skeleton-actions">
                    <div className="skeleton-button"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-xl">
        <div className="error-message">
          <h2>Error Loading Universities</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch(fetchUniversities())}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-xl">
      <div className="universities-page">
        <header className="page-header">
          <h1>Israeli Universities</h1>
          <p className="page-description">
            Explore top universities in Israel offering world-class education and research opportunities.
          </p>
        </header>

        <div className="universities-grid">
          {universities.length === 0 ? (
            <div className="empty-state">
              <h3>No Universities Found</h3>
              <p>We're working on adding university data. Please check back soon!</p>
            </div>
          ) : (
            universities.map(university => (
              <div key={university.id} className="university-card">
                <div className="university-card-header">
                  {university.logo_url && (
                    <img 
                      src={university.logo_url} 
                      alt={`${university.name} logo`}
                      className="university-logo"
                    />
                  )}
                  <div className="university-info">
                    <h3 className="university-name">{university.name}</h3>
                    <p className="university-location">{university.city}</p>
                  </div>
                </div>

                {university.description && (
                  <p className="university-description">
                    {university.description}
                  </p>
                )}

                <div className="university-actions">
                  {university.website_url && (
                    <a 
                      href={university.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      Visit Website
                    </a>
                  )}
                  {university.application_url && (
                    <a 
                      href={university.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Go to University Site
                    </a>
                  )}
                </div>

                <div className="university-meta">
                  <small>Added {new Date(university.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          )}
        </div>

        {universities.length > 0 && (
          <div className="page-footer">
            <div className="footer-info">
              <p>Found {universities.length} universities in Israel</p>
              {universitiesLastFetched && (
                <p className="cache-info">
                  Last updated: {getTimeSinceLastFetch(universitiesLastFetched)}
                </p>
              )}
            </div>
            <button 
              className={`btn btn-outline ${isRefreshing ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitiesPage;
