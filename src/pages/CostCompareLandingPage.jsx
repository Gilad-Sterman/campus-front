import React from 'react';
import GatedFeatureLanding from '../components/home/GatedFeatureLanding.jsx';

const CostCompareLandingPage = () => {
  return (
    <GatedFeatureLanding
      title="Cost Compare"
      // subtitle="Compare tuition and living costs across your top options."
      points={[
        { title: '', description: 'Plug in your options', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(2).svg' },
        { title: '', description: 'Real cost, both countries', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Group%203%20(1).svg' },
        { title: '', description: 'Side-by-side comparisons', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(3).svg' }
      ]}
      color="#38808F"
      ctaTo="/login?mode=signup&redirect=/profile?tab=cost-calculator&source=cost-compare"
    />
  );
};

export default CostCompareLandingPage;
