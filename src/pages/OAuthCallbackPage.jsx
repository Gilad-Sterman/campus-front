import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/reducers/authReducer.js';
import authApi from '../services/authApi.js';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check for error in query params first
      const error = searchParams.get('error');
      if (error) {
        navigate(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      // Parse tokens from URL fragment (after #)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in');

      if (accessToken) {
        try {
          // Store token in localStorage
          localStorage.setItem('token', accessToken);

          // Let App.jsx getCurrentUser() handle the profile fetch and redirect
          // Just redirect to home and let the auth system handle role-based routing
          navigate('/');
        } catch (error) {
          console.error('OAuth callback error:', error);
          navigate('/login?error=Failed to complete authentication');
        }
      } else {
        navigate('/login?error=No authentication token received');
      }
    };

    handleOAuthCallback();
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="oauth-callback-page">
      <div className="container">
        <div className="oauth-callback-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h2>Completing authentication...</h2>
          <p>Please wait while we finish setting up your account.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
