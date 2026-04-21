import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/actions/authActions';
import { isAdmin } from '../../utils/permissions';
import { FiUser } from 'react-icons/fi';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get current page name for mobile view
  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/universities') return 'Universities';
    if (path === '/programs') return 'Programs';
    if (path === '/quiz') return 'Quiz';
    if (path === '/about') return 'About';
    return path.substring(1).charAt(0).toUpperCase() + path.substring(2);
  };

  // Check if login button should be active (on /login without mode=signup)
  const isLoginActive = () => {
    return location.pathname === '/login' && searchParams.get('mode') !== 'signup';
  };

  // Check if signup button should be active (on /login with mode=signup)
  const isSignupActive = () => {
    return location.pathname === '/login' && searchParams.get('mode') === 'signup';
  };

  // Handle scroll event to collapse header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Handle logout with redirect
  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
      {/* <div className="container"> */}
      <div className="simplified-header">
        <div className="app-logo">
          <Link to="/">
            <img src="https://res.cloudinary.com/dollaguij/image/upload/v1770762748/be857fc71633521091ca7237f0bca1474b83a738_pututk.png" alt="logo" />
          </Link>
        </div>
        <div className="app-auth">
          {!isAuthenticated ? (
            <div className='auth-btns'>
              <Link
                to="/login"
                className={`auth-btn auth-btn--login ${isLoginActive() ? 'active' : ''}`}
                aria-label="Log in"
              >
                <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/mingcute_user-3-line.svg" alt="Log in" />
                <span>Log In</span>
              </Link>
              <Link
                to="/login?mode=signup"
                className={`auth-btn auth-btn--signup ${isSignupActive() ? 'active' : ''}`}
                aria-label="Sign up"
              >
                <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/mingcute_user-add-2-line.svg" alt="Sign up" />
                <span>Sign Up</span>
              </Link>
            </div>
          ) : (
            <div className="auth-dropdown">
              {isAdmin(user?.role) && (
                <Link to="/admin" className="btn btn-primary admin-btn" style={{ marginRight: '10px' }}>Admin Panel</Link>
              )}
              <NavLink to="/profile" className="profile-icon-link" title="My Profile"><FiUser size={22} /></NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-text"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
      {/* </div> */}
    </header>
  );
};

export default Header;
