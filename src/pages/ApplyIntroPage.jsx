import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import searchApiService from '../services/searchApi';

function ApplyIntroPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
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
    };

    // Handle Apply Now
    const handleApplyNow = () => {
        if (!selectedProgram) return;

        // Navigate to apply page with pre-filled program data
        navigate(`/apply?program=${selectedProgram.id}&source=intro`);
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
                    <p className="apply-intro__hero-subtitle">Knowing what you want to study is often half the challenge!</p>
                    <p className="apply-intro__hero-p">Our application hub is your command center for getting from "I like these programs" to "I am ready to prepare and submit my applications."</p>
                    <p className="apply-intro__hero-p">Once you save programs you're interested in (which you can find in our Career/Degree search and match engine), the Hub turns them into a simple step-by-step checklist including what you need to prepare/have ready, when you need it, and how to submit it (deadlines, requirements, documents, and next actions).</p>
                <p className="apply-intro__hero-p">You'll be able to upload and store key materials in your profile, track your progress across applications, and see exactly what's left to do. And if you get stuck, you can tap for our human concierge support so you're never guessing your next step. Everything stays organized in one place, so you can move forward with confidence, one step at a time.</p>
                </div>

                {/* Context & Reassurance */}
                <div className="apply-intro__context">
                    <div className="apply-intro__info-text">
                        <p><strong>Easy Steps:</strong></p>
                        <p>Our 'Career/Degree search and match engine' will generate your 'degrees I am applying for' list.This list will automatically migrate into the Hub after you complete the registration process.</p>
                        <p>Complete the initial Application Hub sign up registration (its free and privacy protected).The degrees you are interested in will automatically generate your application tracker for that degree.</p>
                        <p><strong>Our system is super strong and can handle an unlimited number of applications! Go for it!</strong></p>
                        <p>In each tracker you will find an application checklist for that degree and a checkoff system for monitoring all your documents/uploads. This has been designed to gather all the necessary elements for THAT specific degree application.</p>
                    </div>
                </div>

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


                {/* A ction Buttons */}
                <div className="apply-intro__actions">
                    <button className={`btn-primary ${!selectedProgram ? 'disabled' : ''}`}
                        disabled={!selectedProgram}
                        onClick={handleApplyNow}
                    >
                        Let's Apply!
                    </button>

                    <button
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
