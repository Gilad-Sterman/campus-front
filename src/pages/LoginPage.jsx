import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login, register } from '../store/actions/authActions.js';
import { usStateOptions } from '../constants/usStateOptions.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Get auth state from Redux
  const { isAuthenticated, user, loading, error } = useSelector(state => state.auth);

  // Form state
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    country: '',
    dateOfBirth: '',
    zipCode: ''
  });

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect') || '/profile';

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsSignUp(mode === 'signup');
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // If user is admin, redirect to admin panel
      if (['admin', 'admin_edit', 'admin_view'].includes(user?.role)) {
        navigate('/admin');
        return;
      }
      // If user is concierge, redirect to concierge portal
      if (user?.role === 'concierge') {
        navigate('/concierge');
        return;
      }
      // Students go to redirect URL or home
      navigate(redirectUrl);
    }
  }, [isAuthenticated, user, navigate, redirectUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'zipCode') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        // Signup validation
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          alert('Please fill in all required fields');
          return;
        }
        if (!formData.country) {
          alert('Please select your state or location');
          return;
        }
        if (!formData.dateOfBirth) {
          alert('Please enter your date of birth');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          alert('Password must be at least 6 characters long');
          return;
        }

        try {
          await dispatch(register({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            country: formData.country,
            dateOfBirth: formData.dateOfBirth,
            zipCode: formData.zipCode?.trim() || undefined
          }));
          // Registration success - user will be redirected by useEffect
        } catch (err) {
          console.error('Registration error:', err);
          alert(err.message || 'Registration failed. Please try again.');
        }

        // Navigation will be handled by useEffect when isAuthenticated changes
      } else {
        // Login existing user
        await dispatch(login(formData.email, formData.password));
      }

      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      console.error('Authentication error:', error);
      // Error will be displayed via Redux state
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: '',
      country: '',
      dateOfBirth: '',
      zipCode: ''
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="login-page">
      {/* <div className="container"> */}
      <div className='image-container'>
        <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/GettyImages-2158556312.jpg" alt="" />
        <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
      </div>
      <div className="login-container">
        <div className="login-header">
          {/* <Link to="/" className="back-link">
            ← Back to Home
          </Link> */}
          <h1>{isSignUp ? 'Signup' : 'Login'}</h1>
          <p className="login-subtitle">
            {isSignUp
              ? 'Create your free account to access your results, book a concierge appointment, and unlock your toolkit.'
              : ''
            }
          </p>
        </div>

        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required={isSignUp}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required={isSignUp}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            )}

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="country">State/Location</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required={isSignUp}
                >
                  <option value="">Select your state or location</option>
                  {usStateOptions.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isSignUp && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required={isSignUp}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP / postal code (optional)</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 90210 or 902101234"
                    inputMode="numeric"
                    maxLength={9}
                    pattern="\d{0,9}"
                    autoComplete="postal-code"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={isSignUp}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Submit')}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="toggle-mode-btn"
                onClick={toggleMode}
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </p>

            {!isSignUp && (
              <p>
                Forgot your password?
                <Link to="/forgot-password" className="forgot-password-link"> Reset Password</Link>
              </p>
            )}
          </div>
        </div>

        {/* Redirect info */}
        {/* {redirectUrl !== '/' && (
          <div className="redirect-info">
            <p>After signing in, you'll be redirected to continue your application process.</p>
          </div>
        )} */}
      </div>
      {/* </div> */}
    </div>
  );
};

export default LoginPage;
