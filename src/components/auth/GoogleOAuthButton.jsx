import React from 'react';
import { FaGoogle } from 'react-icons/fa';

/** Retired for MVP — kept so imports do not break if re-enabled later. */
const GoogleOAuthButton = ({ disabled = true }) => {
  return (
    <button
      type="button"
      className="btn btn-google-oauth"
      disabled={disabled}
      title="Google sign-in is not available"
    >
      <FaGoogle className="google-icon" />
      Continue with Google
    </button>
  );
};

export default GoogleOAuthButton;
