import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

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
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Handle tab query parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveSection(tabParam);
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
        return "https://res.cloudinary.com/dollaguij/image/upload/v1770767937/3368d3e5984dfa1bbf7945351aabf3be6810d930_z8a6ou.png";
      case 'quiz-results':
        return "https://res.cloudinary.com/dollaguij/image/upload/v1770767937/3368d3e5984dfa1bbf7945351aabf3be6810d930_z8a6ou.png";
      case 'cost-calculator':
        return "https://res.cloudinary.com/dollaguij/image/upload/v1770767937/3368d3e5984dfa1bbf7945351aabf3be6810d930_z8a6ou.png";
      case 'study-buddy':
        return "https://res.cloudinary.com/dollaguij/image/upload/v1770767937/3368d3e5984dfa1bbf7945351aabf3be6810d930_z8a6ou.png";
      case 'concierge':
        return "https://res.cloudinary.com/dollaguij/image/upload/v1770767937/3368d3e5984dfa1bbf7945351aabf3be6810d930_z8a6ou.png";
      default:
        return "https://res.cloudinary.com/dollaguij/image/upload/v1770767937/3368d3e5984dfa1bbf7945351aabf3be6810d930_z8a6ou.png";
    }
  };

  return (
    <div className="profile-page">
      <h2>{renderActiveSectionTitle()}</h2>
      <div className='profile-hero'>
        <img src={renderActiveSectionHero()} alt="profil-hero" />
      </div>
      <div className="profile-container">
        <ProfileSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
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
