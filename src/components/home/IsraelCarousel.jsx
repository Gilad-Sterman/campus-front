import React, { useState, useEffect } from 'react';

const IsraelTile = ({ imageUrl, imageAlt, headline, description }) => {
  return (
    <div className="israel-tile">
      <h3 className="israel-headline">{headline}</h3>
      <div className="israel-image">
        <img src={imageUrl} alt={imageAlt || headline} />
      </div>
      <p>{description}</p>
    </div>
  );
};

const IsraelCarousel = ({ autoplayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample data - this would come from your CMS or state management in production
  const israelBenefits = [
    {
      imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1722243275/OCEAN%20Gr/Picture15_cxgacy.jpg",
      imageAlt: "Cost comparison chart showing education value",
      headline: "MIT education at a fraction of the cost",
      description: "World-class education with tuition fees significantly lower than US and European universities."
    },
    {
      imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1747915744/AIPic_fcnxoe.jpg",
      imageAlt: "Innovation hub in Tel Aviv",
      headline: "Startup Nation experience",
      description: "Study in the heart of innovation with opportunities to connect with leading tech companies."
    },
    {
      imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1741269800/warm_floral_design_rv7iyc.webp",
      imageAlt: "International students at graduation",
      headline: "Global recognition",
      description: "Israeli degrees are internationally recognized and respected by employers worldwide."
    },
    {
      imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1722243275/OCEAN%20Gr/Picture15_cxgacy.jpg",
      imageAlt: "Advanced research laboratory",
      headline: "Cutting-edge research",
      description: "Access to advanced research facilities and pioneering academic programs."
    },
    {
      imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1741269800/warm_floral_design_rv7iyc.webp",
      imageAlt: "International classroom with diverse students",
      headline: "English-taught programs",
      description: "Many programs are fully taught in English, eliminating language barriers."
    },
    {
      imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1722243275/OCEAN%20Gr/Picture15_cxgacy.jpg",
      imageAlt: "Students exploring historical sites",
      headline: "Rich cultural experience",
      description: "Immerse yourself in a diverse society with thousands of years of history."
    },
    {
      imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1741269800/warm_floral_design_rv7iyc.webp",
      imageAlt: "Job fair at an Israeli university",
      headline: "Career opportunities",
      description: "Strong industry connections and internship programs with leading companies."
    },
    {
      imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1722243275/OCEAN%20Gr/Picture15_cxgacy.jpg",
      imageAlt: "Students studying near the beach",
      headline: "Mediterranean lifestyle",
      description: "Enjoy beautiful weather, beaches, and a vibrant social atmosphere."
    }
  ];

  const tilesPerView = 4;
  const totalSlides = Math.ceil(israelBenefits.length / tilesPerView);

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
    const visibleTiles = israelBenefits.slice(start, start + tilesPerView);

    // If we're at the end and need to loop back for a full view
    if (visibleTiles.length < tilesPerView && israelBenefits.length > tilesPerView) {
      const remaining = tilesPerView - visibleTiles.length;
      return [...visibleTiles, ...israelBenefits.slice(0, remaining)];
    }

    return visibleTiles;
  };

  return (
    <section className="israel-section" id="why-israel">
      <div className="container">
        <h2 className="section-header">WHY STUDY IN ISRAEL?</h2>

        <div className="carousel-container">
          <button
            className="carousel-arrow carousel-arrow-prev"
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            &lt;
          </button>

          <div className="carousel-track">
            {getVisibleTiles().map((benefit, index) => (
              <IsraelTile
                key={`${currentIndex}-${index}`}
                imageUrl={benefit.imageUrl}
                imageAlt={benefit.imageAlt}
                headline={benefit.headline}
                description={benefit.description}
              />
            ))}
          </div>

          <button
            className="carousel-arrow carousel-arrow-next"
            onClick={handleNext}
            aria-label="Next slide"
          >
            &gt;
          </button>
        </div>

        <div className="carousel-indicators">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default IsraelCarousel;
