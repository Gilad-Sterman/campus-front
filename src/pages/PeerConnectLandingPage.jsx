import React from 'react';
import GatedFeatureLanding from '../components/home/GatedFeatureLanding.jsx';

const PeerConnectLandingPage = () => {
  return (
    <GatedFeatureLanding
      title="Peer Connect"
      // subtitle="Connect with students and peers who match your path."
      points={[
        { title: '', description: 'Get insights and answers', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(4).svg' },
        { title: '', description: 'Advice from those who have done it', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Group%203%20(2).svg' },
        { title: '', description: 'Plan together', icon: 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(1).svg' }
      ]}
      ctaTo="/login?mode=signup&redirect=/profile?tab=study-buddy&source=peer-connect"
      color="#F6C511"
    />
  );
};

export default PeerConnectLandingPage;
