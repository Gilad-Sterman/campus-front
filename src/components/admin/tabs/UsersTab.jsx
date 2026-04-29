import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FaUsers, FaUnlock, FaLock, FaUserShield, FaUser, FaEye, FaSync } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import adminApi from '../../../services/adminApi';
import AdminLoader from '../AdminLoader';
import { canEdit } from '../../../utils/permissions';
import { useUsers } from '../../../hooks/useAdminCache';
import { formatCacheAge } from '../../../utils/adminCacheUtils';

function UsersTab({ onViewUser }) {
    const { user: currentUser } = useSelector(state => state.auth);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [showBlockModal, setShowBlockModal] = useState(null);

    const limit = 20;

    // Memoize params to prevent infinite re-renders
    const params = useMemo(() => ({
        page,
        limit,
        search,
        status: statusFilter
    }), [page, limit, search, statusFilter]);

    // Use paginated cache hook
    const {
        data: users,
        total,
        loading,
        error,
        timestamp,
        refresh,
        invalidateCache
    } = useUsers(params);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset page to 1 on new search
    };

    const handleBlockUser = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
            await adminApi.updateUserStatus(userId, newStatus);
            setShowBlockModal(null);
            invalidateCache('update', 'user');
            refresh();
        } catch (err) {
            alert(err.message || 'Failed to update user status');
        }
    };

    const [showRoleModal, setShowRoleModal] = useState(null);

    const handleRoleChange = async (userId, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'student' : 'admin';
            await adminApi.updateUserRole(userId, newRole);
            setShowRoleModal(null);
            invalidateCache('update', 'user');
            refresh();
        } catch (err) {
            alert(err.message || 'Failed to update user role');
        }
    };

    const totalPages = Math.ceil(total / limit);

    const formatDOB = (dob) => {
        if (!dob) return '-';
        const date = new Date(dob);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const response = await adminApi.exportUsers({
                search,
                status: statusFilter
            });

            const usersData = response.data.data;

            // Map data to friendly column names
            const exportData = usersData.map(u => ({
                'Full Name': `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Anonymous',
                'Email': u.email,
                'Phone': u.phone || '-',
                'Country': u.country || '-',
                'ZIP Code': u.zip_code || '-',
                'Date of Birth': u.date_of_birth ? new Date(u.date_of_birth).toLocaleDateString('en-GB') : '-',
                'Role': u.role,
                'Status': u.status,
                'Quiz Status': u.quiz_status || 'not_started',
                'Concierge Status': u.concierge_status || 'none',
                'Applications': u.application_count || 0,
                'Joined At': new Date(u.created_at).toLocaleDateString('en-GB'),
                'Been to Israel': u.ever_been_to_israel || '-',
                'Hebrew Proficiency': u.hebrew_proficiency || '-',
            }));

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Users");

            // Trigger download
            const filename = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (err) {
            alert(err.message || 'Failed to export users');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="admin-tab">
            <div className="admin-tab__header">
                <h1><FaUsers style={{ marginRight: '10px' }} /> Users Management</h1>
                <button
                    className="btn-admin btn-admin--secondary"
                    onClick={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? 'Exporting...' : 'Export'}
                </button>
            </div>

            <div className="admin-tab__filters">
                <form onSubmit={handleSearch} className="admin-tab__search">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" style={{ display: 'none' }}></button> {/* Hidden submit button to trigger form submission on enter */}
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-form__select"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                </select>

                <div className="admin-tab__cache-info">
                    <button
                        onClick={refresh}
                        className="btn-admin btn-admin--small btn-admin--secondary"
                        title="Refresh data"
                    >
                        <FaSync />
                    </button>
                    <span className="cache-age">
                        Last updated: {formatCacheAge(timestamp)}
                    </span>
                </div>
            </div>

            {loading ? (
                <AdminLoader message="Loading users..." />
            ) : error ? (
                <div className="admin-error">{error}</div>
            ) : (
                <>
                    <div className="admin-table">
                        <div className="admin-table__wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Quiz</th>
                                        <th>Concierge</th>
                                        <th>Apps</th>
                                        <th>DOB</th>
                                        <th>Joined</th>
                                        <th>Israel</th>
                                        <th>Hebrew</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.first_name} {user.last_name}</td>
                                            <td className="email-cell">{user.email}</td>
                                            <td>
                                                <span className={`status-badge status-badge--${user.status || 'active'}`}>
                                                    {user.status || 'active'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-badge--quiz-${user.quizStatus || 'not_started'}`}>
                                                    {user.quizStatus === 'not_started' ? 'Not Started' :
                                                        user.quizStatus === 'started' ? 'Started' : 'Completed'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-badge--${user.conciergeStatus || 'none'}`}>
                                                    {user.conciergeStatus || 'none'}
                                                </span>
                                            </td>
                                            <td>{user.applicationCount || 0}</td>
                                            <td>
                                                <span className={`status-badge status-badge--${user.date_of_birth || 'none'}`}>
                                                    {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-badge--${user.created_at || 'none'}`}>
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'none'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-badge--${user.ever_been_to_israel || 'none'}`}>
                                                    {user.ever_been_to_israel ? '✓' : '✗'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-badge--${user.hebrew_proficiency || 'none'}`}>
                                                    {user.hebrew_proficiency || '-'}
                                                </span>
                                            </td>
                                            <td className="admin-table__actions">
                                                {canEdit(currentUser?.role) && (
                                                    <button
                                                        className={`btn-admin btn-admin--small ${user.status === 'blocked' ? 'btn-admin--primary' : 'btn-admin--danger'}`}
                                                        onClick={() => setShowBlockModal(user)}
                                                    >
                                                        {user.status === 'blocked' ?
                                                            <><FaUnlock /> Unblock</> :
                                                            <><FaLock /> Block</>
                                                        }
                                                    </button>
                                                )}
                                                <button
                                                    className={`btn-admin btn-admin--small btn-admin--info`}
                                                    onClick={() => onViewUser(user.id)}
                                                >
                                                    <FaEye /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Block/Unblock Modal */}
            {showBlockModal && (
                <div className="admin-modal">
                    <div className="admin-modal__content">
                        <div className="admin-modal__header">
                            <h2>{showBlockModal.status === 'blocked' ? 'Unblock User?' : 'Block User?'}</h2>
                            <button className="admin-modal__close" onClick={() => setShowBlockModal(null)}>×</button>
                        </div>
                        <p>
                            {showBlockModal.status === 'blocked'
                                ? `Unblock ${showBlockModal.email}? They will regain access to their account.`
                                : `Block ${showBlockModal.email}? They will lose access to their Campus Israel account. You can unblock them at any time.`
                            }
                        </p>
                        <div className="admin-modal__actions">
                            <button className="btn-admin btn-admin--secondary" onClick={() => setShowBlockModal(null)}>
                                Cancel
                            </button>
                            <button
                                className={`btn-admin ${showBlockModal.status === 'blocked' ? 'btn-admin--primary' : 'btn-admin--danger'}`}
                                onClick={() => handleBlockUser(showBlockModal.id, showBlockModal.status)}
                            >
                                {showBlockModal.status === 'blocked' ? 'Unblock' : 'Block User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Modal */}
            {showRoleModal && (
                <div className="admin-modal">
                    <div className="admin-modal__content">
                        <div className="admin-modal__header">
                            <h2>{showRoleModal.role === 'admin' ? 'Demote to Student?' : 'Promote to Admin?'}</h2>
                            <button className="admin-modal__close" onClick={() => setShowRoleModal(null)}>×</button>
                        </div>
                        <p style={{ padding: '20px' }}>
                            {showRoleModal.role === 'admin'
                                ? `Demote ${showRoleModal.email} to student? They will lose admin privileges.`
                                : `Promote ${showRoleModal.email} to admin? They will gain full access to the admin panel.`
                            }
                        </p>
                        <div className="admin-modal__actions" style={{ padding: '0 20px 20px' }}>
                            <button className="btn-admin btn-admin--secondary" onClick={() => setShowRoleModal(null)}>
                                Cancel
                            </button>
                            <button
                                className={`btn-admin ${showRoleModal.role === 'admin' ? 'btn-admin--danger' : 'btn-admin--primary'}`}
                                onClick={() => handleRoleChange(showRoleModal.id, showRoleModal.role)}
                            >
                                {showRoleModal.role === 'admin' ? 'Demote to Student' : 'Make Admin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersTab;
