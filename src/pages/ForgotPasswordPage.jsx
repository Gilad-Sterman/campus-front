import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import authApi from '../services/authApi.js';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.forgotPassword(email);
      
      setEmailSent(true);
      setMessage(response.message || 'Password reset instructions have been sent to your email address.');
    } catch (error) {
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError(''); // Clear error when user starts typing
  };

  if (emailSent) {
    return (
      <div className="forgot-password-page">
        <div className="container">
          <div className="forgot-password-container">
            <div className="forgot-password-header">
              <h1>Check Your Email</h1>
              <p className="forgot-password-subtitle">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </div>

            <div className="forgot-password-content">
              <div className="success-message">
                <p>
                  If an account with that email exists, you'll receive an email with instructions 
                  to reset your password within a few minutes.
                </p>
                <p>
                  Don't see the email? Check your spam folder or try again with a different email address.
                </p>
              </div>

              <div className="forgot-password-actions">
                <Link to="/login" className="btn btn-primary btn-full">
                  Back to Login
                </Link>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-full"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setMessage('');
                  }}
                >
                  Try Different Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="forgot-password-container">
          <div className="forgot-password-header">
            {/* <Link to="/login" className="back-link">
              <FaArrowLeft /> Back to Login
            </Link> */}
            <h1>Reset Your Password</h1>
            <p className="forgot-password-subtitle">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          <div className="forgot-password-form-container">
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading || !email.trim()}
              >
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </form>

            <div className="forgot-password-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="text-link">
                  Login
                </Link>
              </p>
              
              <p>
                Don't have an account?{' '}
                <Link to="/login" className="text-link">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
