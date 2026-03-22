import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import authApi from '../../services/authApi.js';

const GoogleOAuthButton = ({ disabled = false }) => {
  const handleGoogleLogin = () => {
    if (!disabled) {
      authApi.googleOAuth();
    }
  };

  return (
    <button
      type="button"
      className="btn btn-google-oauth"
      onClick={handleGoogleLogin}
      disabled={disabled}
    >
      <FaGoogle className="google-icon" />
      Continue with Google
    </button>
  );
};

export default GoogleOAuthButton;
