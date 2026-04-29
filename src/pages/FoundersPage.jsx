import React from 'react';

const FoundersPage = () => {
  // Placeholder images
  const founderPlaceholder = "https://via.placeholder.com/180";

  const founders = [
    {
      name: "Fleur Hassan-Nahoum",
      role: "Co-Founder | Chief Executive Officer",
      bio: [
        "Campus Israel began with a question Fleur couldn’t shake: why is the Startup Nation with its world class universities, Nobel prizes and ground breaking innovation not also one of the global centers of international academic studies?",
        "Fleur is the Special Envoy for Trade and Innovation for the Israeli Ministry of Foreign Affairs, a former deputy Mayor of Jerusalem and the Co-Founder of the UAE Israel Business Council.",
        "When she began to work in the Gulf and understood that most students in that region go abroad for university, she asked herself why is Israel not the natural destination for learning about innovation.",
        "This was the genesis of the idea: to make international degree study in Israel accessible attractive and life changing for the student."
      ],
      image: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/b5b2455ac00f89e2818617d38a7bcd07ef9f0af7.png"
    },
    {
      name: "Lisa Barkan",
      role: "Co-Founder | Chief Experience and Marketing Officer",
      bio: [
        "Lisa’s connection to this mission runs deeper than it might appear. Her first job out of college in the mid-1980s was running a national campaign in the US to increase the number of Jewish students studying their junior year abroad in Israel.",
        "Over two years, her team led a 200-campus marketing and recruitment campaign that tripled the number of participants.",
        "Decades later, after building Jerusalem Village, a community model that spent a decade connecting young people to each other, to shared experiences, shared tables, and shared belonging, she found herself back at the same question: how do we get the right young people to Israel?",
        "And once they are here, how do we mold them into the continued pioneering of building an Israel that belongs to all of the Jewish people?",
        "After October 7th, over coffee with Fleur, the conversation turned to what was missing and what needed to be built. Campus Israel was born that day."
      ],
      image: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/68a436a499ba387e1338fbd1fb5bf9b10e2e9b73.png"
    }
  ];

  return (
    <div className="founders-page">
      <section className="founders-hero">
        <div className="hero-image-wrapper">
          <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/ancient-site-header-cropped.jpg" alt="Founders Hero" className="hero-full-img" />
        </div>
        <h1>HOW WE STARTED</h1>
      </section>

      <div className="page-content-wrapper">
        {/* <div className="featured-quote">
          <blockquote>
            "If there is no room at the table, build your own."
          </blockquote>
          <cite>Bret Stephens, February 1, 2026</cite>
        </div> */}

        <p className='text'>
          As the founders of Campus Israel, we care deeply about our people and take responsibility for future generations. We watched college campuses increasingly let down Jewish students and felt compelled to act. And then October 7th made it urgent.
        </p>
        <p className='text'>
          We weren’t looking for the next bold Jewish idea, but it came to us from the need. It seemed so obvious: colleges are losing the culture of critical thinking and healthy debate, leading to hostility toward Jews. At the same time, and in sharp contrast, world-class Israeli universities are producing the leaders and innovators of the future.
        </p>
        <p className='text'>
          We couldn’t believe it didn’t exist already. So we set out to build that bridge.
        </p>
        <p className='text'>
          We’re glad you’re here. The timing couldn’t be better.
        </p>

        <section className="founders-grid">
          <div className="container">
            <h2>The Founders</h2>
            <p className='sub-headline'>Two founders. One question that wouldn't go away. And a moment that made it urgent.</p>

            {founders.map((founder, index) => (
              <div key={index} className="founder-card">
                <div className="founder-header">
                  <h2>{founder.name}</h2>
                  <p className="founder-role">{founder.role}</p>
                </div>
                <div className="founder-content">
                  <div className="founder-image">
                    <img src={founder.image} alt={founder.name} />
                  </div>
                  <div className="founder-bio">
                    {founder.bio.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="vision-section">
          <div className="container">
            <h2>WHERE THIS IS GOING</h2>
            <div className="vision-content">
              <p>
                Picture 2035. A young professional walks into a room that matters: a boardroom,
                a government office, a newsroom. She’s confident, grounded, and her deep
                connection to Israel shapes the way she shows up, the way she problem solves
                and the way she does not take no for an answer. Across the world, thousands
                more just like her are doing the same.
              </p>
              <p>
                But it’s not just Israel that they know. Their college years were rich in
                skills development, enabling them to speak up, make an impact and lead.
              </p>
              <p>
                Nobody is asking why they studied in Israel. The answer is obvious.
              </p>
              <p>
                That’s the world we’re building. The student who starts that journey, the
                one who says yes to Israel when it still takes a little courage to do so,
                will arrive somewhere extraordinary: a new generation so well prepared and
                so well connected that they can move mountains.
              </p>
              <p>We’re here to make that yes easy.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FoundersPage;
