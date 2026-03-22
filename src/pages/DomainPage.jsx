import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSearch, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import searchApi from '../services/searchApi';

const DomainPage = () => {
  const { domainName } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  const [domainInfo, setDomainInfo] = useState(null);
  const [allPrograms, setAllPrograms] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState(new Set());
  const [programDescriptions, setProgramDescriptions] = useState({});
  const dropdownRef = useRef(null);

  // Domain configurations
  const domainConfigs = {
    'future-builders': {
      name: 'Future Builders',
      title: 'Future Builders',
      subTitle: 'Design, engineer, heal, and invent what comes next',
      description: 'Explore fields such as engineering, computer science, artificial intelligence, biotechnology, physics, and life and environmental sciences.',
      paragraphs: [
        { type: 'reg', text: 'Explore fields such as engineering, computer science, artificial intelligence, biotechnology, physics, and life and environmental sciences.' },
        { type: 'reg', text: 'Through studies, hands on research, lab work, and more, you’ll develop the analytical and technical skills needed to design solutions to global challenges and help drive the next generation of scientific and technological innovation.' },
        { type: 'strong', text: 'If you love discovering, solving puzzles, or imagining how things could work, Future Builders might be right for you.' }
      ],
      img_url: '/future-builders.jpg'
    },
    'human-insight-impact': {
      name: 'Human Insight & Impact',
      title: 'Human Insight',
      subTitle: 'People, behavior, relationships, and social change.',
      description: 'Understand human behavior, create positive change, and make a meaningful impact on society.',
      paragraphs: [
        { type: 'reg', text: 'Dive into education, non-profits, social work, and therapy focused fields. Understand how your unique self can help others grow and succeed.' },
        { type: 'reg', text: 'Through hands on experiences and real-world engagement, you’ll discover how to lift others up, connect deeply, and create positive change that truly matters.' },
        { type: 'strong', text: 'If making a real difference, mentorship, or building stronger communities moves you, Human Insight & Impact could be your path.' }
      ],
      img_url: '/human-insights.jpg'
    },
    'power-policy-influence': {
      name: 'Power, Policy & Influence',
      title: 'Policy, Influence',
      subTitle: 'Students in policy and leadership roles',
      description: 'Lead change through governance, policy-making, and strategic influence in society.',
      paragraphs: [
        { type: 'reg', text: 'Discover the worlds of political science, international relations, business, economics, public policy, and law.' },
        { type: 'reg', text: 'By examining how institutions, markets, and governments operate, you’ll gain the tools to understand complex global systems, develop strategic thinking, and prepare to lead and influence meaningful change.' },
        { type: 'strong', text: 'If understanding systems, debating big ideas, or shaping the future excites you, Power, Policy & Influence could be your path.' }
      ],
      img_url: '/power-influence.jpg'
    },
    'culture-creativity': {
      name: 'Culture & Creativity',
      title: 'Culture, Creativity',
      subTitle: 'Ideas, stories, meaning that shape individuals and the world',
      description: 'Express yourself through arts, media, and cultural innovation. Create and inspire.',
      paragraphs: [
        { type: 'reg', text: 'Engage with disciplines such as literature, history, media studies, film, the arts, and cultural studies. By exploring the stories, ideas, and creative traditions that shape societies, you’ll strengthen your critical thinking, communication, and storytelling abilities while gaining a deeper understanding of the human experience.' },
        { type: 'strong', text: 'If storytelling, exploring ideas, or expressing yourself creatively sparks you, Culture, Story, Creativity could be your place.' }
      ],
      img_url: '/culture-creativity.jpg'
    },
    'explorative-paths': {
      name: 'Explorative Paths',
      title: 'Explorative Paths',
      subTitle: 'For students who refuse to fit into one box',
      description: 'Discover new frontiers and interdisciplinary approaches to knowledge and innovation.',
      img_url: ''
    }
  };

  useEffect(() => {
    const config = domainConfigs[domainName];
    if (config) {
      setDomainInfo(config);
    } else {
      navigate('/404');
    }
  }, [domainName, navigate]);

  // Load all programs for the domain on mount
  useEffect(() => {
    if (domainInfo) {
      loadAllPrograms();
    }
  }, [domainInfo]);

  const loadAllPrograms = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await searchApi.searchProgramsByDomain(domainInfo.name, '', { limit: 50 });
      const groupedResults = groupResultsHierarchically(response.data.raw_results);

      setAllPrograms({
        ...response.data,
        grouped_results: groupedResults
      });
    } catch (err) {
      setError('Failed to load programs. Please try again.');
      console.error('Load programs error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group search results hierarchically: Discipline -> Degree -> Qualification
  const groupResultsHierarchically = (programs) => {
    const grouped = {};

    programs.forEach(program => {
      const discipline = program.discipline || 'Other';
      const degreeTitle = program.degree_title || program.name;
      const qualification = program.degree_qualification || program.degree_level;

      if (!grouped[discipline]) {
        grouped[discipline] = {};
      }

      if (!grouped[discipline][degreeTitle]) {
        grouped[discipline][degreeTitle] = {};
      }

      if (!grouped[discipline][degreeTitle][qualification]) {
        grouped[discipline][degreeTitle][qualification] = [];
      }

      grouped[discipline][degreeTitle][qualification].push(program);
    });

    return grouped;
  };


  // Handle program selection from hierarchical dropdown
  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setShowDropdown(false);
  };

  // Handle clearing program selection
  const handleClearSelection = () => {
    setSelectedProgram(null);
    setShowDropdown(false);
  };

  // Handle Apply Now
  const handleApplyNow = () => {
    if (!selectedProgram) return;
    navigate(`/apply?program=${selectedProgram.id}&source=domain`);
  };

  // Handle More Information - Open program details page in new tab
  const handleMoreInfo = () => {
    if (!selectedProgram) return;

    // Open program details page in new tab
    const programDetailsUrl = `/program/${selectedProgram.id}`;
    window.open(programDetailsUrl, '_blank');
  };

  if (!domainInfo) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="domain-page">
      {/* Hero Section */}
      <div className="domain-hero">
        <h1 className="domain-hero-title">{domainInfo.title}</h1>
        <div className="domain-hero-image">
          <img src={domainInfo.img_url} alt={domainInfo.title} />
        </div>
        <h2>{domainInfo.subTitle}</h2>
        {domainInfo.paragraphs.map((p, i) => (
          p.type === 'reg' ? (
            <p key={i} className="domain-hero-subtitle">{p.text}</p>
          ) : (
            <p key={i} className="domain-hero-subtitle"><strong>{p.text}</strong></p>
          )
        ))}
      </div>

      <div className="domain-container">
        {/* Domain Programs Dropdown */}
        <div className="domain-search-section">

          <div className="domain-search-container">
            <h2 className="domain-section-title">
              Select a Degree:
            </h2>
            <div className="apply-intro__search-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className="apply-intro__search-input"
                onClick={() => allPrograms && setShowDropdown(!showDropdown)}
                disabled={!allPrograms || loading}
              >
                {selectedProgram
                  ? `${selectedProgram.name} - ${selectedProgram.university.name}`
                  : `Browse ${domainInfo.title} Programs`
                }
              </button>
              {allPrograms && (
                <FaChevronDown
                  className={`apply-intro__dropdown-icon ${showDropdown ? 'apply-intro__dropdown-icon--open' : ''}`}
                  onClick={() => setShowDropdown(!showDropdown)}
                />
              )}
            </div>

            {error && (
              <div className="apply-intro__error">
                {error}
              </div>
            )}

            {loading && (
              <div className="apply-intro__loading">
                Loading programs...
              </div>
            )}

          </div>
          {/* Hierarchical Grouped Results Dropdown */}
          {allPrograms && allPrograms.grouped_results && showDropdown && (
            <div className="domain-search-dropdown">
              <div className="apply-intro__dropdown-header">
                Found {allPrograms.raw_results.length} programs in {domainInfo.title}
              </div>

              {Object.entries(allPrograms.grouped_results).map(([discipline, degrees]) => (
                <div key={discipline} className="domain-discipline-group">
                  <div className="domain-discipline-header">
                    <strong>{discipline}</strong>
                  </div>

                  {Object.entries(degrees).map(([degreeTitle, qualifications]) => (
                    <div key={degreeTitle} className="domain-degree-group">
                      {/* <div className="domain-degree-header">
                        {degreeTitle}
                      </div> */}

                      {Object.entries(qualifications).map(([qualification, programs]) => (
                        <div key={qualification} className="domain-qualification-group">
                          {/* <div className="domain-qualification-header">
                            {qualification}
                          </div> */}

                          {programs.map((program) => (
                            <div
                              key={program.id}
                              className={`apply-intro__dropdown-item ${selectedProgram?.id === program.id ? 'apply-intro__dropdown-item--selected' : ''
                                }`}
                              onClick={() => handleProgramSelect(program)}
                            >
                              <div className="apply-intro__dropdown-item-main">
                                <span className="apply-intro__dropdown-item-name">
                                  {program.name}
                                </span>
                                <span className="apply-intro__dropdown-item-qualification">
                                  {qualification}
                                </span>
                                {/* <span className="apply-intro__dropdown-item-qualification">
                                  {program.qualification}
                                </span> */}
                              </div>

                              {/* <div className="apply-intro__dropdown-item-discipline">
                                {program.discipline}
                              </div> */}
                              <span className="apply-intro__dropdown-item-university">
                                {program.university.name}
                              </span>

                              {program.career_horizon && (
                                <div className="apply-intro__dropdown-item-career">
                                  {program.career_horizon}
                                </div>
                              )}

                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Program Display */}
        {/* {selectedProgram && (
          <div className="domain-selected-program">
            <button
              className="clear-selection-btn"
              onClick={handleClearSelection}
              aria-label="Clear program selection"
            >
              ×
            </button>
            <div className="selected-program-header">
              {(selectedProgram.image_url || selectedProgram.university.logo_url) && (
                <div className="program-image">
                  <img
                    src={selectedProgram.image_url || selectedProgram.university.logo_url}
                    alt={selectedProgram.image_url ? `${selectedProgram.name} program` : `${selectedProgram.university.name} logo`}
                  />
                </div>
              )}
              <div className="selected-program-info">
                <h4>{selectedProgram.name}</h4>
                <p className="university-name">{selectedProgram.university.name}</p>
                <div className="program-badges">
                  <span className="degree-badge">{selectedProgram.degree_level}</span>
                  <span className="discipline-badge">{selectedProgram.discipline}</span>
                  {selectedProgram.degree_qualification && (
                    <span className="qualification-badge">{selectedProgram.degree_qualification}</span>
                  )}
                </div>
              </div>
            </div>

            {selectedProgram.career_horizon && (
              <div className="career-horizon">
                <strong>Career Path:</strong> {selectedProgram.career_horizon}
              </div>
            )}

            {selectedProgram.description && (
              <div className="program-description">
                <p>{selectedProgram.description}</p>
              </div>
            )}

            {selectedProgram.short_description && !selectedProgram.description && (
              <div className="program-description">
                <p>{selectedProgram.short_description}</p>
              </div>
            )}

            {(selectedProgram.duration_text || selectedProgram.tuition_usd) && (
              <div className="program-details">
                {selectedProgram.duration_text && (
                  <span><strong>Duration:</strong> {selectedProgram.duration_text}</span>
                )}
                {selectedProgram.tuition_usd && (
                  <span><strong>Tuition:</strong> ${selectedProgram.tuition_usd.toLocaleString()} USD/year</span>
                )}
              </div>
            )}
          </div>
        )} */}

        {/* Apply Button */}
        <div className="domain-page__actions">
          {/* <button
            className='btn-primary'
            disabled={!selectedProgram}
            onClick={handleApplyNow}
          >
            Let's Apply!
          </button> */}
          <button
            className="program-more-info-btn"
            onClick={handleMoreInfo}
            disabled={!selectedProgram}
          >
            More Information
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainPage;
