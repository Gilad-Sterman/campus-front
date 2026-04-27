import React from 'react';
import GatedFeatureLanding from '../components/home/GatedFeatureLanding.jsx';

const ConciergeLandingPage = () => {
  return (
    <GatedFeatureLanding
      title="Concierge"
      subtitle="Get personalized 1:1 guidance for your study journey in Israel."
      points={[
        { title: 'Personal guidance', description: 'Talk to a real person who understands your goals.' },
        { title: 'Flexible booking', description: 'Book support when you need it, on your timeline.' },
        { title: 'Clear next steps', description: 'Get clear next steps so you can move forward confidently.' }
      ]}
      ctaTo="/login?mode=signup&redirect=/profile?tab=concierge&source=concierge"
    />
  );
};

export default ConciergeLandingPage;
