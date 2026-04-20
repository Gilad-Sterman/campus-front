import { useState } from 'react';
import { FaChartLine, FaSearch, FaSync } from 'react-icons/fa';
import AdminLoader from '../AdminLoader';
import { useDashboardStats } from '../../../hooks/useAdminCache';
import { formatCacheAge } from '../../../utils/adminCacheUtils';

const DATE_RANGES = [
    { label: 'Last 24 Hours', value: '1d' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Custom', value: 'custom' },
];

function DashboardTab() {
    const [dateRange, setDateRange] = useState('7d');
    const [customDates, setCustomDates] = useState({ 
        start: '', 
        end: new Date().toISOString().split('T')[0] // Default to today
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Calculate date range for cache
    const getDateRange = () => {
        let startDate, endDate;
        endDate = new Date().toISOString();
        
        switch (dateRange) {
            case '1d':
                startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                break;
            case '7d':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case '30d':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'custom':
                if (customDates.start && customDates.end) {
                    startDate = new Date(customDates.start).toISOString();
                    endDate = new Date(customDates.end + 'T23:59:59').toISOString();
                } else {
                    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                }
                break;
            default:
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        }
        
        return { startDate, endDate };
    };

    const { startDate, endDate } = getDateRange();

    // Use cache hook for dashboard stats
    const {
        data: stats,
        loading,
        error,
        timestamp,
        refresh,
    } = useDashboardStats(startDate, endDate);

    const handleDateRangeChange = (e) => {
        const newRange = e.target.value;
        setDateRange(newRange);
        if (newRange === 'custom') {
            // Reset custom dates when switching to custom
            setCustomDates({ 
                start: '', 
                end: new Date().toISOString().split('T')[0] 
            });
            setHasUnsavedChanges(false);
        }
    };

    const handleCustomDateChange = (field, value) => {
        setCustomDates(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleApplyCustomDates = () => {
        if (customDates.start && customDates.end) {
            setHasUnsavedChanges(false);
            refresh();
        }
    };

    const isCustomDatesValid = customDates.start && customDates.end && customDates.start <= customDates.end;

    return (
        <div className="admin-tab">
            <div className="admin-tab__header">
                <h1><FaChartLine style={{ marginRight: '10px' }} /> Dashboard Analytics</h1>
            </div>
            
            <div className="admin-tab__filters">
                    <select
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        className="admin-form__select"
                    >
                        {DATE_RANGES.map((range) => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
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
                    
                    {dateRange === 'custom' && (
                        <div className="custom-date-inputs">
                            <input
                                type="date"
                                value={customDates.start}
                                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                className="admin-form__input"
                                placeholder="Start date"
                            />
                            <span className="date-separator">to</span>
                            <input
                                type="date"
                                value={customDates.end}
                                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                className="admin-form__input"
                                placeholder="End date"
                            />
                            <button
                                onClick={handleApplyCustomDates}
                                disabled={!isCustomDatesValid}
                                className={`custom-date-apply ${hasUnsavedChanges ? 'has-changes' : ''}`}
                                title={hasUnsavedChanges ? 'Click to apply changes' : 'Apply date range'}
                            >
                                <FaSearch />
                            </button>
                        </div>
                    )}
                </div>

            <div className="admin-tab__content">
                {loading && (
                    <div className="content-loader">
                        <AdminLoader message="Loading dashboard analytics..." />
                    </div>
                )}
                
                {error && (
                    <div className="admin-error">{error}</div>
                )}
                
                {!loading && !error && (
                    <>
                        <div className="metric-cards">
                            <div className="metric-card">
                                <div className="metric-card__label">Total Users</div>
                                <div className="metric-card__value">{stats?.totalUsers || 0}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card__label">Quiz Starts</div>
                                <div className="metric-card__value">{stats?.quizStarts || 0}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card__label">Quiz Completions</div>
                                <div className="metric-card__value">{stats?.quizCompletions || 0}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card__label">Conversion Rate</div>
                                <div className="metric-card__value">{stats?.quizConversionRate || 0}%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card__label">Total Applications</div>
                                <div className="metric-card__value">{stats?.myApplicationsTotal ?? 0}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card__label">Saved</div>
                                <div className="metric-card__value">{stats?.myApplicationsSaved ?? 0}</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-card__label">Marked Applied</div>
                                <div className="metric-card__value">{stats?.myApplicationsApplied ?? 0}</div>
                            </div>
                        </div>

                        <div className="admin-table">
                            <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid #e5e7eb' }}>
                                Top Universities by Program Count
                            </h3>
                            <div className="admin-table__wrapper">
                                {stats?.top5MyApplicationUniversities && stats.top5MyApplicationUniversities.length > 0 ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>University</th>
                                                <th>Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.top5MyApplicationUniversities.map((uni, index) => (
                                                <tr key={uni.name}>
                                                    <td>#{index + 1}</td>
                                                    <td>{uni.name}</td>
                                                    <td>{uni.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                        No university data available for the selected time period
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="admin-table">
                            <h3 style={{ padding: '16px', margin: 0, borderBottom: '1px solid #e5e7eb' }}>
                                Top 5 Programs by Applications
                            </h3>
                            <div className="admin-table__wrapper">
                                {stats?.top5MyApplicationPrograms && stats.top5MyApplicationPrograms.length > 0 ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>Program</th>
                                                <th>Applications</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.top5MyApplicationPrograms.map((program, index) => (
                                                <tr key={program.name}>
                                                    <td>#{index + 1}</td>
                                                    <td>{program.name}</td>
                                                    <td>{program.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                        No application data available for the selected time period
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            
        </div>
    );
}

export default DashboardTab;
