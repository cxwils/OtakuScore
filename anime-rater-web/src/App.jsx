import { useState, useEffect } from 'react';
import './App.css';
import AnimeDetail from './AnimeDetail.jsx';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

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

    const handleRemoveFromWatchlist = (animeId) => {
        fetch(`http://localhost:5094/api/watchlist/${animeId}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to remove from watchlist');
                setWatchlist((prev) => prev.filter((entry) => entry.animeId !== animeId));
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetch(`http://localhost:5094/api/anime?page=${animePage}&pageSize=25`)
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
                setError(err.message);
                setLoading(false);
            });
    }, [animePage]);

    useEffect(() => {
        fetch('http://localhost:5094/api/anime/hottest')
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
        document.body.classList.toggle('light-mode', !darkMode);
    }, [darkMode]);

    useEffect(() => {
        fetch('http://localhost:5094/api/watchlist')
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
    }, [activeTab]);

    const handleHottestClick = (anilistId) => {
        fetch(`http://localhost:5094/api/anime/import-one/${anilistId}`, {
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
            </header>

            <main>
                <Routes>
                    <Route path="/" element={
                        <>
                            {activeTab === 'Home' && (
                                <>
                                    <h2 className="section-heading">Hottest Anime of the Year</h2>
                                    {hottestLoading && <p className="status-message">Loading library…</p>}
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
                                                            <span className="seal">{anime.aniListScore ?? '—'}</span>
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
                                    {loading && <p className="status-message">Loading library…</p>}
                                    {error && <p className="status-message error">Error: {error}</p>}
                                    {!loading && !error && (
                                        <>
                                            <div className="anime-grid">
                                                {animeList.map((anime) => (
                                                    <Link to={`/anime/${anime.id}`} key={anime.id} className="card-link">
                                                        <article className="anime-card">
                                                            {anime.imageUrl && (
                                                                <img src={anime.imageUrl} alt={anime.title} className="anime-poster" />
                                                            )}
                                                            <div className="card-top">
                                                                <h2>{anime.title}</h2>
                                                                <span className="seal">{anime.aniListScore ?? '—'}</span>
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
                                    {watchlistLoading && <p className="status-message">Loading your list…</p>}
                                    {watchlistError && <p className="status-message error">Error: {watchlistError}</p>}
                                    {!watchlistLoading && !watchlistError && watchlist.length === 0 && (
                                        <p className="status-message">Your list is empty! Add anime from their detail page.</p>
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
                                </>
                            )}

                            {activeTab === 'Manga' && (
                                <p className="status-message">Manga section coming soon.</p>
                            )}

                            {activeTab === 'Characters' && (
                                <p className="status-message">Characters section coming soon.</p>
                            )}

                            {activeTab === 'Anime of the Week' && (
                                <p className="status-message">
                                    Top 25 most-watched this week — coming soon (needs a watch-count field on the backend first).
                                </p>
                            )}
                        </>
                    } />
                    <Route path="/anime/:id" element={<AnimeDetail />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;