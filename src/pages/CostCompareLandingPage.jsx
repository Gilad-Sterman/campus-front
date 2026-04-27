import React from 'react';
import GatedFeatureLanding from '../components/home/GatedFeatureLanding.jsx';

const CostCompareLandingPage = () => {
  return (
    <GatedFeatureLanding
      title="Cost Compare"
      subtitle="Compare tuition and living costs across your top options."
      points={[
        { title: 'Compare clearly', description: 'See clearer cost differences between programs.' },
        { title: 'Plan ahead', description: 'Plan your budget with more confidence.' },
        { title: 'Balance decisions', description: 'Make decisions using both fit and affordability.' }
      ]}
      ctaTo="/login?mode=signup&redirect=/profile?tab=cost-calculator&source=cost-compare"
    />
  );
};

export default CostCompareLandingPage;
