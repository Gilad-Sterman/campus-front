import { FaInstagram, FaLinkedin, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const TeamPage = () => {
    const teamMembers = [
        {
            name: "Fleur Hassan-Nahoum",
            role: "CEO",
            description: "I lead Campus Israel's mission, partnerships, and fundraising, bringing decades of diplomatic experience and deep institutional relationships to the work of making Israel a destination for the next generation of Jewish students.",
            lastLine: "Opening doors that matter",
            links: [
                {
                    name: "LinkedIn",
                    url: "https://www.linkedin.com/"
                },
                {
                    name: "Instagram",
                    url: "https://www.instagram.com/"
                },
                {
                    name: "Twitter",
                    url: "https://www.twitter.com/"
                }
            ],
            image: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/b5b2455ac00f89e2818617d38a7bcd07ef9f0af7%20(1).png"
        },
        {
            name: "Lisa Barkan",
            role: "Chief Experience and Marketing Officer",
            description: "I shape how Campus Israel shows up in the world, channeling over fourty years of building Israel connections into the strategy, voice, and experience that move students from curiosity to commitment.",
            lastLine: "Designing the experience no one has built yet",
            links: [
                {
                    name: "LinkedIn",
                    url: "https://www.linkedin.com/"
                },
                {
                    name: "Instagram",
                    url: "https://www.instagram.com/"
                },
                {
                    name: "Twitter",
                    url: "https://www.twitter.com/"
                }
            ],
            image: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/68a436a499ba387e1338fbd1fb5bf9b10e2e9b73%20(1).png"
        },
        {
            name: "Kayla Kalkstein",
            role: "Director of Community and Education, Israel",
            description: "I build the programs and relationships that help students arrive in Israel and actually land, drawing on my own journey of making aliyah at 14 and a career spent guiding young people into Jewish life and learning.",
            lastLine: "Helping students arrive and actually belong",
            links: [
                {
                    name: "LinkedIn",
                    url: "https://www.linkedin.com/"
                },
                {
                    name: "Instagram",
                    url: "https://www.instagram.com/"
                },
                {
                    name: "Twitter",
                    url: "https://www.twitter.com/"
                }
            ],
            image: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/51b425450b1541269a4363a81130a241e0ff7224.png"
        },
        {
            name: "Sarri Singer",
            role: "Managing Director, U.S. Office",
            description: "I lead Campus Israel's U.S. recruitment, bringing together expertise in Jewish youth engagement and career guidance, and a firsthand understanding of how Israel can become the experience that defines a life.",
            lastLine: "Knows how to get a kid excited about Israel",
            links: [
                {
                    name: "LinkedIn",
                    url: "https://www.linkedin.com/"
                },
                {
                    name: "Instagram",
                    url: "https://www.instagram.com/"
                },
                {
                    name: "Twitter",
                    url: "https://www.twitter.com/"
                }
            ],
            image: "https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/531b615556f1819888645defccb0fd2c6f2005a9.png"
        },
    ];

    return (
        <div className="team-page">
            {/* <p className='about-page-title'>About</p> */}
            <section className="team-hero">
                <div className="hero-image-wrapper">
                    <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/edited-team-hero.jpg" alt="Team Hero" className="hero-full-img" />
                </div>
                <h1>TEAM</h1>
            </section>

            <div className="page-content-wrapper">
                <div className="container">
                    <section className="team-members">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="team-member-card">
                                <img src={member.image} alt={member.name} />
                                <div className='team-member-info'>
                                    <div className="top">
                                        <h6>{member.name}</h6>
                                        <p className='sub-role'>{member.role}</p>
                                    </div>
                                    <p className='links'>
                                        <a href="">
                                            <FaLinkedin className="link-icon" />
                                        </a>
                                        <a href="">
                                            <FaInstagram className="link-icon" />
                                        </a>
                                        <a href="">
                                            <span className="link-icon">𝕏</span>
                                        </a>
                                    </p>
                                    <p className='description'>{member.description}</p>
                                    <p className='last-line'>{member.lastLine}</p>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;