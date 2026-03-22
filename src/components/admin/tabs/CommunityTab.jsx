import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaComments, FaPlus, FaEdit, FaTrash, FaSync } from 'react-icons/fa';
import adminApi from '../../../services/adminApi';
import AdminLoader from '../AdminLoader';
import { canEdit } from '../../../utils/permissions';
import { useCommunityConfigs } from '../../../hooks/useAdminCache';
import { formatCacheAge } from '../../../utils/adminCacheUtils';

const DISCIPLINES = [
    'Business', 'Computer Science', 'Engineering', 'Medicine',
    'Law', 'Arts', 'Sciences', 'Social Sciences', 'Other'
];

const REGIONS = [
    { id: 'west', label: 'West (CA, WA, OR, NV, AZ)' },
    { id: 'south', label: 'South (TX, FL, GA, NC)' },
    { id: 'midwest', label: 'Midwest (IL, OH, MI, MN)' },
    { id: 'northeast', label: 'Northeast (NY, MA, PA, NJ)' }
];

function CommunityTab() {
    const { user: currentUser } = useSelector(state => state.auth);
    const [showForm, setShowForm] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [formData, setFormData] = useState({
        discipline: '',
        region: '',
        invite_link: ''
    });

    // Use cache hook
    const {
        data: configs,
        loading,
        error,
        timestamp,
        refresh,
        invalidateCache
    } = useCommunityConfigs();

    const validateDiscordLink = (link) => {
        if (!link) return true; // Empty is allowed
        const discordPattern = /^https:\/\/(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9]+$/;
        return discordPattern.test(link);
    };

    const openAddForm = () => {
        setEditingConfig(null);
        setFormData({
            discipline: '',
            region: '',
            invite_link: ''
        });
        setShowForm(true);
    };

    const openEditForm = (config) => {
        setEditingConfig(config);
        setFormData({
            discipline: config.discipline || '',
            region: config.region || '',
            invite_link: config.invite_link || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.invite_link && !validateDiscordLink(formData.invite_link)) {
            alert('Please enter a valid Discord invite link (e.g., https://discord.gg/XXXXX)');
            return;
        }

        try {
            await adminApi.upsertCommunityConfig(formData);
            setShowForm(false);
            invalidateCache('update', 'community');
            refresh();
        } catch (err) {
            alert(err.message || 'Failed to save community config');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this community configuration?')) return;
        try {
            await adminApi.deleteCommunityConfig(id);
            invalidateCache('delete', 'community');
            refresh();
        } catch (err) {
            alert(err.message || 'Failed to delete config');
        }
    };

    const getRegionLabel = (regionId) => {
        const region = REGIONS.find(r => r.id === regionId);
        return region?.label || regionId;
    };

    return (
        <div className="admin-tab">
            <div className="admin-tab__header">
                <h1><FaComments style={{ marginRight: '10px' }} /> Community Discord Links</h1>
                {canEdit(currentUser?.role) && (
                    <button className="btn-admin btn-admin--primary" onClick={openAddForm}>
                        <FaPlus /> Add Configuration
                    </button>
                )}
            </div>

            <div className="admin-tab__filters">
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

            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Configure Discord invite links for each discipline and region combination.
                Students will be directed to the appropriate community based on their quiz results.
            </p>

            {loading ? (
                <AdminLoader message="Loading configurations..." />
            ) : error ? (
                <div className="admin-error">{error}</div>
            ) : (
                <div className="admin-table">
                    <div className="admin-table__wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Discipline</th>
                                    <th>Region</th>
                                    <th>Discord Link</th>
                                    <th>Status</th>
                                    {canEdit(currentUser?.role) && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {configs.length === 0 ? (
                                    <tr>
                                        <td colSpan={canEdit(currentUser?.role) ? 5 : 4} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                            No community configurations yet. {canEdit(currentUser?.role) && 'Click "Add Configuration" to create one.'}
                                        </td>
                                    </tr>
                                ) : (
                                    configs.map((config) => (
                                        <tr key={config.id}>
                                            <td><strong>{config.discipline}</strong></td>
                                            <td>{getRegionLabel(config.region)}</td>
                                            <td>
                                                {config.invite_link ? (
                                                    <a href={config.invite_link} target="_blank" rel="noopener noreferrer">
                                                        {config.invite_link.substring(0, 35)}...
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#9ca3af' }}>Not configured</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${config.invite_link ? 'status-badge--active' : 'status-badge--pending'}`}>
                                                    {config.invite_link ? 'Active' : 'Pending'}
                                                </span>
                                            </td>
                                            {canEdit(currentUser?.role) && (
                                                <td className="admin-table__actions">
                                                    <button
                                                        className="btn-admin btn-admin--small btn-admin--secondary"
                                                        onClick={() => openEditForm(config)}
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                    <button
                                                        className="btn-admin btn-admin--small btn-admin--danger"
                                                        onClick={() => handleDelete(config.id)}
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Setup Grid */}
            <div style={{ marginTop: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>Configuration Matrix</h3>
                <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.875rem' }}>
                    Coverage overview - green indicates configured, yellow indicates missing.
                </p>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', borderRadius: '8px' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Discipline</th>
                                {REGIONS.map((r) => (
                                    <th key={r.id} style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.75rem' }}>
                                        {r.label.split(' ')[0]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DISCIPLINES.map((discipline) => (
                                <tr key={discipline}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{discipline}</td>
                                    {REGIONS.map((region) => {
                                        const config = configs.find(
                                            (c) => c.discipline === discipline && c.region === region.id
                                        );
                                        const hasLink = config?.invite_link;
                                        return (
                                            <td
                                                key={region.id}
                                                style={{
                                                    padding: '12px',
                                                    borderBottom: '1px solid #e5e7eb',
                                                    textAlign: 'center',
                                                    background: hasLink ? '#d1fae5' : '#fef3c7',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    if (config) {
                                                        openEditForm(config);
                                                    } else {
                                                        setFormData({ discipline, region: region.id, invite_link: '' });
                                                        setEditingConfig(null);
                                                        setShowForm(true);
                                                    }
                                                }}
                                            >
                                                {hasLink ? '✓' : '—'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="admin-modal">
                    <div className="admin-modal__content">
                        <div className="admin-modal__header">
                            <h2>{editingConfig ? 'Edit Configuration' : 'Add Configuration'}</h2>
                            <button className="admin-modal__close" onClick={() => setShowForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="admin-form__group">
                                <label>Discipline *</label>
                                <select
                                    required
                                    value={formData.discipline}
                                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                                    disabled={!!editingConfig}
                                >
                                    <option value="">Select Discipline</option>
                                    {DISCIPLINES.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-form__group">
                                <label>Region *</label>
                                <select
                                    required
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    disabled={!!editingConfig}
                                >
                                    <option value="">Select Region</option>
                                    {REGIONS.map((r) => (
                                        <option key={r.id} value={r.id}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-form__group">
                                <label>Discord Invite Link</label>
                                <input
                                    type="url"
                                    placeholder="https://discord.gg/XXXXX"
                                    value={formData.invite_link}
                                    onChange={(e) => setFormData({ ...formData, invite_link: e.target.value })}
                                />
                                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                                    Must be a valid Discord invite link (e.g., https://discord.gg/abc123)
                                </small>
                            </div>
                            <div className="admin-form__actions">
                                <button type="button" className="btn-admin btn-admin--secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-admin btn-admin--primary">
                                    {editingConfig ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CommunityTab;
