import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import authApi from '../services/authApi.js';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Parse token from URL fragment (hash)
  useEffect(() => {
    const parseTokenFromHash = () => {
      const hash = location.hash;
      if (hash) {
        // Remove the # and parse as URLSearchParams
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const tokenType = params.get('token_type');
        const type = params.get('type');
        
        if (accessToken && type === 'recovery') {
          setToken(accessToken);
        } else {
          setError('Invalid or missing reset token. Please request a new password reset.');
        }
      } else {
        setError('Invalid or missing reset token. Please request a new password reset.');
      }
    };

    parseTokenFromHash();
  }, [location.hash]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword(token, formData.password);
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="container">
          <div className="reset-password-container">
            <div className="reset-password-header">
              <h1>Password Reset Successful</h1>
              <p className="reset-password-subtitle">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
            </div>

            <div className="reset-password-content">
              <div className="success-message">
                <p>
                  Your password has been changed successfully. For security reasons, 
                  you'll need to sign in again with your new password.
                </p>
              </div>

              <div className="reset-password-actions">
                <button 
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => navigate('/login')}
                >
                  Sign In Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="container">
        <div className="reset-password-container">
          <div className="reset-password-header">
            {/* <Link to="/login" className="back-link">
              <FaArrowLeft /> Back to Login
            </Link> */}
            <h1>Set New Password</h1>
            <p className="reset-password-subtitle">
              Enter your new password below.
            </p>
          </div>

          <div className="reset-password-form-container">
            <form onSubmit={handleSubmit} className="reset-password-form">
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
                    placeholder="Enter your new password"
                    disabled={loading || !token}
                    minLength="6"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Confirm your new password"
                    disabled={loading || !token}
                    minLength="6"
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

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading || !token || !formData.password || !formData.confirmPassword}
              >
                {loading ? 'Updating Password...' : 'Save Password'}
              </button>
            </form>

            <div className="reset-password-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="text-link">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
