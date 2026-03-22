import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchIsraeliUniversities } from '../../store/actions/appActions';

const UniversityTile = ({ university }) => {
  const defaultLogo = '/campus_logo1.jpeg';
  
  return (
    <Link to={`/universities/${university.id}`} className="university-tile">
      <div className="university-logo-container">
        <img 
          src={university.logo_url || defaultLogo} 
          alt={`${university.name} logo`}
          onError={(e) => {
            e.target.src = defaultLogo;
          }}
        />
      </div>
      <h3 className="university-name">{university.name}</h3>
    </Link>
  );
};

const UniversitiesCarousel = ({ autoplayInterval = 5000 }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.app);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [israeliUniversities, setIsraeliUniversities] = useState([]);

  // Responsive tiles per view
  const [tilesPerView, setTilesPerView] = useState(5);

  useEffect(() => {
    const updateTilesPerView = () => {
      if (window.innerWidth < 576) {
        setTilesPerView(2); // Mobile: 2 tiles
      } else if (window.innerWidth < 768) {
        setTilesPerView(3); // Small tablet: 3 tiles
      } else if (window.innerWidth < 992) {
        setTilesPerView(4); // Tablet: 4 tiles
      } else if (window.innerWidth < 1200) {
        setTilesPerView(5); // Desktop: 5 tiles
      } else {
        setTilesPerView(6); // Large desktop: 6 tiles
      }
    };

    updateTilesPerView();
    window.addEventListener('resize', updateTilesPerView);
    return () => window.removeEventListener('resize', updateTilesPerView);
  }, []);

  // Fetch Israeli universities on mount and whenever component mounts
  useEffect(() => {
    const loadIsraeliUniversities = async () => {
      try {
        const israeliUnis = await dispatch(fetchIsraeliUniversities());
        // Double-check filtering at component level to ensure only active Israeli universities
        const filteredUnis = israeliUnis.filter(uni => 
          !uni.isUS && 
          uni.region !== 'United States' && 
          uni.status === 'active'
        );
        setIsraeliUniversities(filteredUnis);
      } catch (error) {
        console.error('Failed to fetch Israeli universities:', error);
      }
    };

    // Always load Israeli universities when component mounts, regardless of current state
    loadIsraeliUniversities();
  }, [dispatch]); // Remove israeliUniversities.length dependency to always fetch fresh data

  // Calculate total screens needed
  const totalScreens = Math.ceil(israeliUniversities.length / tilesPerView);

  // Auto-advance carousel (pause on hover) - advance by screens, not individual items
  useEffect(() => {
    if (totalScreens <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + tilesPerView) % israeliUniversities.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [israeliUniversities.length, tilesPerView, autoplayInterval, isHovered, totalScreens]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - tilesPerView;
      // Proper looping: if we go below 0, wrap to the last complete screen
      if (newIndex < 0) {
        const lastCompleteScreen = Math.floor((israeliUniversities.length - 1) / tilesPerView) * tilesPerView;
        return lastCompleteScreen;
      }
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + tilesPerView;
      return newIndex >= israeliUniversities.length ? 0 : newIndex;
    });
  };

  // Get current visible tiles with proper screen-based pagination
  const getVisibleTiles = () => {
    if (israeliUniversities.length === 0) return [];
    
    const visibleTiles = [];
    for (let i = 0; i < tilesPerView; i++) {
      const index = (currentIndex + i) % israeliUniversities.length;
      visibleTiles.push(israeliUniversities[index]);
    }
    return visibleTiles;
  };

  // Don't render if loading or no Israeli universities
  if (loading || israeliUniversities.length === 0) {
    return null;
  }

  // Handle error state
  if (error) {
    return null;
  }

  const showArrows = totalScreens > 1;
  const showIndicators = totalScreens > 1;
  const currentScreen = Math.floor(currentIndex / tilesPerView);

  return (
    <section className="universities-section">
      <div className="container">
        <h2 className="section-header">ISRAELI UNIVERSITIES</h2>
        
        <div 
          className="carousel-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {showArrows && (
            <button
              className="carousel-arrow carousel-arrow-prev"
              onClick={handlePrev}
              aria-label="Previous universities"
            >
              &lt;
            </button>
          )}

          <div className="carousel-track">
            {getVisibleTiles().map((university, index) => (
              <UniversityTile
                key={`${currentIndex}-${index}-${university.id}`}
                university={university}
              />
            ))}
          </div>

          {showArrows && (
            <button
              className="carousel-arrow carousel-arrow-next"
              onClick={handleNext}
              aria-label="Next universities"
            >
              &gt;
            </button>
          )}
        </div>

        {showIndicators && (
          <div className="carousel-indicators">
            {Array.from({ length: totalScreens }).map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === currentScreen ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index * tilesPerView)}
                aria-label={`Go to screen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UniversitiesCarousel;
