import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaEye, FaUserTie, FaSync, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import adminApi from '../../../services/adminApi';
import AdminLoader from '../AdminLoader';
import { canEdit } from '../../../utils/permissions';
import { useStaff, useStaffInvites } from '../../../hooks/useAdminCache';
import { formatCacheAge } from '../../../utils/adminCacheUtils';

const STAFF_ROLES = [
    { value: 'admin_view', label: 'Admin View', description: 'Read-only access to admin panel' },
    { value: 'admin_edit', label: 'Admin Edit', description: 'Full admin access including editing' },
    { value: 'concierge', label: 'Concierge', description: 'Student support and appointment management' }
];

function StaffPermissionsTab() {
    const { user: currentUser } = useSelector(state => state.auth);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        role: 'admin_view'
    });
    const [showRoleModal, setShowRoleModal] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    // Use cache hooks
    const {
        data: staff,
        loading: staffLoading,
        error: staffError,
        timestamp: staffTimestamp,
        refresh: refreshStaff,
        invalidateCache: invalidateStaffCache
    } = useStaff();

    const {
        data: invites,
        loading: invitesLoading,
        error: invitesError,
        refresh: refreshInvites,
        invalidateCache: invalidateInvitesCache
    } = useStaffInvites();

    const loading = staffLoading || invitesLoading;
    const error = staffError || invitesError;

    const handleInviteSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.role) {
            alert('Email and role are required');
            return;
        }

        try {
            setInviteLoading(true);
            const response = await adminApi.inviteStaff(formData);
            setShowInviteForm(false);
            setFormData({ email: '', role: 'admin_view' });
            invalidateStaffCache('update', 'staff');
            invalidateInvitesCache('update', 'staff');
            refreshStaff();
            refreshInvites();

            alert(`Invitation sent to ${formData.email}!\n\nThey will receive an email with a link to complete their onboarding and set their password.`);
        } catch (err) {
            alert(err.message || 'Failed to send invitation');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRevokeInvite = async (inviteId) => {
        if (!confirm('Revoke this invitation? The invite link will no longer work.')) return;

        try {
            await adminApi.revokeStaffInvite(inviteId);
            invalidateInvitesCache('delete', 'staff');
            refreshInvites();
        } catch (err) {
            alert(err.message || 'Failed to revoke invitation');
        }
    };

    const handleUpdateStaffRole = async () => {
        if (!selectedRole || selectedRole === showRoleModal.role) {
            setShowRoleModal(null);
            return;
        }

        try {
            await adminApi.updateStaffRole(showRoleModal.id, selectedRole);
            setShowRoleModal(null);
            invalidateStaffCache('update', 'staff');
            refreshStaff();
        } catch (err) {
            alert(err.message || 'Failed to update staff role');
        }
    };

    const openRoleModal = (staff) => {
        setShowRoleModal(staff);
        setSelectedRole(staff.role);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin_edit': return <FaUserShield />;
            case 'admin_view': return <FaEye />;
            case 'concierge': return <FaUserTie />;
            default: return <FaUserShield />;
        }
    };

    const getRoleLabel = (role) => {
        const roleObj = STAFF_ROLES.find(r => r.value === role);
        return roleObj ? roleObj.label : role;
    };

    const getConnectionIcon = (member) => {
        if (member.role !== 'concierge') return null;
        
        if (member.is_connected) {
            return (
                <FaCheckCircle 
                    className="connection-status connection-status--connected" 
                    title="Calendar connected"
                />
            );
        } else {
            return (
                <FaTimesCircle 
                    className="connection-status connection-status--disconnected" 
                    title="Calendar not connected"
                />
            );
        }
    };

    return (
        <div className="admin-tab">
            <div className="admin-tab__header">
                <h1><FaUserShield style={{ marginRight: '10px' }} /> Staff & Permissions</h1>
                {canEdit(currentUser?.role) && (
                    <button
                        className="btn-admin btn-admin--primary"
                        onClick={() => setShowInviteForm(true)}
                    >
                        <FaPlus /> Invite New Staff
                    </button>
                )}
            </div>

            <div className="admin-tab__filters">
                <div className="admin-tab__cache-info">
                    <button 
                        onClick={refreshStaff} 
                        className="btn-admin btn-admin--small btn-admin--secondary"
                        title="Refresh data"
                    >
                        <FaSync />
                    </button>
                    <span className="cache-age">
                        Last updated: {formatCacheAge(staffTimestamp)}
                    </span>
                </div>
            </div>

            {loading ? (
                <AdminLoader message="Loading staff and invitations..." />
            ) : error ? (
                <div className="admin-error">{error}</div>
            ) : (
                <>
                    {/* Current Staff Members */}
                    <div className="admin-section">
                        <h2>Current Staff Members</h2>
                        {staff.length === 0 ? (
                            <p>No staff members found.</p>
                        ) : (
                            <div className="admin-table">
                                <div className="admin-table__wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Joined</th>
                                                {canEdit(currentUser?.role) && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staff.map((member) => (
                                                <tr key={member.id}>
                                                    <td>{member.first_name} {member.last_name}</td>
                                                    <td>{member.email}</td>
                                                    <td>
                                                        <span className={`role-badge role-badge--${member.role}`}>
                                                            {getRoleIcon(member.role)} {getRoleLabel(member.role)}
                                                            {getConnectionIcon(member)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-badge--${member.status || 'active'}`}>
                                                            {member.status || 'active'}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(member.created_at).toLocaleDateString()}</td>
                                                    {canEdit(currentUser?.role) && (
                                                        <td className="admin-table__actions">
                                                            <button
                                                                className="btn-admin btn-admin--small btn-admin--secondary"
                                                                onClick={() => openRoleModal(member)}
                                                                title="Update Role"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pending Invitations */}
                    <div className="admin-section">
                        <h2>Pending Invitations</h2>
                        {invites.length === 0 ? (
                            <p>No pending invitations.</p>
                        ) : (
                            <div className="admin-table">
                                <div className="admin-table__wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Invited By</th>
                                                <th>Sent</th>
                                                <th>Expires</th>
                                                {canEdit(currentUser?.role) && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invites.map((invite) => (
                                                <tr key={invite.id}>
                                                    <td>{invite.email}</td>
                                                    <td>
                                                        <span className={`role-badge role-badge--${invite.role}`}>
                                                            {getRoleIcon(invite.role)} {getRoleLabel(invite.role)}
                                                        </span>
                                                    </td>
                                                    <td>{invite.invited_by_email || 'Unknown'}</td>
                                                    <td>{new Date(invite.created_at).toLocaleDateString()}</td>
                                                    <td>{new Date(invite.expires_at).toLocaleDateString()}</td>
                                                    {canEdit(currentUser?.role) && (
                                                        <td className="admin-table__actions">
                                                            <button
                                                                className="btn-admin btn-admin--small btn-admin--danger"
                                                                onClick={() => handleRevokeInvite(invite.id)}
                                                                title="Revoke Invitation"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Invite Staff Modal */}
            {showInviteForm && (
                <div className="admin-modal">
                    <div className="admin-modal__content">
                        <div className="admin-modal__header">
                            <h2>Add New Staff Member</h2>
                            <button className="admin-modal__close" onClick={() => setShowInviteForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleInviteSubmit} className="admin-form">
                            <div className="admin-form__group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="staff@example.com"
                                />
                            </div>
                            <div className="admin-form__group">
                                <label>Role *</label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    {STAFF_ROLES.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                <small>
                                    {STAFF_ROLES.find(r => r.value === formData.role)?.description}
                                </small>
                            </div>
                            <div className="admin-form__actions">
                                <button
                                    type="button"
                                    className="btn-admin btn-admin--secondary"
                                    onClick={() => setShowInviteForm(false)}
                                    disabled={inviteLoading}
                                    style={{
                                        opacity: inviteLoading ? 0.6 : 1,
                                        cursor: inviteLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-admin btn-admin--primary"
                                    disabled={inviteLoading}
                                    style={{
                                        opacity: inviteLoading ? 0.6 : 1,
                                        cursor: inviteLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {inviteLoading ? 'Sending Invitation...' : 'Create Staff User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Role Update Modal */}
            {showRoleModal && (
                <div className="admin-modal">
                    <div className="admin-modal__content">
                        <div className="admin-modal__header">
                            <h2>Update Staff Role</h2>
                            <button className="admin-modal__close" onClick={() => setShowRoleModal(null)}>×</button>
                        </div>
                        <div className="admin-form">
                            <p style={{ marginBottom: '20px' }}>
                                Update role for <strong>{showRoleModal.first_name} {showRoleModal.last_name}</strong> ({showRoleModal.email})
                            </p>
                            <div className="admin-form__group">
                                <label>Select New Role</label>
                                <div className="role-options">
                                    {STAFF_ROLES.map((role) => (
                                        <label key={role.value} className="radio-label">
                                            <input
                                                type="radio"
                                                name="staffRole"
                                                value={role.value}
                                                checked={selectedRole === role.value}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                            />
                                            <div className="radio-content">
                                                <span className="role-title">{role.label}</span>
                                                <span className="role-description">{role.description}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="admin-form__actions">
                                <button
                                    type="button"
                                    className="btn-admin btn-admin--secondary"
                                    onClick={() => setShowRoleModal(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn-admin btn-admin--primary"
                                    onClick={handleUpdateStaffRole}
                                    disabled={!selectedRole || selectedRole === showRoleModal.role}
                                >
                                    Update Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StaffPermissionsTab;
