import React, { useState, useEffect, useRef } from 'react';
import '../styles/components/SmartStudySearch.css';
import '../styles/components/SmartStudySearch.additions.css';
import '../styles/components/SmartStudySearch.fixes.css';
import '../styles/components/SmartStudySearch.header-fixes.css';
import '../styles/components/SmartStudySearch.icon-removal.css';
import '../styles/components/SmartStudySearch.filter-fix.css';
import '../styles/components/SmartStudySearch.comprehensive-fix.css';
import '../styles/components/SmartStudySearch.filter-alignment.css';
import '../styles/components/SmartStudySearch.comprehensive-fix.css';

// Google Custom Search API credentials
const API_KEYS = [
    'AIzaSyAeDxldznf_2iEZo3YxTvK119BySQSoynk',
    'AIzaSyCAJ7ZzMEeTJJzTkN909Utrxuk-7M5pigw',
    'AIzaSyBaaKTvTbpe-dHvujmF369mYnwL9UaabSg'
    // Add more API keys here when you create them
];
const SEARCH_ENGINE_ID = '77527bee9c6944818';

// VCE subjects and common search terms for suggestions
const VCE_SUGGESTIONS = [
    // English
    'VCE English text response',
    'VCE English language analysis',
    'VCE English practice essays',
    'VCE English example A+ essays',
    
    // Mathematics
    'VCE Methods exam solutions',
    'VCE Further Mathematics cheat sheet',
    'VCE Specialist Mathematics practice',
    'VCE Mathematics formulas',
    
    // Sciences
    'VCE Physics practice exams',
    'VCE Chemistry data book',
    'VCE Biology notes',
    'VCE Psychology study guide',
    
    // Humanities
    'VCE History revolutions notes',
    'VCE Legal Studies case summaries',
    'VCE Economics practice questions',
    'VCE Geography fieldwork examples',
    
    // Languages
    'VCE Japanese oral exam tips',
    'VCE French conjugation tables',
    'VCE Chinese vocabulary list',
    'VCE Italian listening practice',
    
    // Arts
    'VCE Studio Arts folio examples',
    'VCE Visual Communication design process',
    'VCE Media analysis techniques',
    'VCE Music performance tips'
];

const SmartStudySearch = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);
    const [filters, setFilters] = useState({
        vceOnly: true,
        includeVideos: true,
        includeDocuments: true
    });
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [searchCache, setSearchCache] = useState({});
    
    const searchInputRef = useRef(null);

    // Load recent searches from localStorage on component mount
    useEffect(() => {
        try {
            const savedSearches = localStorage.getItem('recent-searches');
            if (savedSearches) {
                setRecentSearches(JSON.parse(savedSearches));
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }

        // Focus the search input when component mounts
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    // Save recent searches to localStorage when they change
    useEffect(() => {
        try {
            localStorage.setItem('recent-searches', JSON.stringify(recentSearches));
        } catch (error) {
            console.error('Error saving recent searches:', error);
        }
    }, [recentSearches]);

    // Handle search form submission
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        
        // Require at least 2 characters for search
        if (!query.trim() || query.trim().length < 2) return;

        setIsLoading(true);
        setError(null);

        try {
            // Construct the query parameters based on filters
            let searchQuery = query;
            if (filters.vceOnly) {
                searchQuery += ' VCE study';
            }

            // Build file type restrictions based on filters
            let fileTypeParam = '';
            if (!filters.includeVideos && filters.includeDocuments) {
                fileTypeParam = '&fileType=pdf,doc,docx,ppt,pptx';
            } else if (filters.includeVideos && !filters.includeDocuments) {
                fileTypeParam = '&fileType=mp4,avi,mov';
            }

            // Create a cache key based on the current query and filters
            const cacheKey = `${searchQuery}${fileTypeParam}`;
            
            // Check if we have cached results
            if (searchCache[cacheKey]) {
                console.log('Using cached results');
                setResults(searchCache[cacheKey]);
                setIsLoading(false);
                
                // Still add to recent searches
                addToRecentSearches(query.trim());
                return;
            }

            // Get current API key index or default to 0
            let currentIndex = parseInt(localStorage.getItem('api-key-index') || '0');
            if (isNaN(currentIndex) || currentIndex >= API_KEYS.length) {
                currentIndex = 0;
            }
            
            // Get current API key
            const currentApiKey = API_KEYS[currentIndex];
            
            // Move to next key for next search
            currentIndex = (currentIndex + 1) % API_KEYS.length;
            localStorage.setItem('api-key-index', currentIndex.toString());
            
            // Construct the API URL with the selected API key
            const url = `https://www.googleapis.com/customsearch/v1?key=${currentApiKey}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}${fileTypeParam}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'Search failed');
            }

            const searchResults = data.items || [];
            
            // Cache the results
            setSearchCache(prevCache => ({
                ...prevCache,
                [cacheKey]: searchResults
            }));
            
            setResults(searchResults);

            // Add to recent searches if not already present
            addToRecentSearches(query.trim());
            
        } catch (error) {
            console.error('Error performing search:', error);
            setError(error.message || 'An error occurred while searching. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Helper function to add to recent searches
    const addToRecentSearches = (searchTerm) => {
        if (!recentSearches.includes(searchTerm)) {
            setRecentSearches(prevSearches => {
                const updatedSearches = [searchTerm, ...prevSearches.slice(0, 9)];
                return updatedSearches;
            });
        }
    };

    // Clear search
    const clearSearch = () => {
        setQuery('');
        setResults([]);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, checked } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: checked
        }));
        
        // Trigger search with updated filters if there's a query
        if (query.trim()) {
            // Small delay to allow state to update
            setTimeout(() => handleSearch(), 100);
        }
    };

    // Handle click on a recent search tag
    const handleRecentSearchClick = (searchTerm) => {
        setQuery(searchTerm);
        // Wait for state update and then trigger search
        setTimeout(() => handleSearch(), 0);
    };

    // Handle keyboard shortcut for closing (Escape key)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        // Add class to body to prevent background scrolling
        document.body.classList.add('smart-search-active');
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // Remove class when component unmounts
            document.body.classList.remove('smart-search-active');
        };
    }, [onClose]);

    return (
        <div className="smart-study-search animated-container fade-in-up">
            <div className="search-header">
                <div className="search-header-content">
                    <div className="search-title">
                        <div className="search-icon">🔍</div>
                        <h1>Smart Study Search</h1>
                        <span className="vce-badge">VCE</span>
                    </div>
                    <button className="close-button" onClick={onClose} title="Close (Esc)">
                        ✕
                    </button>
                </div>
            </div>

            <div className="smart-study-search-content">
                <div className="search-container">
                    <form className="search-form" onSubmit={handleSearch}>
                            <div className="search-input-container">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search for VCE study materials, practice exams, notes..."
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    // Clear previous timeout
                                    if (searchTimeout) {
                                        clearTimeout(searchTimeout);
                                    }
                                    // Set a new timeout to trigger search after 800ms of user inactivity
                                    if (e.target.value.trim().length >= 3) {
                                        const timeout = setTimeout(() => {
                                            handleSearch();
                                        }, 800);
                                        setSearchTimeout(timeout);
                                    } else {
                                        // Clear results if search box is emptied or too short
                                        setResults([]);
                                    }
                                }}
                                ref={searchInputRef}
                                disabled={isLoading}
                                aria-label="Search for VCE study materials"
                            />
                            {query && (
                                <button
                                    type="button"
                                    className="clear-search-button"
                                    onClick={clearSearch}
                                    title="Clear search"
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="search-button"
                            disabled={isLoading || !query.trim()}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    <div className="filters">
                        <div className="filter-item">
                            <input
                                type="checkbox"
                                id="vceOnly"
                                name="vceOnly"
                                checked={filters.vceOnly}
                                onChange={handleFilterChange}
                            />
                            <label htmlFor="vceOnly">VCE-related content only</label>
                        </div>
                        <div className="filter-item">
                            <input
                                type="checkbox"
                                id="includeVideos"
                                name="includeVideos"
                                checked={filters.includeVideos}
                                onChange={handleFilterChange}
                            />
                            <label htmlFor="includeVideos">Include videos</label>
                        </div>
                        <div className="filter-item">
                            <input
                                type="checkbox"
                                id="includeDocuments"
                                name="includeDocuments"
                                checked={filters.includeDocuments}
                                onChange={handleFilterChange}
                            />
                            <label htmlFor="includeDocuments">Include documents (PDF, PPT, etc.)</label>
                        </div>
                    </div>

                    {recentSearches.length > 0 && (
                        <div className="recent-searches">
                            <h4>Recent Searches</h4>
                            <div className="recent-search-tags">
                                {recentSearches.map((search, index) => (
                                    <span
                                        key={index}
                                        className="recent-search-tag"
                                        onClick={() => handleRecentSearchClick(search)}
                                    >
                                        {search}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-message">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="search-results-loader">
                        <div className="loader"></div>
                        <p>Searching for the best study resources...</p>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="search-results">
                        <h3 className="results-title">Search Results</h3>
                        <div className="search-results-list">
                            {results.map((result, index) => (
                                <div key={index} className="search-result-item" style={{animationDelay: `${index * 0.05}s`}}>
                                    <h3 className="search-result-title">
                                        <a href={result.link} target="_blank" rel="noopener noreferrer">
                                            {result.title}
                                        </a>
                                    </h3>
                                    <p className="search-result-link">{result.displayLink}</p>
                                    <p className="search-result-snippet">{result.snippet}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {query && results.length === 0 && !isLoading && !error && (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>No results found</h3>
                        <p>Try adjusting your search terms or filters.</p>
                    </div>
                )}

                {!query && !results.length && (
                    <div className="search-placeholder">
                        <div className="placeholder-icon">📚</div>
                        <h3>Search for VCE study materials</h3>
                        <p>Find practice exams, study guides, notes, and more to help you excel in your VCE studies.</p>
                        
                        <div className="search-suggestions">
                            <h4>Popular VCE Subjects</h4>
                            <div className="subject-categories">
                                <div className="subject-category">
                                    <h5>English</h5>
                                    <div className="suggestion-tags">
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE English text response")}>
                                            Text Response
                                        </span>
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE English language analysis")}>
                                            Language Analysis
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="subject-category">
                                    <h5>Mathematics</h5>
                                    <div className="suggestion-tags">
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE Methods exam solutions")}>
                                            Methods
                                        </span>
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE Specialist Mathematics practice")}>
                                            Specialist
                                        </span>
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE Further Mathematics cheat sheet")}>
                                            Further
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="subject-category">
                                    <h5>Sciences</h5>
                                    <div className="suggestion-tags">
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE Physics practice exams")}>
                                            Physics
                                        </span>
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE Chemistry data book")}>
                                            Chemistry
                                        </span>
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE Biology notes")}>
                                            Biology
                                        </span>
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE Psychology study guide")}>
                                            Psychology
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="subject-category">
                                    <h5>Humanities</h5>
                                    <div className="suggestion-tags">
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE History revolutions notes")}>
                                            History
                                        </span>
                                        <span className="suggestion-tag" onClick={() => handleRecentSearchClick("VCE Legal Studies case summaries")}>
                                            Legal Studies
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <h4>Try searching for:</h4>
                            <div className="suggestion-tags">
                                <span className="suggestion-tag highlight" onClick={() => handleRecentSearchClick("VCE practice exams past papers")}>
                                    Practice Exams
                                </span>
                                <span className="suggestion-tag highlight" onClick={() => handleRecentSearchClick("VCE study guide")}>
                                    Study Guides
                                </span>
                                <span className="suggestion-tag highlight" onClick={() => handleRecentSearchClick("VCE formula sheet")}>
                                    Formula Sheets
                                </span>
                                <span className="suggestion-tag highlight" onClick={() => handleRecentSearchClick("VCE exam tips")}>
                                    Exam Tips
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartStudySearch;