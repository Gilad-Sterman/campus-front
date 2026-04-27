import React from 'react';
import GatedFeatureLanding from '../components/home/GatedFeatureLanding.jsx';

const PeerConnectLandingPage = () => {
  return (
    <GatedFeatureLanding
      title="Peer Connect"
      subtitle="Connect with students and peers who match your path."
      points={[
        { title: 'Find your people', description: 'Meet people with similar interests and destination goals.' },
        { title: 'Build your network', description: 'Build your support network before you arrive.' },
        { title: 'Learn from peers', description: 'Learn from real student experiences and practical tips.' }
      ]}
      ctaTo="/login?mode=signup&redirect=/profile?tab=study-buddy&source=peer-connect"
    />
  );
};

export default PeerConnectLandingPage;
