import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Reusable category tile component
const CategoryTile = ({ imageUrl, imageAlt, title, description, link }) => {
  return (
    <div className="category-tile">
      <div className="category-image">
        <img src={imageUrl} alt={imageAlt || title} />
      </div>
      <Link to={link} className="category-link">
        <h3>{title}</h3>
      </Link>
      <p>{description}</p>
    </div>
  );
};

const CategoryCarousel = ({ title, categories, tilesPerView = 4, autoplayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalCategories = categories.length;
  const totalSlides = Math.ceil(totalCategories / tilesPerView);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [totalSlides, autoplayInterval]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  // Get current visible tiles
  const getVisibleTiles = () => {
    const start = currentIndex * tilesPerView;
    const visibleCategories = categories.slice(start, start + tilesPerView);

    // If we're at the end and need to loop back for a full view
    if (visibleCategories.length < tilesPerView && totalCategories > tilesPerView) {
      const remaining = tilesPerView - visibleCategories.length;
      return [...visibleCategories, ...categories.slice(0, remaining)];
    }

    return visibleCategories;
  };

  return (
    <section className="category-section">
      <div className="container">
        <h2 className="section-header">{title}</h2>
        {/* <p className="p-large">Israel innovates solutions and exports them to the world.</p> */}

        <div className="carousel-container">
          {/* <button
            className="carousel-arrow carousel-arrow-prev"
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            &lt;
          </button> */}

          <div className="carousel-track">
            {getVisibleTiles().map((category, index) => (
              <CategoryTile
                key={`${currentIndex}-${index}`}
                imageUrl={category.imageUrl}
                imageAlt={category.imageAlt}
                title={category.title}
                description={category.description}
                link={category.link}
              />
            ))}
          </div>

          {/* <button
            className="carousel-arrow carousel-arrow-next"
            onClick={handleNext}
            aria-label="Next slide"
          >
            &gt;
          </button> */}
        </div>

        {/* <div className="carousel-indicators">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default CategoryCarousel;
