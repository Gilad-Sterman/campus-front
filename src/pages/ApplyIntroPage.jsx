import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import searchApiService from '../services/searchApi';
import { useAddToMyApplications, shouldShowAddedState } from '../hooks/useAddToMyApplications';

function ApplyIntroPage() {
    const { addProgram } = useAddToMyApplications();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAdded, setShowAdded] = useState(false);
    const [expandedPrograms, setExpandedPrograms] = useState(new Set());
    const [programDescriptions, setProgramDescriptions] = useState({});
    const dropdownRef = useRef(null);

    // Handle search
    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults(null);
            setShowDropdown(false);
            return;
        }

        // Don't search if a program is already selected and query matches the selected format
        if (selectedProgram && query.includes(' - ')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await searchApiService.searchPrograms(query, { limit: 50 });
            setSearchResults(response.data);
            setShowDropdown(true);
        } catch (err) {
            setError('Failed to search programs. Please try again.');
            console.error('Search error:', err);
            setShowDropdown(false);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Handle program selection
    const handleProgramSelect = (program) => {
        setSelectedProgram(program);
        setSearchQuery(`${program.name} - ${program.university.name}`);
        setShowDropdown(false);
        setSearchResults(null); // Clear results to prevent re-searching
        setShowAdded(false);
    };

    useEffect(() => {
        setShowAdded(false);
    }, [selectedProgram?.id]);

    const handleAddToMyApplications = async () => {
        if (!selectedProgram) return;
        const result = await addProgram(selectedProgram);
        if (shouldShowAddedState(result)) {
            setShowAdded(true);
        }
    };

    // Handle More Information - Open program details page in new tab
    const handleMoreInfo = () => {
        if (!selectedProgram) return;

        // Open program details page in new tab
        const programDetailsUrl = `/program/${selectedProgram.id}`;
        window.open(programDetailsUrl, '_blank');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="apply-intro">
            {/* Hero Section */}
            <div className="apply-intro__hero">
                <h2 className="apply-intro__hero-title">APPLICATION HUB</h2>
                <div className="apply-intro__hero-image">
                    <img src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/3c87156000ef2725a26cbf4229edc495b91b69a4.png" alt="Application Hub" />
                </div>
                <h1>WELCOME TO OUR SMART APPLY APPLICATION HUB</h1>
            </div>

            <div className="apply-intro__container">
                {/* Main Description */}
                <div className="apply-intro__description">
                    <p className="apply-intro__hero-subtitle">Create a free account to start exploring what studying at a university in Israel could look like for you.</p>
                    <p className="apply-intro__hero-p">Inside the Hub you can explore degree options, access application information, start thinking through the financial side, and keep track of programs that interest you.</p>
                    <p className="apply-intro__hero-p">You can also request introductions to students already studying in Israel and get guidance from the Campus Israel Concierge whenever you want help.</p>
                    <p className="apply-intro__hero-p">You don’t have to figure this out alone. That’s why we exist. We’re here for you.</p>
                </div>

                {/* Context & Reassurance */}
                {/* <div className="apply-intro__context">
                    <div className="apply-intro__info-text">
                        <p><strong>Easy Steps:</strong></p>
                        <p>Our 'Career/Degree search and match engine' will generate your 'degrees I am applying for' list.This list will automatically migrate into the Hub after you complete the registration process.</p>
                        <p>Complete the initial Application Hub sign up registration (its free and privacy protected).The degrees you are interested in will automatically generate your application tracker for that degree.</p>
                        <p><strong>Our system is super strong and can handle an unlimited number of applications! Go for it!</strong></p>
                        <p>In each tracker you will find an application checklist for that degree and a checkoff system for monitoring all your documents/uploads. This has been designed to gather all the necessary elements for THAT specific degree application.</p>
                    </div>
                </div> */}

                {/* Search Section */}
                <div className="apply-intro__search" ref={dropdownRef}>
                    <p className="apply-intro__search-title"><strong>Search by degree, qualification, discipline, or career path</strong></p>
                    <div className="apply-intro__search-wrapper">
                        {/* <FaSearch className="apply-intro__search-icon" /> */}
                        <input
                            type="text"
                            className="apply-intro__search-input"
                            placeholder="Search by degree, qualification, discipline, or career path..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchResults && setShowDropdown(true)}
                            autoComplete="one-time-code"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                        {searchResults && (
                            <FaChevronDown
                                className={`apply-intro__dropdown-icon ${showDropdown ? 'apply-intro__dropdown-icon--open' : ''}`}
                                onClick={() => setShowDropdown(!showDropdown)}
                            />
                        )}
                    </div>

                    {loading && (
                        <div className="apply-intro__loading">
                            Searching programs...
                        </div>
                    )}

                    {error && (
                        <div className="apply-intro__error">
                            {error}
                        </div>
                    )}

                    {/* Search Results Dropdown */}
                    {searchResults && showDropdown && (
                        <div className="apply-intro__dropdown">
                            <div className="apply-intro__dropdown-header">
                                Found {searchResults.total} programs
                            </div>

                            {searchResults.grouped_results.map((group) => (
                                <div key={group.discipline} className="apply-intro__dropdown-group">
                                    <div className="apply-intro__dropdown-group-title">
                                        {group.discipline}
                                    </div>

                                    {group.programs.map((program) => (
                                        <div
                                            key={program.id}
                                            className={`apply-intro__dropdown-item ${selectedProgram?.id === program.id ? 'apply-intro__dropdown-item--selected' : ''
                                                }`}
                                            onClick={() => handleProgramSelect(program)}
                                        >
                                            <div className="apply-intro__dropdown-item-main">
                                                <span className="apply-intro__dropdown-item-name">
                                                    {program.name}
                                                </span>
                                                <span className="apply-intro__dropdown-item-degree">
                                                    {program.degree_level.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="apply-intro__dropdown-item-university">
                                                {program.university.name}, {program.university.city}
                                            </div>

                                            {program.career_horizon && (
                                                <div className="apply-intro__dropdown-item-career">
                                                    {program.career_horizon}
                                                </div>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                <div className="apply-intro__actions">
                    <button
                        type="button"
                        className={`btn-primary ${!selectedProgram ? 'disabled' : ''}`}
                        disabled={!selectedProgram || showAdded}
                        onClick={handleAddToMyApplications}
                    >
                        {showAdded ? 'Added ✓' : 'Add to My Applications'}
                    </button>

                    <button
                        type="button"
                        className={`btn-secondary ${!selectedProgram ? 'disabled' : ''}`}
                        onClick={handleMoreInfo}
                        disabled={!selectedProgram}
                    >
                        More Information
                    </button>
                </div>

                {/* Help Text */}
                {/* {!searchQuery && (
                    <div className="apply-intro__help">
                        <p>Start typing to search for programs by:</p>
                        <ul>
                            <li>Degree qualification (e.g., "MD", "BA", "MSc")</li>
                            <li>Degree title (e.g., "Psychology", "Computer Science")</li>
                            <li>Discipline (e.g., "Engineering", "Medicine")</li>
                            <li>Career horizon (e.g., "Tech Founder", "Research Scientist")</li>
                        </ul>
                    </div>
                )} */}
            </div>
        </div>
    );
}

export default ApplyIntroPage;
