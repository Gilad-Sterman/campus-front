import React from 'react';
import { Link } from 'react-router-dom';

const quizStartCardImages = [
  'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(2).png',
  'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1.png',
  'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(1).png'
];

const GatedFeatureLanding = ({ title, subtitle, points, ctaTo }) => {
  return (
    <section className="quiz-start-page gated-feature-quiz">
      <div className="quiz-start-hero">
        <div className="quiz-hero-description">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="quiz-card-container">
        {points.map((point, index) => (
          <div key={point.title} className="quiz-start-card">
            <img src={quizStartCardImages[index % quizStartCardImages.length]} alt="" />
            <p>
              <strong>{point.title}</strong>
            </p>
            {point.description}
          </div>
        ))}
      </div>

      <div className="quiz-start-content">
        <div className="quiz-info">
          <p>
            <strong>Quick access note:</strong> Create your account to unlock this feature.
          </p>
        </div>

        <Link to={ctaTo} className="quiz-cta">
          Sign Up / Register to Access
        </Link>
      </div>
    </section>
  );
};

export default GatedFeatureLanding;
