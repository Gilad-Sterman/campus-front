import { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaGlobe,
    FaCalendarAlt,
    FaClipboardList,
    FaFileAlt,
    FaGraduationCap,
    FaUserShield
} from 'react-icons/fa';
import adminApi from '../../../services/adminApi';
import AdminLoader from '../AdminLoader';

function UserDetailView({ userId, onBack }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                const response = await adminApi.getUserById(userId);
                setUser(response.data.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Failed to load user details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    if (loading) return <AdminLoader message="Loading user details..." />;

    if (error) {
        return (
            <div className="admin-error-view">
                <p>{error}</p>
                <button className="btn-admin btn-admin--primary" onClick={onBack}>
                    <FaArrowLeft /> Back to List
                </button>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="user-detail-view">
            <header className="user-detail-view__header">
                <button className="btn-admin btn-admin--secondary" onClick={onBack}>
                    <FaArrowLeft /> Back to List
                </button>
                <div className="user-detail-view__title">
                    <h1>{user.first_name} {user.last_name}</h1>
                    <span className={`status-badge status-badge--${user.status}`}>
                        {user.status}
                    </span>
                </div>
            </header>

            <div className="user-detail-view__grid">
                {/* 1. Profile Overview */}
                <section className="admin-card user-detail-view__profile">
                    <div className="admin-card__header">
                        <h2><FaUser /> Profile Overview</h2>
                    </div>
                    <div className="admin-card__body">
                        <div className="info-grid">
                            <div className="info-item">
                                <label><FaEnvelope /> Email</label>
                                <span>{user.email}</span>
                            </div>
                            <div className="info-item">
                                <label><FaPhone /> Phone</label>
                                <span>{user.phone || 'Not provided'}</span>
                            </div>
                            <div className="info-item">
                                <label><FaGlobe /> Country</label>
                                <span>{user.country || 'Not provided'}</span>
                            </div>
                            <div className="info-item">
                                <label><FaCalendarAlt /> Joined</label>
                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Quiz Results */}
                <section className="admin-card user-detail-view__quiz">
                    <div className="admin-card__header">
                        <h2><FaClipboardList /> Quiz Results</h2>
                    </div>
                    <div className="admin-card__body">
                        {user.quiz?.completed?.length > 0 ? (
                            user.quiz.completed.map((quiz, idx) => (
                                <div key={quiz.id} className="quiz-entry">
                                    <div className="quiz-entry__meta">
                                        <strong>Attempt #{user.quiz.completed.length - idx}</strong>
                                        <span>{new Date(quiz.completed_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="quiz-entry__results">
                                        <p><strong>Brilliance Summary:</strong> {quiz.brilliance_summary || 'No summary generated'}</p>
                                        {quiz.program_matches && (
                                            <div className="quiz-entry__matches">
                                                <strong>Top Program Matches:</strong>
                                                <ul>
                                                    {Array.isArray(quiz.program_matches) ?
                                                        quiz.program_matches.slice(0, 3).map((match, i) => (
                                                            <li key={i}>{match.name || 'Unnamed Program'}</li>
                                                        )) :
                                                        <li>Results data format mismatch</li>
                                                    }
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-msg">No completed quizzes found.</p>
                        )}
                        {user.quiz?.inProgress && (
                            <div className="quiz-progress-notif">
                                <span>Currently in progress (Question {user.quiz.inProgress.current_question})</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Concierge & Appointments */}
                <section className="admin-card user-detail-view__concierge">
                    <div className="admin-card__header">
                        <h2><FaUserShield /> Concierge & Support</h2>
                    </div>
                    <div className="admin-card__body">
                        {user.appointments?.length > 0 ? (
                            <div className="concierge-info">
                                <div className="assigned-concierge">
                                    <label>Assigned Concierge</label>
                                    <div className="admin-user-info">
                                        <strong>{user.appointments[0].admin?.first_name} {user.appointments[0].admin?.last_name}</strong>
                                        <span>{user.appointments[0].admin?.email}</span>
                                    </div>
                                </div>
                                <div className="latest-appointment">
                                    <label>Latest Appointment</label>
                                    <div className="appointment-badge">
                                        <span className={`status-badge status-badge--${user.appointments[0].status}`}>
                                            {user.appointments[0].status}
                                        </span>
                                        <span>{new Date(user.appointments[0].scheduled_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                {user.appointments[0].meeting_url && (
                                    <div className="info-item mt-sm">
                                        <label>Meeting Link</label>
                                        <a href={user.appointments[0].meeting_url} target="_blank" rel="noreferrer" className="meeting-link">
                                            Join Meeting
                                        </a>
                                    </div>
                                )}
                                {user.appointments[0].notes && (
                                    <div className="info-item mt-sm">
                                        <label>Notes</label>
                                        <p className="appointment-notes">{user.appointments[0].notes}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="empty-msg">No concierge assigned or appointments scheduled.</p>
                        )}
                    </div>
                </section>

                {/* 4. Applications */}
                <section className="admin-card user-detail-view__applications">
                    <div className="admin-card__header">
                        <h2><FaGraduationCap /> Applications</h2>
                    </div>
                    <div className="admin-card__body">
                        {user.applications?.length > 0 ? (
                            <div className="mini-table-wrapper">
                                <table className="mini-table">
                                    <thead>
                                        <tr>
                                            <th>Program</th>
                                            <th>University</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {user.applications.map(app => (
                                            <tr key={app.id}>
                                                <td>{app.programs?.name}</td>
                                                <td>{app.programs?.universities?.name}</td>
                                                <td>
                                                    <span className={`status-badge status-badge--${app.status}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="empty-msg">No applications started yet.</p>
                        )}
                    </div>
                </section>

                {/* 4. Documents */}
                <section className="admin-card user-detail-view__documents">
                    <div className="admin-card__header">
                        <h2><FaFileAlt /> Document Library</h2>
                    </div>
                    <div className="admin-card__body">
                        {user.documents?.length > 0 ? (
                            <ul className="doc-list">
                                {user.documents.map(doc => (
                                    <li key={doc.id} className="doc-item">
                                        <div className="doc-item__info">
                                            <strong>{doc.document_type}</strong>
                                            <span>{doc.original_filename}</span>
                                        </div>
                                        <span className={`status-badge status-badge--${doc.status}`}>
                                            {doc.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-msg">No documents uploaded.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default UserDetailView;
