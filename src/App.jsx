import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import './assets/scss/main.scss'
import { getCurrentUser } from './store/actions/authActions.js'

// Layout components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Password Protection (Pre-launch)
const ENABLE_SITE_LOCK = false; // Set to false to easily remove the password wall for launch
import SiteLockScreen from './components/auth/SiteLockScreen'

// Pages
import HomePage from './pages/HomePage'
import UniversitiesPage from './pages/UniversitiesPage'
import UniversityDetailsPage from './pages/UniversityDetailsPage'
import ApplyPage from './pages/ApplyPage'
import ApplyIntroPage from './pages/ApplyIntroPage'
import DomainPage from './pages/DomainPage'
import ProgramDetailsPage from './pages/ProgramDetailsPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import QuizPage from './pages/QuizPage'
import ProfilePage from './pages/ProfilePage'
import ThankYouPage from './pages/ThankYouPage'
import StaffOnboarding from './pages/StaffOnboarding'
import AdminLayout from './components/admin/AdminLayout'
import ConciergePage from './pages/ConciergePage'

// Utils
import { scrollToElement } from './utils/scrollUtils'
import QuizResultsPage from './pages/QuizResultsPage.jsx'

// Scroll to hash component
function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // Check if there's a hash in the URL
    if (location.hash) {
      // Remove the # character
      const id = location.hash.substring(1);

      // Add a small delay to ensure the DOM is fully loaded
      setTimeout(() => {
        scrollToElement(id, 80); // 80px offset for header
      }, 100);
    } else {
      // Scroll to top when navigating to a page without hash
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

function App() {
  const dispatch = useDispatch();
  const [isSiteUnlocked, setIsSiteUnlocked] = useState(
    localStorage.getItem('siteUnlocked') === 'true'
  );

  // Initialize authentication on app startup
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  // Pre-launch Password Wall Check
  if (ENABLE_SITE_LOCK && !isSiteUnlocked) {
    return <SiteLockScreen onUnlock={() => setIsSiteUnlocked(true)} />;
  }

  return (
    <Router>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/universities" element={
          <Layout>
            <UniversitiesPage />
          </Layout>
        } />
        <Route path="/universities/:id" element={
          <Layout>
            <UniversityDetailsPage />
          </Layout>
        } />
        <Route path="/programs" element={
          <Layout>
            <div className="container mt-xl">
              <h1>Programs</h1>
              <p>This page will list all available academic programs.</p>
            </div>
          </Layout>
        } />
        <Route path="/apply/intro" element={
          <Layout>
            <ApplyIntroPage />
          </Layout>
        } />
        <Route path="/apply" element={
          <ProtectedRoute>
            <Layout>
              <ApplyPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/quiz/results" element={
          <ProtectedRoute>
            <Layout>
              <QuizResultsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/domains/:domainName" element={
          <Layout>
            <DomainPage />
          </Layout>
        } />
        <Route path="/program/:id" element={
          <Layout>
            <ProgramDetailsPage />
          </Layout>
        } />
        <Route path="/apply/thank-you" element={
          <Layout>
            <ThankYouPage />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout>
            <LoginPage />
          </Layout>
        } />
        <Route path="/forgot-password" element={
          <Layout>
            <ForgotPasswordPage />
          </Layout>
        } />
        <Route path="/reset-password" element={
          <Layout>
            <ResetPasswordPage />
          </Layout>
        } />
        <Route path="/auth/callback" element={
          <Layout>
            <OAuthCallbackPage />
          </Layout>
        } />
        <Route path="/quiz" element={
          <Layout>
            <QuizPage />
          </Layout>
        } />
        <Route path="/admin/onboarding" element={
          <Layout>
            <StaffOnboarding />
          </Layout>
        } />
        <Route path="/profile/results" element={
          <Navigate to="/profile?tab=quiz-results" replace />
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <Layout>
            <div className="container mt-xl">
              <h1>About Campus Israel</h1>
              <p>Information about our platform and mission.</p>
            </div>
          </Layout>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } />
        <Route path="/concierge" element={
          <ProtectedRoute>
            <ConciergePage />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <Layout>
            <div className="container mt-xl">
              <h1>Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
