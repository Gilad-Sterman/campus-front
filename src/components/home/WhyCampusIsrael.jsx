import React from 'react';
import { Link } from 'react-router-dom';
// Import icons directly
import { FaLightbulb, FaFileAlt, FaChartBar, FaComments } from 'react-icons/fa';

const FeatureTile = ({ title, description, iconComponent, iconImg, buttonText, linkTo, isGated, disabled, isLoggedIn, onGatedClick }) => {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (isGated && !isLoggedIn) {
      e.preventDefault();
      onGatedClick();
    }
  };

  return (
    <div className="feature-tile">
      <div className="feature-icon">
        <img src={iconImg} alt="" />
      </div>
      {/* <h3>{title}</h3> */}
      <p>{description}</p>
      <Link
        to={linkTo}
        className={`btn btn-pill ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
      >
        {title}
      </Link>
    </div>
  );
};

const WhyCampusIsrael = ({ isLoggedIn, hasTakenQuiz, hasChurnedQuiz, onGatedFeatureClick }) => {
  // Function to determine Let's Match button behavior based on quiz state
  const getMatchButtonConfig = () => {
    if (hasTakenQuiz) {
      const resultsLink = isLoggedIn ? '/profile?tab=quiz-results' : '/quiz';
      return {
        buttonText: "View Results",
        linkTo: resultsLink
      };
    } else if (hasChurnedQuiz) {
      return {
        buttonText: "Continue Quiz",
        linkTo: "/quiz"
      };
    } else {
      return {
        buttonText: "Let's Match",
        linkTo: "/quiz"
      };
    }
  };

  const matchButtonConfig = getMatchButtonConfig();

  // Features data
  const features = [
    {
      title: "PathFinder",
      description: "Discover degrees for your goals, interests, personality & preferences. No sign up required",
      iconComponent: <FaLightbulb size={48} className="icon-svg" />,
      iconImg: "/noun-research.svg",
      buttonText: matchButtonConfig.buttonText,
      linkTo: matchButtonConfig.linkTo,
      isGated: false
    },
    {
      title: "PeerConnect",
      description: "Meet students from your hometown or possible Israel destination",
      iconComponent: <FaFileAlt size={48} className="icon-svg" />,
      iconImg: "/noun-friends.svg",
      buttonText: "Let's Connect",
      linkTo: isLoggedIn ? "/profile?tab=study-buddy" : "/login?redirect=/profile?tab=study-buddy",
      isGated: false
    },
    {
      title: "CostCompare",
      description: "Calculate & compare tuition & living costs for your top US and Israel options",
      iconComponent: <FaChartBar size={48} className="icon-svg" />,
      iconImg: "/noun-calculator.svg",
      buttonText: "Let's Calculate",
      linkTo: isLoggedIn ? "/profile?tab=cost-calculator" : "/login?redirect=/profile?tab=cost-calculator",
      isGated: false
    },
    {
      title: "Concierge",
      description: "Real human guidance. We are waiting to hear from you. And yes, we answer the phone!",
      iconComponent: <FaComments size={48} className="icon-svg" />,
      iconImg: "/noun-magical.svg",
      buttonText: 'Talk to us',
      linkTo: isLoggedIn ? "/profile?tab=concierge" : "/login?redirect=/profile?tab=concierge",
      isGated: false
    }
  ];

  return (
    <section className="why-campus-section" id="why-campus">
      <div className="container">
        <h2 className="section-header">YOUR CAMPUS ISRAEL TOOLKIT</h2>
        {/* <h2 className="section-header">WHY CAMPUS ISRAEL</h2> */}
        {/* <p>Campus Israel is your personalized guide to studying in a dynamic, innovative academic environment. We help you discover programs, understand costs, explore English-taught degrees at top Israeli universities, and learn from student experiences to make an informed decision. Start your journey with us.</p> */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureTile
              key={index}
              title={feature.title}
              description={feature.description}
              iconComponent={feature.iconComponent}
              iconImg={feature.iconImg}
              buttonText={feature.buttonText}
              linkTo={feature.linkTo}
              isGated={feature.isGated}
              disabled={feature.disabled}
              isLoggedIn={isLoggedIn}
              onGatedClick={onGatedFeatureClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCampusIsrael;
