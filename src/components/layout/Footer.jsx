import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAnchorLinkHandler } from '../../utils/scrollUtils';
import { FaFacebook, FaInstagram, FaTiktok, FaLinkedin, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  // Get auth state from Redux
  const { isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();

  // Custom handler for anchor links
  const handleAnchorClick = (e, id, targetId) => {
    // Only prevent default if we're already on the home page
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);

      if (element) {
        // Smooth scroll to element
        element.scrollIntoView({ behavior: 'smooth' });
        // Update URL without page reload
        window.history.pushState(null, '', id);
      }
    }
    // If we're not on the home page, let the default navigation happen
  };

  // Render profile button based on login state
  const renderProfileButton = () => {
    if (isAuthenticated) {
      return <Link to="/profile" className="btn btn-primary">MY PROFILE</Link>;
    } else {
      return <Link to="/login" className="btn btn-primary">SIGN UP / LOGIN</Link>;
    }
  };

  return (
    <footer className="app-footer" id="contact-section">
      <div className="container">
        {/* Contact Section */}
        {/* <div className="contact-section">
          <div className="contact-left">
            <h2>WE ARE HERE FOR YOU111</h2>
          </div>
          <div className="contact-right">
            <p className="p-large">Welcome. Sign up for a quiz, create a profile, or book a call.</p>
            <div className="contact-methods">
              <a href="mailto:contact@campusisrael.com">
                <span>Inquire</span>
                <img src="https://res.cloudinary.com/dollaguij/image/upload/v1771106264/dcce50d29e8c5dae234bbab262d0aaab164a9192_p55lns.png" alt="" />
              </a>
              <a href="tel:+972544444444">
                <span>Call</span>
                <img src="https://res.cloudinary.com/dollaguij/image/upload/v1771106264/88b92f3fd0bb07096d2a69732a6cc6c6960fdfb2_jlucno.png" alt="" />
              </a>
              <a href="">
                <span>Chat</span>
                <div className='multi-img'>
                  <img src="https://res.cloudinary.com/dollaguij/image/upload/v1771122418/2fa5f137cf39302c26bf72c53dfee6efceabe822_aroebb.png" alt="" />
                  <img src="https://res.cloudinary.com/dollaguij/image/upload/v1771122418/837f10f92dd914af39fe55b8438adbcf4dd6b40c_qgyfi3.png" alt="" />
                  <img src="https://res.cloudinary.com/dollaguij/image/upload/v1771106263/d47a7d0fb405a07cc7b6cd0e1d342a7c5d81fa5d_fqfozs.png" alt="" />
                </div>
              </a>
              
            </div>
          </div>
        </div> */}

        {/* Footer Navigation */}
        <div className="footer-navigation">
          <div className="footer-nav-group">
            <h3>Campus Israel</h3>
            <ul>
              <li><Link to="https://www.campusisrael.com/about">ABOUT US</Link></li>
              <li><Link to="https://www.campusisrael.com/contact">WHAT TO KNOW</Link></li>
              <li><Link to="/about">THE TEAM</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h3>Campus Israel Toolkit</h3>
            <ul>
              <li><Link to={isAuthenticated ? "/profile?tab=quiz-results" : "/login?redirect=/profile?tab=quiz-results"}>PathFinder</Link></li>
              <li><Link to={isAuthenticated ? "/profile?tab=cost-calculator" : "/login?redirect=/profile?tab=cost-calculator"}>CostCompare</Link></li>
              <li><Link to={isAuthenticated ? "/profile?tab=study-buddy" : "/login?redirect=/profile?tab=study-buddy"}>PeerConnect</Link></li>
              <li><Link to={isAuthenticated ? "/profile?tab=concierge" : "/login?redirect=/profile?tab=concierge"}>Concierge</Link></li>
              <li><Link to="/apply/intro">Degree Search</Link></li>
            </ul>
          </div>

          <div className="footer-nav-group">
            <h3>Join Us</h3>
            <ul>
              <li><Link to="/">Become An Ambassador</Link></li>
              <li><Link to="/">Volunteer</Link></li>
              <li><Link to="/">Partner With Us</Link></li>
              <li><Link to="/">Support Us</Link></li>
            </ul>
          </div>
          {/* <button className='btn btn-primary'>Join Us</button> */}

          <div className="footer-nav-group">
            <h3>Share And Follow Us</h3>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook className="social-icon" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="social-icon" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FaTiktok className="social-icon" />
              </a>
              {/* <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin className="social-icon" />
              </a> */}
            </div>
          </div>
        </div>

        {/* Legal Notes */}
        <div className="legal-notes">
          <p>
            Campus Israel is not a university or academic institution. We are a platform that connects
            international students with Israeli universities and academic programs.
          </p>
          <p>&copy; {new Date().getFullYear()} Campus Israel. All rights reserved.</p>
          <div className="legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
