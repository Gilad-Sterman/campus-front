import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Components
import ProfileSidebar from '../components/profile/ProfileSidebar';
import MyApplications from '../components/profile/MyApplications';
import QuizSummary from '../components/profile/QuizSummary';
import CostCalculator from '../components/profile/CostCalculator';
import StudyBuddy from '../components/profile/StudyBuddy';
import ApplicationConcierge from '../components/profile/ApplicationConcierge';
import ApplicationHub from '../components/profile/ApplicationHub';

const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('applications-hub');

  // Handle tab query parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      // Legacy ?tab=account (removed from MVP) maps to Applications Hub
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync ?tab= to active section
      setActiveSection(tabParam === 'account' ? 'applications-hub' : tabParam);
    }
  }, [searchParams]);


  const renderActiveSection = () => {
    switch (activeSection) {
      case 'applications-hub':
        return <ApplicationHub />;
      case 'my-applications':
        return <MyApplications />;
      case 'quiz-results':
        return <QuizSummary />;
      case 'cost-calculator':
        return <CostCalculator />;
      case 'study-buddy':
        return <StudyBuddy />;
      case 'concierge':
        return <ApplicationConcierge />;
      default:
        return <ApplicationHub />;
    }
  };

  const renderActiveSectionTitle = () => {
    switch (activeSection) {
      case 'applications-hub':
        return "Applications Hub";
      case 'my-applications':
        return "My Applications";
      case 'quiz-results':
        return "Quiz Results";
      case 'cost-calculator':
        return "Cost Calculator";
      case 'study-buddy':
        return "Study Buddy";
      case 'concierge':
        return "Application Concierge";
      default:
        return "Applications Hub";
    }
  };

  const renderActiveSectionHero = () => {
    switch (activeSection) {
      case 'my-applications':
        return "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-1147779453%20(1).jpg";
      case 'quiz-results':
        return "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-1147779453%20(1).jpg";
      case 'cost-calculator':
        return "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-1147779453%20(1).jpg";
      case 'study-buddy':
        return "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-1147779453%20(1).jpg";
      case 'concierge':
        return "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-1147779453%20(1).jpg";
      default:
        return "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-1147779453%20(1).jpg";
    }
  };

  return (
    <div className="profile-page">
      <h2 className='profile-page-title'>{renderActiveSectionTitle()}</h2>
      <div className='profile-hero'>
        <img src={'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/balloons-header-cropped.jpg'} alt="profil-hero" />
      </div>
      <div className="profile-container">
        <ProfileSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div className="profile-content">
          <div className="profile-content-inner">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
