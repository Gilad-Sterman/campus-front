import { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaGraduationCap, FaPlus, FaSearch, FaEdit, FaTrash, FaSync, FaCloudUploadAlt } from 'react-icons/fa';
import adminApi from '../../../services/adminApi';
import AdminLoader from '../AdminLoader';
import ImageUpload from '../../common/ImageUpload';
import ImportProgramsModal from '../modals/ImportProgramsModal';
import { canEdit } from '../../../utils/permissions';
import { usePrograms, useUniversities } from '../../../hooks/useAdminCache';
import { formatCacheAge } from '../../../utils/adminCacheUtils';

const DOMAINS = [
    'Future Builders',
    'Human Insight & Impact',
    'Power, Policy & Influence',
    'Culture & Creativity',
    // 'Explorative Paths'
];

const DISCIPLINES = [
    'Computer Science, Data & Information Systems',
    'Engineering & Technology',
    'Natural Sciences',
    'Environmental & Sustainability Studies',
    'Health & Medicine',
    'Business, Management & Economics',
    'Government, Diplomacy & Conflict Resolution',
    'Law & Legal Studies',
    'Psychology & Brain Sciences',
    'Social Sciences',
    'Education',
    'Arts, Music & Creative Programs',
    'Humanities',
    'Jewish/Israel Studies',
    'General / Interdisciplinary Studies / short programs'
];

const CAREER_HORIZONS = [
    'AI, data, or cyber innovator',
    'Climate solutions designer',
    'Community builder or nonprofit founder',
    'Creator, artist, or cultural entrepreneur',
    'Diplomat, international negotiator',
    'Doctor, health-tech innovator, public health leader',
    'Educator, school founder, or learning designer',
    'Engineer (software, biotech, climate, medical)',
    'Entrepreneur / business leader',
    'Future paths that don\'t exist yet',
    'Gap-to-career explorers',
    'Jewish/Israel educator or cultural bridge-builder',
    'Legal advocate / human rights lawyer',
    'Media, content, or creative-strategy roles',
    'Museum, archive, or heritage innovation',
    'NGO or public-sector leader',
    'Policy advisor or strategist',
    'Portfolio careers (multiple roles over time)',
    'Product, strategy, or innovation roles',
    'Psychologist, therapist, or mental-health innovator',
    'Research scientist / applied researcher',
    'Researcher in human behavior or society',
    'Social impact leader',
    'Startup generalist / early-stage builder',
    'Tech founder / startup builder',
    'Thought leader or public intellectual',
    'UX / behavioral science roles',
    'Venture, impact investing, or economic policy roles',
    'Writer, filmmaker, journalist'
];

const DEGREE_QUALIFICATIONS = [
    'Bachelor of Arts (BA)',
    'Bachelor of Music (BMus)',
    'Bachelor of Occupational Therapy (BOT)',
    'Bachelor of Science (BSc)',
    'Bachelor of Science in Nursing (BSN)',
    'International Master of Business Administration (IMBA)',
    'International Master of Public Health (IMPH)',
    'Bachelor of Laws (LLB)',
    'Master of Arts (MA)',
    'Master of Business Administration (MBA)',
    'Master of Fine Arts (MFA)',
    'Master of Laws (LLM)',
    'International Master of Public Health / Master of Disaster Management (IMPHMDM)',
    'Bachelor of Science in Nursing / Master of Public Administration (BSNMPA)',
    'Master of Science (MSc)',
    'Doctor of Medicine (MD)',
    'Master of Disaster Management (MDM)',
    'Master of Public Administration (MPA)',
    'Master of Music (MMus)',
    'Master of Optometry (MOpt)',
    'Master of Teaching (MTeach)',
    'Master of Education (Med)'
];

const DEGREE_LEVELS = ['bachelor', 'master', 'phd'];

function ProgramsTab() {
    const { user: currentUser } = useSelector(state => state.auth);
    const [search, setSearch] = useState('');
    const [universityFilter, setUniversityFilter] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [formData, setFormData] = useState({
        university_id: '',
        name: '',
        degree_level: 'bachelor',
        degree_title: '',
        degree_qualification: '',
        discipline: '',
        domain: '',
        career_horizon: '',
        short_description: '',
        duration_text: '',
        tuition_usd: '',
        living_cost_override_usd: '',
        description: '',
        application_url: '',
        application_deadline: '',
        image_url: '',
        status: 'active'
    });

    // Use cache hooks with frontend filtering
    const {
        data: programs,
        loading: programsLoading,
        error: programsError,
        timestamp: programsTimestamp,
        refresh: refreshPrograms,
        invalidateCache: invalidateProgramsCache
    } = usePrograms({
        search,
        university_id: universityFilter,
        discipline: disciplineFilter
    });

    const {
        data: universities,
        loading: universitiesLoading,
        refresh: refreshUniversities
    } = useUniversities();

    const loading = programsLoading || universitiesLoading;
    const error = programsError;

    const handleSearch = (e) => {
        e.preventDefault();
        // Reset to first page when searching
        setCurrentPage(1);
    };

    // Reset to first page when filters change
    const handleFilterChange = (filterSetter, value) => {
        filterSetter(value);
        setCurrentPage(1);
    };

    const openAddForm = () => {
        setEditingProgram(null);
        setFormData({
            university_id: '',
            name: '',
            degree_level: 'bachelor',
            degree_title: '',
            degree_qualification: '',
            discipline: '',
            domain: '',
            career_horizon: '',
            short_description: '',
            duration_text: '',
            tuition_usd: '',
            living_cost_override_usd: '',
            description: '',
            application_url: '',
            application_deadline: '',
            image_url: '',
            status: 'active'
        });
        setShowForm(true);
    };

    const openEditForm = (program) => {
        setEditingProgram(program);
        setFormData({
            university_id: program.university_id || '',
            name: program.name || '',
            degree_level: program.degree_level || 'bachelor',
            degree_title: program.degree_title || '',
            degree_qualification: program.degree_qualification || '',
            discipline: program.discipline || '',
            domain: program.domain || '',
            career_horizon: program.career_horizon || '',
            short_description: program.short_description || '',
            duration_text: program.duration_text || '',
            tuition_usd: program.tuition_usd || '',
            living_cost_override_usd: program.living_cost_override_usd || '',
            description: program.description || '',
            application_url: program.application_url || '',
            application_deadline: program.requirements?.application_deadline || '',
            image_url: program.image_url || '',
            status: program.status || 'active'
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all required fields
        const requiredFields = {
            university_id: 'University',
            name: 'Program Name',
            degree_level: 'Degree Level',
            degree_title: 'Degree Title',
            degree_qualification: 'Degree Qualification',
            discipline: 'Discipline',
            domain: 'Domain',
            career_horizon: 'Career Horizon',
            tuition_usd: 'Tuition',
            application_url: 'Application URL'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                alert(`${label} is required`);
                return;
            }
        }

        try {
            const { application_deadline, ...rest } = formData;
            const data = {
                ...rest,
                duration_years: formData.duration_years ? parseInt(formData.duration_years) : null,
                tuition_usd: formData.tuition_usd ? parseInt(formData.tuition_usd) : null,
                living_cost_override_usd: formData.living_cost_override_usd ? parseInt(formData.living_cost_override_usd) : null,
                doc_requirements: [],
                image_url: formData.image_url || null,
                duration_text: formData.duration_text || null,
                requirements: application_deadline
                    ? { ...(editingProgram?.requirements || {}), application_deadline }
                    : (editingProgram?.requirements || null)
            };

            if (editingProgram) {
                await adminApi.updateProgram(editingProgram.id, data);
            } else {
                await adminApi.createProgram(data);
            }
            setShowForm(false);
            invalidateProgramsCache('update', 'program');
            refreshPrograms();
        } catch (err) {
            alert(err.message || 'Failed to save program');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await adminApi.deleteProgram(id);
            invalidateProgramsCache('delete', 'program');
            refreshPrograms();
        } catch (err) {
            alert(err.message || 'Failed to delete program');
        }
    };

    const getUniversityName = (universityId) => {
        const uni = universities.find(u => u.id === universityId);
        return uni?.name || 'Unknown';
    };

    const formatDegreeLevel = (level) => {
        switch (level?.toLowerCase()) {
            case 'bachelor': return 'BA';
            case 'master': return 'MA';
            case 'phd': return 'PhD';
            default: return level || '-';
        }
    };

    const formatTuition = (amount) => {
        if (!amount) return '-';
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        }
        return `$${amount.toLocaleString()}`;
    };

    // Pagination calculations
    const totalPrograms = programs.length;
    const totalPages = Math.ceil(totalPrograms / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPrograms = programs.slice(startIndex, endIndex);
    const displayStart = totalPrograms === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(endIndex, totalPrograms);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    // Pagination component that can be reused at top and bottom
    const renderPaginationControls = () => (
        totalPrograms > 0 && (
            <div className="admin-pagination">
                <div className="admin-pagination__info">
                    <span>Show </span>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                        className="admin-pagination__page-size"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span> per page</span>
                </div>

                <div className="admin-pagination__controls">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="admin-pagination__btn"
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="admin-pagination__btn"
                    >
                        Previous
                    </button>

                    <div className="admin-pagination__pages">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`admin-pagination__btn ${currentPage === pageNum ? 'admin-pagination__btn--active' : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="admin-pagination__btn"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="admin-pagination__btn"
                    >
                        Last
                    </button>
                </div>
            </div>
        )
    );

    return (
        <div className="admin-tab">
            <div className="admin-tab__header">
                <h1><FaGraduationCap style={{ marginRight: '10px' }} /> Programs ({displayStart}-{displayEnd} of {totalPrograms})</h1>
                {canEdit(currentUser?.role) && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-admin btn-admin--secondary" onClick={() => setShowImportModal(true)}>
                            <FaCloudUploadAlt style={{ marginRight: '5px' }} /> Import Programs
                        </button>
                        <button className="btn-admin btn-admin--primary" onClick={openAddForm}>
                            <FaPlus /> Add Program
                        </button>
                    </div>
                )}
            </div>

            <div className="admin-tab__filters">
                <form onSubmit={handleSearch} className="admin-tab__search">
                    <div className="search-input-wrapper" style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '32px' }}
                        />
                    </div>
                </form>
                <select
                    value={universityFilter}
                    onChange={(e) => handleFilterChange(setUniversityFilter, e.target.value)}
                    className="admin-form__select"
                >
                    <option value="">All Universities</option>
                    {universities.map((uni) => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                </select>
                <select
                    value={disciplineFilter}
                    onChange={(e) => handleFilterChange(setDisciplineFilter, e.target.value)}
                    className="admin-form__select"
                >
                    <option value="">All Disciplines</option>
                    {DISCIPLINES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <div className="admin-tab__cache-info">
                    <button
                        onClick={refreshPrograms}
                        className="btn-admin btn-admin--small btn-admin--secondary"
                        title="Refresh data"
                    >
                        <FaSync />
                    </button>
                    <span className="cache-age">
                        Last updated: {formatCacheAge(programsTimestamp)}
                    </span>
                </div>
            </div>

            {loading ? (
                <AdminLoader message="Loading programs..." />
            ) : error ? (
                <div className="admin-error">{error}</div>
            ) : (
                <div className="admin-table">
                    {/* Top Pagination Controls */}
                    {renderPaginationControls()}

                    <div className="admin-table__wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>University</th>
                                    <th>Degree</th>
                                    <th>Domain</th>
                                    <th>Career Horizon</th>
                                    <th>Tuition</th>
                                    <th>Status</th>
                                    {canEdit(currentUser?.role) && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPrograms.map((program) => (
                                    <tr key={program.id}>
                                        <td className="text-clip"><strong>{program.name}</strong></td>
                                        <td className="text-clip">{getUniversityName(program.university_id)}</td>
                                        <td>{formatDegreeLevel(program.degree_level)}</td>
                                        <td className="text-clip">{program.domain || '-'}</td>
                                        <td className="text-clip">{program.career_horizon || '-'}</td>
                                        <td>{formatTuition(program.tuition_usd)}</td>
                                        <td>
                                            <span className={`status-badge status-badge--${program.status || 'active'}`}>
                                                {program.status || 'active'}
                                            </span>
                                        </td>
                                        {canEdit(currentUser?.role) && (
                                            <td className="admin-table__actions">
                                                <button
                                                    className="btn-admin btn-admin--small btn-admin--secondary"
                                                    onClick={() => openEditForm(program)}
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn-admin btn-admin--small btn-admin--danger"
                                                    onClick={() => handleDelete(program.id, program.name)}
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

                    {/* Bottom Pagination Controls */}
                    {renderPaginationControls()}
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="admin-modal">
                    <div className="admin-modal__content">
                        <div className="admin-modal__header">
                            <h2>{editingProgram ? 'Edit Program' : 'Add Program'}</h2>
                            <button className="admin-modal__close" onClick={() => setShowForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="admin-form__row">
                                <div className="admin-form__group">
                                    <label>University *</label>
                                    <select
                                        required
                                        value={formData.university_id}
                                        onChange={(e) => setFormData({ ...formData, university_id: e.target.value })}
                                    >
                                        <option value="">Select University</option>
                                        {universities.map((uni) => (
                                            <option key={uni.id} value={uni.id}>{uni.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form__group">
                                    <label>Program Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="admin-form__group">
                                    <label>Degree Type *</label>
                                    <select
                                        required
                                        value={formData.degree_level}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            degree_level: e.target.value,
                                            degree_qualification: '' // Reset qualification when level changes
                                        })}
                                    >
                                        {DEGREE_LEVELS.map((level) => (
                                            <option key={level} value={level}>
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form__group">
                                    <label>Degree Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., BSc in Computer Science"
                                        value={formData.degree_title}
                                        onChange={(e) => setFormData({ ...formData, degree_title: e.target.value })}
                                    />
                                </div>
                                <div className="admin-form__group">
                                    <label>Degree Qualification *</label>
                                    <select
                                        required
                                        value={formData.degree_qualification}
                                        onChange={(e) => setFormData({ ...formData, degree_qualification: e.target.value })}
                                    >
                                        <option value="">Select Qualification</option>
                                        {DEGREE_QUALIFICATIONS.map((qual) => (
                                            <option key={qual} value={qual}>{qual}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form__group">
                                    <label>Discipline *</label>
                                    <select
                                        required
                                        value={formData.discipline}
                                        onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                                    >
                                        <option value="">Select Discipline</option>
                                        {DISCIPLINES.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form__group">
                                    <label>Domain *</label>
                                    <select
                                        required
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    >
                                        <option value="">Select Domain</option>
                                        {DOMAINS.map((domain) => (
                                            <option key={domain} value={domain}>{domain}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form__group admin-form__group--full">
                                    <label>Career Horizon *</label>
                                    <select
                                        required
                                        value={formData.career_horizon}
                                        onChange={(e) => setFormData({ ...formData, career_horizon: e.target.value })}
                                    >
                                        <option value="">Select Career Horizon</option>
                                        {CAREER_HORIZONS.map((career) => (
                                            <option key={career} value={career}>{career}</option>
                                        ))}
                                    </select>
                                    <small>Career direction/archetype for Application Hub filtering</small>
                                </div>
                                <div className="admin-form__group admin-form__group--full">
                                    <label>Short Description</label>
                                    <input
                                        type="text"
                                        maxLength="60"
                                        placeholder="Brief program description for search results (optional)"
                                        value={formData.short_description}
                                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    />
                                    <small>Brief description for search results (optional, max 60 characters)</small>
                                </div>
                                <div className="admin-form__group">
                                    <label>Duration</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 2 years, 18 months"
                                        value={formData.duration_text}
                                        onChange={(e) => setFormData({ ...formData, duration_text: e.target.value })}
                                    />
                                </div>
                                <div className="admin-form__group">
                                    <label>Tuition (USD/year) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.tuition_usd}
                                        onChange={(e) => setFormData({ ...formData, tuition_usd: e.target.value })}
                                    />
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
                                    <label>Application Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.application_deadline}
                                        onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                                    />
                                </div>
                                <div className="admin-form__group admin-form__group--full">
                                    <label>Description *</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="admin-form__group admin-form__group--full">
                                    <label>Program Image</label>
                                    <ImageUpload
                                        currentImageUrl={formData.image_url}
                                        onImageUpload={(url) => setFormData({ ...formData, image_url: url })}
                                        onImageRemove={() => setFormData({ ...formData, image_url: '' })}
                                        className="program-image-upload"
                                    />
                                    <small>Upload a program image (max 5MB, JPG/PNG/WebP/SVG)</small>
                                </div>
                                <div className="admin-form__group">
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
                                <button type="submit" className="btn-admin btn-admin--primary">
                                    {editingProgram ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Import Modal */}
            {showImportModal && (
                <ImportProgramsModal 
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={() => {
                        invalidateProgramsCache('update', 'program');
                        refreshPrograms();
                    }}
                />
            )}
        </div>
    );
}

export default ProgramsTab;
