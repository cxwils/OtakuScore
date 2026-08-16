import { useState, useEffect } from 'react';
import './App.css';
import AnimeDetail from './AnimeDetail.jsx';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import CharacterDetail from './CharacterDetail.jsx';
import MangaDetail from './MangaDetail.jsx';
import AuthPage from './AuthPage.jsx';
import { useAuth } from './AuthContext.jsx';
import { API_BASE_URL } from './config.js';

const TABS = ['Anime', 'Manga', 'Characters', 'Anime of the Week', 'My List'];

function App() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Home');
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(true);
    const [hottestList, setHottestList] = useState([]);
    const [hottestLoading, setHottestLoading] = useState(true);
    const [hottestError, setHottestError] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [watchlistLoading, setWatchlistLoading] = useState(true);
    const [watchlistError, setWatchlistError] = useState(null);
    const [animePage, setAnimePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [characterList, setCharacterList] = useState([]);
    const [characterLoading, setCharacterLoading] = useState(true);
    const [characterError, setCharacterError] = useState(null);
    const [characterPage, setCharacterPage] = useState(1);
    const [characterTotalPages, setCharacterTotalPages] = useState(1);
    const [characterSearch, setCharacterSearch] = useState('');
    const [mangaList, setMangaList] = useState([]);
    const [mangaLoading, setMangaLoading] = useState(true);
    const [mangaError, setMangaError] = useState(null);
    const [mangaPage, setMangaPage] = useState(1);
    const [mangaTotalPages, setMangaTotalPages] = useState(1);
    const [mangaSearch, setMangaSearch] = useState('');
    const [mangaGenreFilter, setMangaGenreFilter] = useState('');
    const [mangaSortOrder, setMangaSortOrder] = useState('');
    const [readingList, setReadingList] = useState([]);
    const [readingListLoading, setReadingListLoading] = useState(true);
    const [readingListError, setReadingListError] = useState(null);
    const [trendingList, setTrendingList] = useState([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [trendingError, setTrendingError] = useState(null);
    const { username, token, logout } = useAuth();

    function getScoreColor(score) {
        if (score === null || score === undefined) return 'var(--text-dim)';
        if (score >= 80) return '#6FCF97';
        if (score >= 60) return '#E3A857';
        return '#C1495A';
    }

    const handleRemoveFromWatchlist = (animeId) => {
        fetch(`${API_BASE_URL}/api/watchlist/${animeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to remove from watchlist');
                setWatchlist((prev) => prev.filter((entry) => entry.animeId !== animeId));
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        const controller = new AbortController();
        const params = new URLSearchParams({
            page: animePage,
            pageSize: 25,
        });
        if (searchTerm) params.append('search', searchTerm);
        if (genreFilter) params.append('genre', genreFilter);
        if (sortOrder) params.append('sort', sortOrder);

        fetch(`${API_BASE_URL}/api/anime?${params.toString()}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch anime');
                return response.json();
            })
            .then((data) => {
                setAnimeList(data.items);
                setTotalPages(data.totalPages);
                setLoading(false);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [animePage, searchTerm, genreFilter, sortOrder]);

    useEffect(() => {
        setAnimePage(1);
    }, [searchTerm, genreFilter, sortOrder]);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/anime/hottest`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch hottest anime');
                return response.json();
            })
            .then((data) => {
                setHottestList(data);
                setHottestLoading(false);
            })
            .catch((err) => {
                setHottestError(err.message);
                setHottestLoading(false);
            });
    }, []);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/anime/trending`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch trending anime');
                return response.json();
            })
            .then((data) => {
                setTrendingList(data);
                setTrendingLoading(false);
            })
            .catch((err) => {
                setTrendingError(err.message);
                setTrendingLoading(false);
            });
    }, []);

    useEffect(() => {
        document.body.classList.toggle('light-mode', !darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (!token) {
            setWatchlist([]);
            setWatchlistLoading(false);
            return;
        }
        fetch(`${API_BASE_URL}/api/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch watchlist');
                return response.json();
            })
            .then((data) => {
                setWatchlist(data);
                setWatchlistLoading(false);
            })
            .catch((err) => {
                setWatchlistError(err.message);
                setWatchlistLoading(false);
            });
    }, [activeTab, token]);

   
    useEffect(() => {
        const controller = new AbortController();
        const params = new URLSearchParams({
            page: characterPage,
            pageSize: 32,
        });
        if (characterSearch) params.append('search', characterSearch);

        fetch(`${API_BASE_URL}/api/characters?${params.toString()}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch characters');
                return response.json();
            })
            .then((data) => {
                setCharacterList(data.items);
                setCharacterTotalPages(data.totalPages);
                setCharacterLoading(false);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setCharacterError(err.message);
                    setCharacterLoading(false);
                }
            });

        return () => controller.abort();
    }, [characterPage, characterSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const params = new URLSearchParams({
            page: mangaPage,
            pageSize: 25,
        });
        if (mangaSearch) params.append('search', mangaSearch);
        if (mangaGenreFilter) params.append('genre', mangaGenreFilter);
        if (mangaSortOrder) params.append('sort', mangaSortOrder);

        fetch(`${API_BASE_URL}/api/manga?${params.toString()}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch manga');
                return response.json();
            })
            .then((data) => {
                setMangaList(data.items);
                setMangaTotalPages(data.totalPages);
                setMangaLoading(false);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setMangaError(err.message);
                    setMangaLoading(false);
                }
            });

        return () => controller.abort();
    }, [mangaPage, mangaSearch, mangaGenreFilter, mangaSortOrder]);

    useEffect(() => {
        if (!token) {
            setReadingList([]);
            setReadingListLoading(false);
            return;
        }
        fetch(`${API_BASE_URL}/api/readinglist`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch reading list');
                return response.json();
            })
            .then((data) => {
                setReadingList(data);
                setReadingListLoading(false);
            })
            .catch((err) => {
                setReadingListError(err.message);
                setReadingListLoading(false);
            });
    }, [activeTab, token]);

    const handleRemoveFromReadingList = (mangaId) => {
        fetch(`${API_BASE_URL}/api/readinglist/${mangaId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to remove from reading list');
                setReadingList((prev) => prev.filter((entry) => entry.mangaId !== mangaId));
            })
            .catch((err) => console.error(err));
    };

    const handleHottestClick = (anilistId) => {
        fetch(`${API_BASE_URL}/api/anime/import-one/${anilistId}`, {
            method: 'POST',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to import anime');
                return res.json();
            })
            .then((data) => {
                navigate(`/anime/${data.id}`);
            })
            .catch((err) => console.error(err));
    };

    return (
        <div>
            <a href="https://github.com/cxwils/OtakuScore"
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
                aria-label="View source on GitHub"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
            </a>

            <button
                className="theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle light and dark mode"
            >
                {darkMode ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                        <path
                            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                )}
            </button>

            <header className="site-header">
                <h1
                    className="logo"
                    onClick={() => {
                        setActiveTab('Home');
                        navigate('/');
                    }}
                >
                    Otaku Score
                </h1>

                <nav className="nav-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab);
                                navigate('/');
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                <div className="auth-nav-group">
                    {username ? (
                        <>
                            <button className="nav-tab" onClick={logout}>Log Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth/login" className="nav-tab">Log In</Link>
                            <Link to="/auth/register" className="nav-tab signup-tab">Sign Up</Link>
                        </>
                    )}
                </div>
            </header>

            <main>
                <Routes>
                    <Route path="/" element={
                        <>
                            {activeTab === 'Home' && (
                                <>
                                    <div className="hero">
                                        <img src="/Otaku.png" alt="Otaku Score" className="hero-logo" />
                                        <h1 className="hero-title">Welcome to Otaku Score!</h1>
                                        <p className="hero-tagline">
                                            Rate, track and search your favorite anime and manga. Explore the hottest anime of the year, discover new characters, and manage your personal watchlist all in one place.
                                        </p>
                                    </div>
                                    <h2 className="section-heading">Hottest Anime of the Year</h2>
                                    {hottestLoading && <p className="status-message">Loading library</p>}
                                    {hottestError && <p className="status-message error">Error: {hottestError}</p>}
                                    {!hottestLoading && !hottestError && (

                                        <div className="anime-grid">
                                            {hottestList.map((anime) => (
                                                <div
                                                    key={anime.anilistId}
                                                    className="card-link"
                                                    onClick={() => handleHottestClick(anime.anilistId)}
                                                >
                                                    <article className="anime-card">
                                                        {anime.imageUrl && (
                                                            <img src={anime.imageUrl} alt={anime.title} className="anime-poster" />
                                                        )}
                                                        <div className="card-top">
                                                            <h2>{anime.title}</h2>
                                                            <span
                                                                className="seal"
                                                                style={{
                                                                    color: getScoreColor(anime.aniListScore),
                                                                    borderColor: getScoreColor(anime.aniListScore),
                                                                }}
                                                            >
                                                                {anime.aniListScore ?? '-'}
                                                            </span>
                                                        </div>
                                                        <p className="genre-tag">{anime.genre}</p>
                                                        <p className="summary">{anime.summary}</p>
                                                    </article>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'Anime' && (
                                <>
                                    {loading && <p className="status-message">Loading library</p>}
                                    {error && <p className="status-message error">Error: {error}</p>}
                                    {!loading && !error && (
                                        <>
                                            <div className="filter-bar">
                                                <input
                                                    type="text"
                                                    placeholder="Search anime"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="search-input"
                                                />
                                                <select
                                                    value={genreFilter}
                                                    onChange={(e) => setGenreFilter(e.target.value)}
                                                    className="genre-select"
                                                >
                                                    <option value="">All Genres</option>
                                                    <option value="Action">Action</option>
                                                    <option value="Adventure">Adventure</option>
                                                    <option value="Comedy">Comedy</option>
                                                    <option value="Drama">Drama</option>
                                                    <option value="Fantasy">Fantasy</option>
                                                    <option value="Horror">Horror</option>
                                                    <option value="Mystery">Mystery</option>
                                                    <option value="Romance">Romance</option>
                                                    <option value="Sci-Fi">Sci-Fi</option>
                                                    <option value="Slice of Life">Slice of Life</option>
                                                    <option value="Sports">Sports</option>
                                                    <option value="Supernatural">Supernatural</option>
                                                    <option value="Thriller">Thriller</option>
                                                </select>
                                                <select
                                                    value={sortOrder}
                                                    onChange={(e) => setSortOrder(e.target.value)}
                                                    className="genre-select"
                                                >
                                                    <option value="">Default Order</option>
                                                    <option value="rating_desc">Rating: High to Low</option>
                                                    <option value="rating_asc">Rating: Low to High</option>
                                                    <option value="title_asc">Title: A to Z</option>
                                                    <option value="title_desc">Title: Z to A</option>
                                                </select>
                                            </div>
                                            <div className="anime-grid">
                                                {animeList.map((anime) => (
                                                    <Link to={`/anime/${anime.id}`} key={anime.id} className="card-link">
                                                        <article className="anime-card">
                                                            {anime.imageUrl && (
                                                                <img src={anime.imageUrl} alt={anime.title} className="anime-poster" />
                                                            )}
                                                            <div className="card-top">
                                                                <h2>{anime.title}</h2>
                                                                <span
                                                                    className="seal"
                                                                    style={{
                                                                        color: getScoreColor(anime.aniListScore),
                                                                        borderColor: getScoreColor(anime.aniListScore),
                                                                    }}
                                                                >
                                                                    {anime.aniListScore ?? '-'}
                                                                </span>
                                                            </div>
                                                            <p className="genre-tag">{anime.genre}</p>
                                                            <p className="summary">{anime.summary}</p>
                                                        </article>
                                                    </Link>
                                                ))}
                                            </div>

                                            {totalPages > 1 && (
                                                <div className="pagination">
                                                    <button
                                                        onClick={() => setAnimePage((p) => Math.max(1, p - 1))}
                                                        disabled={animePage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                    <span>Page {animePage} of {totalPages}</span>
                                                    <button
                                                        onClick={() => setAnimePage((p) => Math.min(totalPages, p + 1))}
                                                        disabled={animePage === totalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {activeTab === 'My List' && (
                                <>
                                    <h2 className="section-heading">Watchlist</h2>
                                    {watchlistLoading && <p className="status-message">Loading your list</p>}
                                    {watchlistError && <p className="status-message error">Error: {watchlistError}</p>}
                                    {!watchlistLoading && !watchlistError && watchlist.length === 0 && (
                                        <p className="status-message">Your watchlist is empty! Add anime from their detail page.</p>
                                    )}
                                    {!watchlistLoading && !watchlistError && watchlist.length > 0 && (
                                        <div className="anime-grid">
                                            {watchlist.map((entry) => (
                                                <article className="anime-card" key={entry.id}>
                                                    <Link to={`/anime/${entry.anime.id}`} className="card-link">
                                                        {entry.anime.imageUrl && (
                                                            <img src={entry.anime.imageUrl} alt={entry.anime.title} className="anime-poster" />
                                                        )}
                                                        <div className="card-top">
                                                            <h2>{entry.anime.title}</h2>
                                                            <span className="status-badge">{entry.status}</span>
                                                        </div>
                                                        <p className="genre-tag">{entry.anime.genre}</p>
                                                    </Link>
                                                    <button
                                                        className="remove-button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleRemoveFromWatchlist(entry.animeId);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </article>
                                            ))}
                                        </div>
                                    )}

                                    <h2 className="section-heading" style={{ marginTop: '48px' }}>Reading List</h2>
                                    {readingListLoading && <p className="status-message">Loading your list</p>}
                                    {readingListError && <p className="status-message error">Error: {readingListError}</p>}
                                    {!readingListLoading && !readingListError && readingList.length === 0 && (
                                        <p className="status-message">Your reading list is empty! Add manga from their detail page.</p>
                                    )}
                                    {!readingListLoading && !readingListError && readingList.length > 0 && (
                                        <div className="anime-grid">
                                            {readingList.map((entry) => (
                                                <article className="anime-card" key={entry.id}>
                                                    <Link to={`/manga/${entry.manga.id}`} className="card-link">
                                                        {entry.manga.imageUrl && (
                                                            <img src={entry.manga.imageUrl} alt={entry.manga.title} className="anime-poster" />
                                                        )}
                                                        <div className="card-top">
                                                            <h2>{entry.manga.title}</h2>
                                                            <span className="status-badge">{entry.status}</span>
                                                        </div>
                                                        <p className="genre-tag">{entry.manga.genre}</p>
                                                    </Link>
                                                    <button
                                                        className="remove-button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleRemoveFromReadingList(entry.mangaId);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'Manga' && (
                                <>
                                    <div className="filter-bar">
                                        <input
                                            type="text"
                                            placeholder="Search manga"
                                            value={mangaSearch}
                                            onChange={(e) => setMangaSearch(e.target.value)}
                                            className="search-input"
                                        />
                                        <select
                                            value={mangaGenreFilter}
                                            onChange={(e) => setMangaGenreFilter(e.target.value)}
                                            className="genre-select"
                                        >
                                            <option value="">All Genres</option>
                                            <option value="Action">Action</option>
                                            <option value="Adventure">Adventure</option>
                                            <option value="Comedy">Comedy</option>
                                            <option value="Drama">Drama</option>
                                            <option value="Fantasy">Fantasy</option>
                                            <option value="Horror">Horror</option>
                                            <option value="Mystery">Mystery</option>
                                            <option value="Romance">Romance</option>
                                            <option value="Sci-Fi">Sci-Fi</option>
                                            <option value="Slice of Life">Slice of Life</option>
                                            <option value="Sports">Sports</option>
                                            <option value="Supernatural">Supernatural</option>
                                            <option value="Thriller">Thriller</option>
                                        </select>
                                        <select
                                            value={mangaSortOrder}
                                            onChange={(e) => setMangaSortOrder(e.target.value)}
                                            className="genre-select"
                                        >
                                            <option value="">Default Order</option>
                                            <option value="rating_desc">Rating: High to Low</option>
                                            <option value="rating_asc">Rating: Low to High</option>
                                            <option value="title_asc">Title: A to Z</option>
                                            <option value="title_desc">Title: Z to A</option>
                                        </select>
                                    </div>

                                    {mangaLoading && <p className="status-message">Loading library</p>}
                                    {mangaError && <p className="status-message error">Error: {mangaError}</p>}
                                    {!mangaLoading && !mangaError && (
                                        <>
                                            <div className="anime-grid">
                                                {mangaList.map((manga) => (
                                                    <Link to={`/manga/${manga.id}`} key={manga.id} className="card-link">
                                                        <article className="anime-card">
                                                            {manga.imageUrl && (
                                                                <img src={manga.imageUrl} alt={manga.title} className="anime-poster" />
                                                            )}
                                                            <div className="card-top">
                                                                <h2>{manga.title}</h2>
                                                                <span
                                                                    className="seal"
                                                                    style={{
                                                                        color: getScoreColor(manga.aniListScore),
                                                                        borderColor: getScoreColor(manga.aniListScore),
                                                                    }}
                                                                >
                                                                    {manga.aniListScore ?? '-'}
                                                                </span>
                                                            </div>
                                                            <p className="genre-tag">{manga.genre}</p>
                                                            <p className="summary">{manga.summary}</p>
                                                        </article>
                                                    </Link>
                                                ))}
                                            </div>

                                            {mangaTotalPages > 1 && (
                                                <div className="pagination">
                                                    <button
                                                        onClick={() => setMangaPage((p) => Math.max(1, p - 1))}
                                                        disabled={mangaPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                    <span>Page {mangaPage} of {mangaTotalPages}</span>
                                                    <button
                                                        onClick={() => setMangaPage((p) => Math.min(mangaTotalPages, p + 1))}
                                                        disabled={mangaPage === mangaTotalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {activeTab === 'Characters' && (
                                <>
                                    <div className="filter-bar">
                                        <input
                                            type="text"
                                            placeholder="Search for a character or voice actor"
                                            value={characterSearch}
                                            onChange={(e) => setCharacterSearch(e.target.value)}
                                            className="search-input"
                                        />
                                    </div>

                                    {characterLoading && <p className="status-message">Loading characters</p>}
                                    {characterError && <p className="status-message error">Error: {characterError}</p>}
                                    {!characterLoading && !characterError && (
                                        <>
                                            <div className="cast-grid">
                                                {characterList.map((character) => (
                                                    <div
                                                        key={character.aniListCharacterId}
                                                        className="cast-item card-link"
                                                        onClick={() => navigate(`/character/${character.aniListCharacterId}`)}
                                                    >
                                                        {character.characterImageUrl && (
                                                            <img
                                                                src={character.characterImageUrl}
                                                                alt={character.characterName}
                                                                className="cast-image"
                                                            />
                                                        )}
                                                        <p className="cast-character">{character.characterName}</p>
                                                        <p className="cast-va">{character.voiceActorName}</p>
                                                        <p className="cast-anime">{character.animeTitle}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {characterTotalPages > 1 && (
                                                <div className="pagination">
                                                    <button
                                                        onClick={() => setCharacterPage((p) => Math.max(1, p - 1))}
                                                        disabled={characterPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                    <span>Page {characterPage} of {characterTotalPages}</span>
                                                    <button
                                                        onClick={() => setCharacterPage((p) => Math.min(characterTotalPages, p + 1))}
                                                        disabled={characterPage === characterTotalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {activeTab === 'Anime of the Week' && (
                                <>
                                    <h2 className="section-heading">Animes of the Week</h2>
                                    {trendingLoading && <p className="status-message">Loading library</p>}
                                    {trendingError && <p className="status-message error">Error: {trendingError}</p>}
                                    {!trendingLoading && !trendingError && (
                                        <div className="anime-grid">
                                            {trendingList.map((anime) => (
                                                <div
                                                    key={anime.anilistId}
                                                    className="card-link"
                                                    onClick={() => handleHottestClick(anime.anilistId)}
                                                >
                                                    <article className="anime-card">
                                                        {anime.imageUrl && (
                                                            <img src={anime.imageUrl} alt={anime.title} className="anime-poster" />
                                                        )}
                                                        <div className="card-top">
                                                            <h2>{anime.title}</h2>
                                                            <span
                                                                className="seal"
                                                                style={{
                                                                    color: getScoreColor(anime.aniListScore),
                                                                    borderColor: getScoreColor(anime.aniListScore),
                                                                }}
                                                            >
                                                                {anime.aniListScore ?? '-'}
                                                            </span>
                                                        </div>
                                                        <p className="genre-tag">{anime.genre}</p>
                                                        <p className="summary">{anime.summary}</p>
                                                    </article>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    } />
                    <Route path="/anime/:id" element={<AnimeDetail />} />
                    <Route path="/character/:id" element={<CharacterDetail />} />
                    <Route path="/manga/:id" element={<MangaDetail />} />
                    <Route path="/auth/:mode" element={<AuthPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;