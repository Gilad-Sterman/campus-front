import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

// Import home page components
import HeroSection from '../components/home/HeroSection';
import CategoryCarousel from '../components/home/CategoryCarousel';
import UniversitiesCarousel from '../components/home/UniversitiesCarousel';
import IsraelCarousel from '../components/home/IsraelCarousel';
import WhyCampusIsrael from '../components/home/WhyCampusIsrael';
import QuizCTA from '../components/home/QuizCTA';
import quizStorage from '../services/quizStorage';

const HomePage = () => {
  // Get auth state from Redux
  const { isAuthenticated, quizState } = useSelector(state => state.auth);

  // Get applications from Redux
  const { applications } = useSelector(state => state.app);

  const anonymousSession = !isAuthenticated ? quizStorage.getSession() : null;
  const anonymousStatus = anonymousSession?.status;
  const anonymousAnswerCount = Array.isArray(anonymousSession?.answers) ? anonymousSession.answers.length : 0;

  // Determine user state for UI display - memoized to prevent unnecessary re-renders
  const userState = useMemo(() => ({
    isLoggedIn: isAuthenticated,
    hasTakenQuiz: isAuthenticated
      ? quizState?.data?.status === 'completed'
      : anonymousStatus === 'completed',
    hasChurnedQuiz: isAuthenticated
      ? quizState?.data?.status === 'in_progress' // For authenticated users, check server progress
      : anonymousStatus === 'in_progress' && anonymousAnswerCount > 0,
    hasApplied: applications.length > 0
  }), [isAuthenticated, quizState?.data?.status, anonymousStatus, anonymousAnswerCount, applications.length]);

  // Domain categories for the carousel - mapped to the 5 domain pages
  const degreeCategories = useMemo(() => [
    {
      imageUrl: "/future-builders.jpg",
      imageAlt: "Future builders working with technology and innovation",
      title: "Future Builders",
      description: "Design, engineer, heal, and invent what comes next.",
      link: "/domains/future-builders"
    },
    {
      imageUrl: "/human-insights.jpg",
      imageAlt: "Students engaged in human insight and social impact work",
      title: "Human Insight",
      description: "People, behavior, relationships, and social change.",
      link: "/domains/human-insight-impact"
    },
    {
      imageUrl: "/power-influence.jpg",
      imageAlt: "Students in policy and leadership roles",
      title: "Policy, Influence",
      description: "Shape systems, decisions, and the rules of the game.",
      link: "/domains/power-policy-influence"
    },
    {
      imageUrl: "/culture-creativity.jpg",
      imageAlt: "Creative arts and cultural expression",
      title: "Culture, Creativity",
      description: "Ideas, stories, and meaning that shape the world.",
      link: "/domains/culture-creativity"
    },
    // {
    //   imageUrl: "https://res.cloudinary.com/dollaguij/image/upload/v1771198953/f741147d46d20dfa1ce66b741b5c2aae50162865_pnsyel.png",
    //   imageAlt: "Explorative paths",
    //   title: "Explorative paths",
    //   description: "For students who refuse to fit into one box.",
    //   link: "/domains/explorative-paths"
    // }
  ], []);

  // Handle click on gated features
  const handleGatedFeatureClick = () => {
    // In a real app, this would open a login/signup modal
    alert("Please sign up or log in to access this feature.");
  };

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        isLoggedIn={userState.isLoggedIn}
        hasTakenQuiz={userState.hasTakenQuiz}
        hasChurnedQuiz={userState.hasChurnedQuiz}
      />

      {/* Category Highlights */}
      <CategoryCarousel
        title="FOR TOMORROW'S MOST CRITICAL CAREERS"
        categories={degreeCategories}
        tilesPerView={4}
        autoplayInterval={6000} // 6 seconds
      />

      {/* Universities Carousel */}
      <UniversitiesCarousel
        autoplayInterval={5000} // 5 seconds
      />

      {/* Why Study in Israel */}
      {/* <IsraelCarousel
        autoplayInterval={8000} // 8 seconds
      /> */}

      {/* Why Campus Israel */}
      <WhyCampusIsrael
        isLoggedIn={userState.isLoggedIn}
        hasTakenQuiz={userState.hasTakenQuiz}
        hasChurnedQuiz={userState.hasChurnedQuiz}
        onGatedFeatureClick={handleGatedFeatureClick}
      />

      {/* Quiz CTA */}
      <QuizCTA
        isLoggedIn={userState.isLoggedIn}
        hasTakenQuiz={userState.hasTakenQuiz}
        hasChurnedQuiz={userState.hasChurnedQuiz}
      />
    </>
  );
};

export default HomePage;
