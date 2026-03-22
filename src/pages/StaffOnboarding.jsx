import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import adminApi from '../services/adminApi';
import authApi from '../services/authApi';

function StaffOnboarding() {
    const location = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState('loading'); // loading, form, success, error
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const initializeOnboarding = async () => {
            try {
                // 1. Extract Supabase auth details from hash
                // Supabase appends #access_token=...&type=invite etc.
                const hashParams = new URLSearchParams(location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                // console.log('Onboarding page loaded with:', {
                //     accessToken: accessToken ? 'present' : 'missing',
                //     refreshToken: refreshToken ? 'present' : 'missing',
                //     type,
                //     fullHash: location.hash,
                //     fullSearch: location.search
                // });

                // Check if we have tokens (either in hash or already in local storage)
                const existingAccessToken = localStorage.getItem('sb-access-token');
                const existingRefreshToken = localStorage.getItem('sb-refresh-token');

                let currentAccessToken = accessToken || existingAccessToken;
                let currentRefreshToken = refreshToken || existingRefreshToken;

                if (accessToken && refreshToken) {
                    // If we just arrived from the email, save the tokens
                    localStorage.setItem('sb-access-token', accessToken);
                    localStorage.setItem('sb-refresh-token', refreshToken);
                    currentAccessToken = accessToken;
                    currentRefreshToken = refreshToken;
                }

                if (!currentAccessToken || !currentRefreshToken) {
                    if (type === 'invite' || type === 'recovery') {
                        setStep('error');
                        setError('Authentication tokens missing. Please try clicking the link in your email again, or contact support if the issue persists.');
                    } else {
                        setStep('error');
                        setError('You must click the link in your invitation email to access this page.');
                    }
                    return;
                }

                // 2. Get user metadata from Supabase to extract our internal token
                const userData = await authApi.getAuthUser(currentAccessToken);
                const internalToken = userData.data?.user_metadata?.onboarding_token;

                console.log('User metadata:', {
                    hasInternalToken: internalToken ? 'present' : 'missing',
                    userMetadata: userData.data?.user_metadata
                });

                if (!internalToken) {
                    setStep('error');
                    setError('Invalid invitation. The onboarding token is missing. Please request a new invite.');
                    return;
                }

                setToken(internalToken);
                setStep('form');

            } catch (err) {
                console.error('Onboarding initialization error:', err);
                setStep('error');
                setError('Failed to initialize onboarding. Please try again or contact support.');
            }
        };

        initializeOnboarding();
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Get the Supabase access token for authentication
            const accessToken = localStorage.getItem('sb-access-token');
            if (!accessToken) {
                throw new Error('Authentication token missing. Please try clicking the invitation link again.');
            }

            // Complete onboarding in our backend
            // This now handles BOTH the password update (via admin API) 
            // and the profile creation in the users table.
            const response = await adminApi.completeStaffOnboarding({
                firstName: formData.firstName,
                lastName: formData.lastName,
                password: formData.password,
                token,
                accessToken // Pass the access token for authentication
            });

            // Store the user role from the response
            const resolvedRole =
                response?.data?.role ||
                response?.data?.data?.role ||
                '';

            if (resolvedRole) {
                setUserRole(String(resolvedRole).trim().toLowerCase());
            }

            setStep('success');
        } catch (err) {
            setError(err.message || 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'loading') {
        return (
            <div className="onboarding-container">
                <div className="onboarding-card">
                    <div className="loader"></div>
                    <p>Verifying invitation...</p>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="onboarding-container">
                <div className="onboarding-card">
                    <FaExclamationTriangle className="icon-error" />
                    <h1>Invitation Error</h1>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        const isConcierge = userRole === 'concierge';
        const successMessage = isConcierge 
            ? 'Your profile has been created successfully. You can now access the concierge portal.'
            : 'Your profile has been created successfully. You can now access the admin panel.';
        const buttonText = isConcierge ? 'Go to Concierge Portal' : 'Go to Admin Panel';
        const redirectPath = isConcierge ? '/concierge' : '/admin';

        return (
            <div className="onboarding-container">
                <div className="onboarding-card">
                    <FaCheckCircle className="icon-success" />
                    <h1>Welcome Aboard!</h1>
                    <p>{successMessage}</p>
                    <button className="btn btn-primary" onClick={() => navigate(redirectPath)}>{buttonText}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <FaUserPlus className="icon-header" />
                    <h1>Complete Your Onboarding</h1>
                    <p>Please provide your details to finalize your staff account.</p>
                </div>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    {error && <div className="error-banner">{error}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Set Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Min 6 characters"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Repeat your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Completing Set up...' : 'Complete Set up'}
                    </button>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .onboarding-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #f9f9f9;
                    padding: 20px;
                    font-family: 'Inter', sans-serif;
                }
                .onboarding-card {
                    background: #fff;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                    width: 100%;
                    max-width: 500px;
                    text-align: center;
                }
                .onboarding-header {
                    margin-bottom: 30px;
                }
                .onboarding-header h1 {
                    font-size: 1.75rem;
                    color: #1c1e22;
                    margin-bottom: 8px;
                }
                .onboarding-header p {
                    color: #6e6e6e;
                }
                .icon-header { font-size: 3rem; color: #1c1e22; margin-bottom: 15px; }
                .icon-success { font-size: 4rem; color: #4a7c59; margin-bottom: 20px; }
                .icon-error { font-size: 4rem; color: #a64452; margin-bottom: 20px; }
                
                .onboarding-form {
                    text-align: left;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin-bottom: 6px;
                }
                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 1rem;
                }
                .btn-block { width: 100%; margin-top: 10px; }
                .error-banner {
                    background: #fef2f2;
                    color: #a64452;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    font-size: 0.875rem;
                    border: 1px solid #fee2e2;
                }
                .loader {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #1c1e22;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}

export default StaffOnboarding;
