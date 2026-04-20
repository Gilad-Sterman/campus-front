import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaCalculator,
  FaComments,
  FaEnvelope,
  FaSearch,
  FaUserFriends,
  FaUserTie,
  FaWhatsapp
} from 'react-icons/fa';
import { fetchIsraeliUniversities } from '../store/actions/appActions';
import quizStorage from '../services/quizStorage';

const heroImageUrl = 'https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/hero_imgv4.jpg';
const universityLogoFallback = '/noun-research.svg';

const degreeHorizons = [
  {
    title: 'Future Builders',
    description: 'Understand, engineer, invent, and pioneer what comes next. STEM.',
    imageUrl: 'https://www.figma.com/api/mcp/asset/30702ffd-6f83-4363-81a8-958184d5d252',
    link: '/domains/future-builders'
  },
  {
    title: 'Human Insight',
    description: 'Discover people and their relationships; educate and drive social change.',
    imageUrl: 'https://www.figma.com/api/mcp/asset/c9046f6e-25a3-42f8-9782-8cdd07354f5e',
    link: '/domains/human-insight-impact'
  },
  {
    title: 'Policy, Influence',
    description: 'Shape systems, decisions, and the rules of the game.',
    imageUrl: 'https://www.figma.com/api/mcp/asset/afccd2e6-573b-42bc-b62e-a35315227c43',
    link: '/domains/power-policy-influence'
  },
  {
    title: 'Culture, Creativity',
    description: 'Uncover ideas, stories, and meanings shaping the world.',
    imageUrl: 'https://www.figma.com/api/mcp/asset/e0f3709f-d410-48e0-b3be-99c10eddc4e5',
    link: '/domains/culture-creativity'
  }
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, quizState } = useSelector((state) => state.auth);
  const { applications } = useSelector((state) => state.app);
  const [israeliUniversities, setIsraeliUniversities] = useState([]);

  const anonymousSession = !isAuthenticated ? quizStorage.getSession() : null;
  const anonymousStatus = anonymousSession?.status;
  const anonymousAnswerCount = Array.isArray(anonymousSession?.answers) ? anonymousSession.answers.length : 0;

  const userState = useMemo(
    () => ({
      isLoggedIn: isAuthenticated,
      hasTakenQuiz: isAuthenticated
        ? quizState?.data?.status === 'completed'
        : anonymousStatus === 'completed',
      hasChurnedQuiz: isAuthenticated
        ? quizState?.data?.status === 'in_progress'
        : anonymousStatus === 'in_progress' && anonymousAnswerCount > 0,
      hasApplied: applications.length > 0
    }),
    [isAuthenticated, quizState?.data?.status, anonymousStatus, anonymousAnswerCount, applications.length]
  );

  useEffect(() => {
    const loadIsraeliUniversities = async () => {
      try {
        const data = await dispatch(fetchIsraeliUniversities());
        const filtered = data.filter((uni) => !uni.isUS && uni.status === 'active');
        setIsraeliUniversities(filtered);
      } catch {
        setIsraeliUniversities([]);
      }
    };

    loadIsraeliUniversities();
  }, [dispatch]);

  const quizPrimaryLink = userState.hasTakenQuiz && userState.isLoggedIn ? '/quiz/results' : '/quiz';
  const conciergeLink = userState.isLoggedIn ? '/profile?tab=concierge' : '/login?redirect=/profile?tab=concierge';
  const backendOrigin = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : (typeof window !== 'undefined' ? window.location.origin : '');

  const resolveUniversityLogoUrl = (logoUrl) => {
    if (!logoUrl || typeof logoUrl !== 'string') {
      return universityLogoFallback;
    }

    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }

    if (!backendOrigin) {
      return universityLogoFallback;
    }

    return `${backendOrigin}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
  };

  const universityCards = useMemo(() => {
    if (israeliUniversities.length === 0) {
      return [
        { id: 'fallback-1', name: 'University Name One', logo_url: universityLogoFallback },
        { id: 'fallback-2', name: 'University Name Two', logo_url: universityLogoFallback },
        { id: 'fallback-3', name: 'University Name Three', logo_url: universityLogoFallback }
      ];
    }

    return israeliUniversities.slice(0, 3).map((uni) => ({
      id: uni.id,
      name: uni.name,
      logo_url: uni.logo_url
    }));
  }, [israeliUniversities]);

  const toolkitCards = [
    {
      title: 'Degree Quiz',
      description: 'Get suggestions based on your strengths and interests. No sign up required.',
      buttonLabel: 'PathFinder',
      link: quizPrimaryLink,
      icon: <FaSearch />
    },
    {
      title: 'Application Concierge',
      description: 'Real human guidance. We are waiting to hear from you.',
      buttonLabel: 'Concierge',
      link: conciergeLink,
      icon: <FaUserTie />
    },
    {
      title: 'Student Intros',
      description: 'Meet peers and students from your hometown or in your Israel destination.',
      buttonLabel: 'PeerConnect',
      link: userState.isLoggedIn ? '/profile?tab=study-buddy' : '/login?redirect=/profile?tab=study-buddy',
      icon: <FaUserFriends />
    },
    {
      title: 'Price Compare',
      description: 'Compare tuition costs at your top US and Israel options.',
      buttonLabel: 'CostCompare',
      link: userState.isLoggedIn ? '/profile?tab=cost-calculator' : '/login?redirect=/profile?tab=cost-calculator',
      icon: <FaCalculator />
    }
  ];

  return (
    <div className="home-redesign">
      <section className="home-redesign__hero">
        <img src={heroImageUrl} alt="Student learning materials" className="home-redesign__hero-image" />
        <div className="home-redesign__hero-overlay">
          <h1>WE&apos;RE HERE FOR YOU.</h1>
          <p>Everything you need to access world-class study in Israel. In English.</p>
          <div className="home-redesign__hero-actions">
            <Link to={quizPrimaryLink} className="home-redesign__action home-redesign__action--mint">
              Degree Ideas
            </Link>
            <Link to={conciergeLink} className="home-redesign__action home-redesign__action--blue">
              Let&apos;s Talk
            </Link>
          </div>
        </div>
      </section>

      <section className="home-redesign__toolkit" id="why-campus">
        <div className="container">
          <h2>Your Campus Israel Toolkit</h2>
          <div className="home-redesign__toolkit-grid">
            {toolkitCards.map((card) => (
              <article key={card.title} className="home-redesign__toolkit-card">
                <div className="home-redesign__toolkit-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <Link to={card.link} className="home-redesign__toolkit-link">
                  {card.buttonLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-redesign__degrees">
        <div className="container">
          <h2>Degrees and Career Horizons</h2>
          <div className="home-redesign__degrees-grid">
            {degreeHorizons.map((degree) => (
              <Link key={degree.title} to={degree.link} className="home-redesign__degree-item">
                <img src={degree.imageUrl} alt={degree.title} />
                <div>
                  <h3>{degree.title}</h3>
                  <p>{degree.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-redesign__universities">
        <div className="container">
          <h2>Explore Israeli Universities</h2>
          <div className="home-redesign__universities-grid">
            {universityCards.map((uni) => (
              <Link
                key={uni.id}
                to={typeof uni.id === 'string' && uni.id.startsWith('fallback-') ? '/universities' : `/universities/${uni.id}`}
                className="home-redesign__university-card"
              >
                <div className="home-redesign__university-logo-box">
                  <img
                    src={resolveUniversityLogoUrl(uni.logo_url)}
                    alt={`${uni.name} logo`}
                    onError={(event) => {
                      if (event.currentTarget.src.endsWith(universityLogoFallback)) {
                        return;
                      }
                      event.currentTarget.src = universityLogoFallback;
                    }}
                  />
                </div>
                <h3>{uni.name}</h3>
              </Link>
            ))}
          </div>
          <div className="home-redesign__dots" aria-hidden="true">
            <span />
            <span />
            <span className="is-active" />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="home-redesign__fit-cta">
        <div className="container">
          <h2>Want to see how you fit?</h2>
          <Link to={quizPrimaryLink} className="home-redesign__fit-button">
            Start Free Quiz
          </Link>
        </div>
      </section>

      <section className="home-redesign__support">
        <div className="container">
          <h2>We&apos;re here for you</h2>
          <p>Welcome. Sign up for a quiz, create a profile, or book a call.</p>
          <div className="home-redesign__support-actions">
            <a href="mailto:contact@campusisrael.com">
              <span>Inquire</span>
              <FaEnvelope />
            </a>
            <Link to={conciergeLink}>
              <span>Meet</span>
              <FaComments />
            </Link>
            <a href="https://wa.me/972544444444" target="_blank" rel="noreferrer">
              <span>Chat</span>
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
