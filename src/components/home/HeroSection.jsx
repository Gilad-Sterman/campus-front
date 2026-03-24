import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HeroSection = ({ isLoggedIn, hasTakenQuiz, hasChurnedQuiz }) => {
  // Determine which CTA to show based on user state according to the table:
  // User State | Login/Signup | Primary CTA | Secondary CTA
  // Not Logged In | Show | Start Free Quiz | Apply Now
  // Logged In, No Quiz | Hide | Start Free Quiz | Apply Now
  // Logged In, Quiz Started | Hide | Continue Quiz | Apply Now
  // Logged In, Quiz Completed | Hide | See My Results | Apply Now
  // Logged In, Has Applications | Hide | See My Results | My Applications

  const [currentIndex, setCurrentIndex] = useState(0);

  const heroImgs = [
    // {
    //   title: "Collective power",
    //   img: "https://res.cloudinary.com/dollaguij/image/upload/v1771457686/7b4bfb700143bb62038799f5b130db8f2768224f_k0yh9w.png"
    // },
    {
      title: "LAUNCH YOUR LIFE ",
      img: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-2248592663.jpg"
    },
    // {
    //   title: "Daring to try",
    //   img: "https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/GettyImages-2205739506.jpg"
    // },
    {
      title: "College. Reclaimed.",
      img: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-2158556312.jpg"
    },
    {
      title: "Work hard play hard",
      img: "https://res.cloudinary.com/dollaguij/image/upload/v1771457890/ffe2e54551c52556aea8dfa0050e68f9c2b0e7b9_rixjgy.png"
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImgs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImgs.length]);

  // Primary CTA logic
  const renderPrimaryCta = () => {
    if (hasTakenQuiz) {
      const resultsLink = isLoggedIn ? '/quiz/results' : '/quiz';
      return <Link to={resultsLink} className="btn btn-primary">See My Results</Link>;
    } else if (hasChurnedQuiz) {
      return <Link to="/quiz" className="btn btn-primary">Continue Quiz</Link>;
    } else {
      return <Link to="/quiz" className="btn btn-primary"><span>Discover </span>your best options with our PathFinder quiz</Link>;
    }
  };



  return (
    <section className="hero-section">
      <div className="container">
        <div className='hero-carousel'>
          <div className='carousel-item'>
            <img src={heroImgs[currentIndex].img} alt="" className={heroImgs[currentIndex].title === "College. Reclaimed." ? "top" : ""} />
            <div className="carousel-caption">
              <h2 className="hero-headline">{heroImgs[currentIndex].title}</h2>
              <p className="hero-subheadline">With a world class degree in Israel</p>
            </div>
          </div>
          <div className="hero-content">
            <div className="hero-cta-container second-title">
              {renderPrimaryCta()}
            </div>
            <div className="hero-cta-container">
              <Link to={"/apply/intro"} className="btn btn-primary btn-lg"><span>Apply!</span>search, manage with our Cancierge service</Link>
            </div>
          </div>
          <div className='carousel-nav'>
            {heroImgs.map((img, index) => (
              <button key={index} className={`carousel-dot ${index === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(index)}></button>
            ))}
          </div>
        </div>

      </div>

      <div className="concierge-sticky">
        <Link to={isLoggedIn ? "/profile?tab=concierge" : "/login?redirect=/profile?tab=concierge"} className="btn btn-concierge">
          Book Concierge
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
