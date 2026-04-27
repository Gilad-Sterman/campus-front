import React from 'react';
import GatedFeatureLanding from '../components/home/GatedFeatureLanding.jsx';

const ConciergeLandingPage = () => {
  return (
    <GatedFeatureLanding
      title="We’re here for you"
      color="#00BAFF"
      // subtitle="Get personalized 1:1 guidance for your study journey in Israel."
      points={[
        { title: '30-Minute Sessions', description: 'Dedicated one-on-one time with an expert', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1.svg' },
        { title: 'Virtual Meeting', description: 'Connect via Zoom from anywhere', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Group%203.svg' },
        { title: 'A Team Effort', description: 'Invite your guidance counselor or parent to join a call', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(5).svg' }
      ]}
      ctaTo="/login?mode=signup&redirect=/profile?tab=concierge&source=concierge"
    />
  );
};

export default ConciergeLandingPage;
