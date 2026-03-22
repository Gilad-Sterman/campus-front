import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import studyBuddyApi from '../../services/studyBuddyApi';

const StudyBuddy = () => {
  const { user, quizState } = useSelector(state => state.auth);
  const { answers } = useSelector(state => state.quiz);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discordData, setDiscordData] = useState(null);
  const [connectToIsraeliStudent, setConnectToIsraeliStudent] = useState(false);
  const [connectToNearbyApplicant, setConnectToNearbyApplicant] = useState(false);

  // Determine quiz state like HomePage does
  const hasTakenQuiz = quizState?.data?.status === 'completed';
  const hasChurnedQuiz = user
    ? quizState?.data?.status === 'in_progress' // For authenticated users, check server progress
    : answers.some(answer => answer !== null) && quizState?.data?.status !== 'completed'; // For anonymous users, check localStorage

  useEffect(() => {
    const fetchDiscordLink = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Don't fetch Discord link if user hasn't completed quiz
      if (!hasTakenQuiz) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await studyBuddyApi.getDiscordLink();
        setDiscordData(response.data.data);
      } catch (err) {
        console.error('Failed to fetch Discord link:', err);
        setError(err.response?.data?.error || 'Failed to load study buddy information');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscordLink();
  }, [user, hasTakenQuiz]);

  const handleJoinCommunity = () => {
    if (discordData?.discordLink) {
      window.open(discordData.discordLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (!user) {
    return (
      <div className="profile-section">
        <div className="profile-section-content">
          <p>Please log in to access the study buddy community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">

      <div className="profile-section-content">
        <div className='study-buddy'>
          <h3>Want to speak to someone like you?</h3>
          <p className="study-buddy-description">
            Tell us who you’d like to meet, and we’ll get back to
            you with an introduction.
          </p>

          {loading && (
            <div className="study-buddy-loading">
              <div className="loading-spinner"></div>
              <p>Finding your study group...</p>
            </div>
          )}

          {error && (
            <div className="study-buddy-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && !hasTakenQuiz && (
            <div className="study-buddy-quiz-required">
              <h3>Complete Your Quiz First</h3>
              <p>
                To join the right study group for your academic interests and background,
                you'll need to complete our personalized quiz first.
              </p>

              <div className="study-buddy-cta">
                {hasChurnedQuiz ? (
                  <Link to="/quiz" className="btn-primary study-buddy-join-btn">
                    Continue Quiz
                  </Link>
                ) : (
                  <Link to="/quiz" className="btn-primary study-buddy-join-btn">
                    Start Quiz
                  </Link>
                )}
              </div>

              <p className="study-buddy-quiz-description">
                The quiz takes about 10 minutes and helps us match you with students
                who share similar academic goals and interests.
              </p>
            </div>
          )}

          {!loading && !error && hasTakenQuiz && discordData && (
            <div className="study-buddy-content">
              {discordData.hasLink ? (
                <>
                  <div className="study-buddy-checkboxes">
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={connectToIsraeliStudent}
                          onChange={(e) => setConnectToIsraeliStudent(e.target.checked)}
                        />
                        <span className="checkbox-text">Connect me to a student at an Israeli University</span>
                      </label>
                    </div>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={connectToNearbyApplicant}
                          onChange={(e) => setConnectToNearbyApplicant(e.target.checked)}
                        />
                        <span className="checkbox-text">Connect me to someone nearby who is applying to study in Israel</span>
                      </label>
                    </div>
                  </div>

                  <div className="study-buddy-cta">
                    <button
                      className={`btn-secondary study-buddy-join-btn ${!connectToIsraeliStudent && !connectToNearbyApplicant ? 'disabled' : ''}`}
                      onClick={handleJoinCommunity}
                      disabled={!connectToIsraeliStudent && !connectToNearbyApplicant}
                    >
                      Join PeerConnect
                    </button>
                  </div>

                  <div className="study-buddy-consent">
                    <p>
                      By joining, you agree to Discord's{' '}
                      <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </a>.
                    </p>
                    <p>
                      Campus Israel does not monitor private conversations or interactions on Discord.
                    </p>
                  </div>

                  {/* {discordData.group && (
                    <div className="study-buddy-group-info">
                      <h3>Your Study Group</h3>
                      <p>
                        <strong>Focus Area:</strong> {discordData.group.discipline}
                      </p>
                      <p>
                        <strong>Region:</strong> {discordData.group.region}
                      </p>
                    </div>
                  )} */}
                </>
              ) : (
                <div className="study-buddy-pending">
                  <h3>Community Setup in Progress</h3>
                  <p>{discordData.message}</p>
                  <p>We're setting up your Discord community. Check back soon!</p>

                  {discordData.group && (
                    <div className="study-buddy-group-info">
                      <h4>Your Assigned Group</h4>
                      <p>
                        <strong>Focus Area:</strong> {discordData.group.discipline}
                      </p>
                      <p>
                        <strong>Region:</strong> {discordData.group.region}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;
