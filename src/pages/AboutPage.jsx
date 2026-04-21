import React from 'react';

const AboutPage = () => {
  // Placeholder images - consistent with Supabase storage patterns
  const iconPlaceholder = "https://via.placeholder.com/60";

  const stats = [
    "29% of recent grads say college isn't worth the cost",
    "Only 55.2% of recent grads deemed proficient in critical thinking",
    "52% of grads are underemployed one year after college",
    "83% of Jewish students experienced or witnessed antisemitism since Oct 7th"
  ];

  const pillars = [
    {
      title: "Digital Platform",
      description: "Built in partnership with universities and not aggregated from third party sources.",
      icon: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/mingcute_lightning-line.svg"
    },
    {
      title: "Toolkit for Informed Decision Making",
      description: "Use our PathFinder for degree discovery, CostCompare for understanding savings, and PeerConnect for meeting fellow students.",
      icon: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Vector%20(4).svg"
    },
    {
      title: "Human Concierge",
      description: "A real person from the first question and application and to arrival on campus and beyond.",
      icon: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/mingcute_user-star-line.svg"
    },
    {
      title: "Career and Life Launchpad",
      description: "Internships, peer network, critical thinking.",
      icon: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/mingcute_rocket-line.svg"
    }
  ];

  const evidenceFacts = [
    "3 universities in global top 100 world ranking",
    "Innovation economy: $15.6B tech investments in 2025",
    "14 Nobel prizes. 10 million people",
    "Top 10 globally for producing entrepreneurs",
    "82% of young Israelis are willing to sacrifice personal plans post Oct 7th"
  ];

  const sources = [
    "Source information for statistic 1",
    "Source information for statistic 2",
    "Source information for statistic 3"
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="hero-image-wrapper">
          <img src="https://www.figma.com/api/mcp/asset/30702ffd-6f83-4363-81a8-958184d5d252" alt="About Hero" className="hero-full-img" />
        </div>
        <h1>WHAT HAPPENED TO COLLEGE?</h1>
      </section>

      <div className="page-content-wrapper">
        <p className="sub-headline">
          Higher education is in crisis and Jewish students are paying the price.
        </p>
        <p className="text">
          Driven students are no longer accepting compromised academia.
          They are seeking creative alternatives.
        </p>

        <section className="stats-grid">
          <div className="container">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-bullet"></div>
                <p>{stat}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="value-prop-section">
          <div className="container">
            <h2>WE MAKE IT EASY TO SAY YES TO ISRAEL.</h2>
            <p className="sub-headline">
              Campus Israel champions degree study in English at Israel's world-class universities.
            </p>
            <p className="text">
              Access. Which we are turning into an opportunity.
            </p>
            <p className="text">
              We saw it clearly: a significant life period living in Israel can become a new, powerful formation tool, the way Birthright Israel transformed the introduction-to-Israel market for a generation.
            </p>
            <p className="text">
              To make this opportunity impactful, scalable, and measurable, we built a model centered on what students need to succeed in their careers and lives: ensuring their degree has real relevance in today’s world.
            </p>
            <div className="model-grid">
              {pillars.map((pillar, index) => (
                <div key={index} className="model-pillar">
                  <div className='pillar-top'>
                    <div className="pillar-icon">
                      <img src={pillar.icon} alt={pillar.title} />
                    </div>
                    <p>{pillar.title}</p>
                  </div>
                  <div className="pillar-info">
                    <p>{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text">
              And student life like no other, explaining why Israel ranks #2 globally for young adult happiness.10
            </p>
          </div>
        </section>

        <section className="evidence-section">
          <div className="container">
            <h2>ISRAELI UNIVERSITIES. THE EVIDENCE SPEAKS.</h2>
            <p className="sub-headline">
              Israel's leading universities are world-class, proven.
            </p>
            <p className="text">
              Their international schools offer over 170 Bachelors and Masters degrees in English, making studying in Israel not only available, but inviting.
            </p>
            <ul className="evidence-list">
              {evidenceFacts.map((fact, index) => (
                <li key={index}>
                  <div className="stat-bullet"></div>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="belief-section">
          <div className="container">
            <h2>A college experience worth believing in.</h2>
            <p className="sub-headline">Today's college challenges were never just a crisis. They were the opportunity.</p>
            <p className="text">
              Every Campus Israel graduate enters the world anchored in Israel intellectually,
              professionally, and personally. Within 10 years Campus Israel will build a
              20,000-strong alumni network across countries, industries, and civil society,
              united by shared values and mutual support.
            </p>
          </div>
        </section>

      </div>
      <section className="sources-section">
        <div className="container">
          <h4>SOURCES</h4>
          <ol className="sources-list">
            {sources.map((source, index) => (
              <li key={index}>{source}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
