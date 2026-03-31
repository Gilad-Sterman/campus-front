import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUniversity, FaPlus, FaEdit, FaTrash, FaSync } from 'react-icons/fa';
import adminApi from '../../../services/adminApi';
import AdminLoader from '../AdminLoader';
import ImageUpload from '../../common/ImageUpload';
import { canEdit } from '../../../utils/permissions';
import { useUniversities } from '../../../hooks/useAdminCache';
import { formatCacheAge } from '../../../utils/adminCacheUtils';

const REGIONS = ['North', 'Center', 'South'];

function UniversitiesTab() {
    const { user: currentUser } = useSelector(state => state.auth);
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUniversity, setEditingUniversity] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        region: '',
        description: '',
        application_url: '',
        tuition_avg_usd: '',
        living_cost_usd: '',
        logo_url: '',
        status: 'active',
        // New fields for enhanced details page
        global_recognition: '',
        more_about: '',
        tuition_bachelor_min: '',
        tuition_bachelor_max: '',
        tuition_master_min: '',
        tuition_master_max: '',
        dorms_available: false,
        university_images: []
    });

    // Use cache hook with frontend filtering
    const {
        data: universities,
        loading,
        error,
        timestamp,
        refresh,
        invalidateCache
    } = useUniversities({
        search,
        region: regionFilter
    });

    const handleSearch = (e) => {
        e.preventDefault();
        // No API call needed - filtering happens in cache hook
    };

    const openAddForm = () => {
        setEditingUniversity(null);
        setFormData({
            name: '',
            city: '',
            region: '',
            description: '',
            application_url: '',
            tuition_avg_usd: '',
            living_cost_usd: '',
            logo_url: '',
            status: 'active',
            // New fields for enhanced details page
            global_recognition: '',
            more_about: '',
            tuition_bachelor_min: '',
            tuition_bachelor_max: '',
            tuition_master_min: '',
            tuition_master_max: '',
            dorms_available: false,
            university_images: []
        });
        setShowForm(true);
    };

    // Check if all required fields are filled
    const isFormValid = () => {
        const requiredFields = ['name', 'city', 'region', 'description', 'application_url', 'tuition_avg_usd', 'living_cost_usd', 'logo_url'];
        const fieldsFilled = requiredFields.every(field => 
            formData[field] && formData[field].toString().trim() !== ''
        );
        return fieldsFilled && formData.description.length <= 1100;
    };

    const openEditForm = (university) => {
        setEditingUniversity(university);
        setFormData({
            name: university.name || '',
            city: university.city || '',
            region: university.region || '',
            description: university.description || '',
            application_url: university.application_url || university.website_url || '',
            tuition_avg_usd: university.tuition_avg_usd || '',
            living_cost_usd: university.living_cost_usd || '',
            logo_url: university.logo_url || '',
            status: university.status || 'active',
            // New fields for enhanced details page
            global_recognition: university.global_recognition || '',
            more_about: university.more_about || '',
            tuition_bachelor_min: university.tuition_bachelor_min || '',
            tuition_bachelor_max: university.tuition_bachelor_max || '',
            tuition_master_min: university.tuition_master_min || '',
            tuition_master_max: university.tuition_master_max || '',
            dorms_available: university.dorms_available || false,
            university_images: university.university_images || []
        });
        setShowForm(true);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all mandatory fields
        const requiredFields = {
            name: 'University Name',
            city: 'City',
            region: 'Region',
            description: 'Description',
            application_url: 'Application URL',
            tuition_avg_usd: 'Tuition',
            living_cost_usd: 'Living Cost'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                alert(`${label} is required`);
                return;
            }
        }

        if (formData.description.length > 1100) {
            alert('Description must be 1100 characters or less');
            return;
        }


        try {
            const data = {
                ...formData,
                tuition_avg_usd: parseInt(formData.tuition_avg_usd),
                living_cost_usd: parseInt(formData.living_cost_usd),
                // Convert numeric fields for new tuition ranges
                tuition_bachelor_min: formData.tuition_bachelor_min ? parseInt(formData.tuition_bachelor_min) : null,
                tuition_bachelor_max: formData.tuition_bachelor_max ? parseInt(formData.tuition_bachelor_max) : null,
                tuition_master_min: formData.tuition_master_min ? parseInt(formData.tuition_master_min) : null,
                tuition_master_max: formData.tuition_master_max ? parseInt(formData.tuition_master_max) : null,
                // Ensure boolean field is properly typed
                dorms_available: Boolean(formData.dorms_available)
            };

            if (editingUniversity) {
                await adminApi.updateUniversity(editingUniversity.id, data);
            } else {
                await adminApi.createUniversity(data);
            }
            setShowForm(false);
            invalidateCache('update', 'university');
            refresh();
        } catch (err) {
            alert(err.message || 'Failed to save university');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"? This cannot be undone unless no programs are attached.`)) return;
        try {
            await adminApi.deleteUniversity(id);
            invalidateCache('delete', 'university');
            refresh();
        } catch (err) {
            alert(err.message || 'Failed to delete university');
        }
    };

    return (
        <div className="admin-tab">
            <div className="admin-tab__header">
                <h1><FaUniversity style={{ marginRight: '10px' }} /> Universities ({universities.length})</h1>
                {canEdit(currentUser?.role) && (
                    <button className="btn-admin btn-admin--primary" onClick={openAddForm}>
                        <FaPlus /> Add University
                    </button>
                )}
            </div>

            <div className="admin-tab__filters">
                <form onSubmit={handleSearch} className="admin-tab__search">
                    <input
                        type="text"
                        placeholder="Search universities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="admin-form__select"
                >
                    <option value="">All Regions</option>
                    {REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                    ))}
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
                <AdminLoader message="Loading universities..." />
            ) : error ? (
                <div className="admin-error">{error}</div>
            ) : (
                <div className="admin-table">
                    <div className="admin-table__wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Logo</th>
                                    <th>Name</th>
                                    <th>City</th>
                                    <th>Region</th>
                                    <th>Tuition</th>
                                    <th>Status</th>
                                    {canEdit(currentUser?.role) && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {universities.map((uni) => (
                                    <tr key={uni.id}>
                                        <td>
                                            {uni.logo_url ? (
                                                <img 
                                                    src={uni.logo_url} 
                                                    alt={`${uni.name} logo`}
                                                    style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666', padding: '5px' }}>
                                                    No Logo
                                                </div>
                                            )}
                                        </td>
                                        <td><strong>{uni.name}</strong></td>
                                        <td>{uni.city}</td>
                                        <td>{uni.region || '-'}</td>
                                        <td>{uni.tuition_usd || uni.tuition_avg_usd ? `$${(uni.tuition_usd || uni.tuition_avg_usd).toLocaleString()}` : '-'}</td>
                                        <td>
                                            <span className={`status-badge status-badge--${uni.status || 'active'}`}>
                                                {uni.status || 'active'}
                                            </span>
                                        </td>
                                        {canEdit(currentUser?.role) && (
                                            <td className="admin-table__actions">
                                                <button
                                                    className="btn-admin btn-admin--small btn-admin--secondary"
                                                    onClick={() => openEditForm(uni)}
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn-admin btn-admin--small btn-admin--danger"
                                                    onClick={() => handleDelete(uni.id, uni.name)}
                                                    title="Delete"
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

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="admin-modal">
                    <div className="admin-modal__content">
                        <div className="admin-modal__header">
                            <h2>{editingUniversity ? 'Edit University' : 'Add University'}</h2>
                            <button className="admin-modal__close" onClick={() => setShowForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="admin-form__group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="admin-form__group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="admin-form__group">
                                <label>Region *</label>
                                <select
                                    required
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                >
                                    <option value="">Select Region</option>
                                    {REGIONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-form__group">
                                <label>Application URL *</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.application_url}
                                    onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                                />
                            </div>
                            <div className="admin-form__group">
                                <label>Tuition (USD/year) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.tuition_avg_usd}
                                    onChange={(e) => setFormData({ ...formData, tuition_avg_usd: e.target.value })}
                                />
                            </div>
                            <div className="admin-form__group">
                                <label>Living Cost (USD/year) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.living_cost_usd}
                                    onChange={(e) => setFormData({ ...formData, living_cost_usd: e.target.value })}
                                />
                            </div>
                            <div className="admin-form__group">
                                <label>Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter university description for Career Path pages"
                                    maxLength="1100"
                                />
                                <small style={{ color: formData.description.length >= 1100 ? '#a64452' : '#666' }}>
                                    {formData.description.length}/1100 characters
                                </small>
                            </div>
                            <div className="admin-form__group">
                                <label>University Logo *</label>
                                <ImageUpload
                                    currentImageUrl={formData.logo_url}
                                    onImageUpload={(url, fileName) => {
                                        setFormData({ ...formData, logo_url: url });
                                    }}
                                    onImageRemove={() => {
                                        setFormData({ ...formData, logo_url: '' });
                                    }}
                                    bucketName="university-logos"
                                    className="university-logo-upload"
                                />
                                <small>Upload a university logo image (max 5MB, JPG/PNG/WebP/SVG)</small>
                            </div>
                            {/* Enhanced Details Page Fields */}
                            <div className="admin-form__section-title">
                                <h3>Enhanced Details Page</h3>
                                <small>Optional fields for the public university details page</small>
                            </div>
                            
                            <div className="admin-form__group">
                                <label>Global Recognition</label>
                                <textarea
                                    value={formData.global_recognition}
                                    onChange={(e) => setFormData({ ...formData, global_recognition: e.target.value })}
                                    placeholder="Global recognition text (10-500 characters)"
                                    maxLength="500"
                                />
                                <small>{formData.global_recognition.length}/500 characters</small>
                            </div>
                            
                            <div className="admin-form__group">
                                <label>More About Us</label>
                                <textarea
                                    value={formData.more_about}
                                    onChange={(e) => setFormData({ ...formData, more_about: e.target.value })}
                                    placeholder="More about us section (10-500 characters)"
                                    maxLength="500"
                                />
                                <small>{formData.more_about.length}/500 characters</small>
                            </div>
                            
                            {/* Tuition Ranges - Side by Side */}
                            <div className="admin-form__row">
                                <div className="admin-form__group admin-form__group--half">
                                    <label>Bachelor's Tuition Range (USD/year)</label>
                                    <div className="admin-form__range-inputs">
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.tuition_bachelor_min}
                                            onChange={(e) => setFormData({ ...formData, tuition_bachelor_min: e.target.value })}
                                            placeholder="Min"
                                        />
                                        <span>to</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.tuition_bachelor_max}
                                            onChange={(e) => setFormData({ ...formData, tuition_bachelor_max: e.target.value })}
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                                
                                <div className="admin-form__group admin-form__group--half">
                                    <label>Master's Tuition Range (USD/year)</label>
                                    <div className="admin-form__range-inputs">
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.tuition_master_min}
                                            onChange={(e) => setFormData({ ...formData, tuition_master_min: e.target.value })}
                                            placeholder="Min"
                                        />
                                        <span>to</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.tuition_master_max}
                                            onChange={(e) => setFormData({ ...formData, tuition_master_max: e.target.value })}
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="admin-form__group">
                                <label>University Image</label>
                                <ImageUpload
                                    currentImageUrl={formData.university_images && formData.university_images.length > 0 ? formData.university_images[0] : ''}
                                    onImageUpload={(url, fileName) => {
                                        setFormData({ ...formData, university_images: [url] });
                                    }}
                                    onImageRemove={() => {
                                        setFormData({ ...formData, university_images: [] });
                                    }}
                                    bucketName="university-logos"
                                    className="university-image-upload"
                                />
                                <small>Upload a university image for details page (max 5MB, JPG/PNG/WebP/SVG)</small>
                            </div>
                            
                            <div className="admin-form__row">
                                <div className="admin-form__group admin-form__group--half">
                                    <label>Dorms Available</label>
                                    <div className="admin-form__checkbox">
                                        <input
                                            type="checkbox"
                                            id="dorms_available"
                                            checked={formData.dorms_available}
                                            onChange={(e) => setFormData({ ...formData, dorms_available: e.target.checked })}
                                        />
                                        <label htmlFor="dorms_available">Yes, dorms are available</label>
                                    </div>
                                </div>
                                
                                <div className="admin-form__group admin-form__group--half">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="admin-form__actions">
                                <button type="button" className="btn-admin btn-admin--secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={`btn-admin btn-admin--primary ${!isFormValid() ? 'btn-admin--disabled' : ''}`}
                                    disabled={!isFormValid()}
                                >
                                    {editingUniversity ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UniversitiesTab;
