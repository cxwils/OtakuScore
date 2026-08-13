import { useState, useEffect } from 'react';
import './App.css';
import AnimeDetail from './AnimeDetail.jsx';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import CharacterDetail from './CharacterDetail.jsx';

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

    function getScoreColor(score) {
        if (score === null || score === undefined) return 'var(--text-dim)';
        if (score >= 80) return '#6FCF97';
        if (score >= 60) return '#E3A857';
        return '#C1495A';
    }

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
        const params = new URLSearchParams({
            page: animePage,
            pageSize: 25,
        });
        if (searchTerm) params.append('search', searchTerm);
        if (genreFilter) params.append('genre', genreFilter);
        if (sortOrder) params.append('sort', sortOrder);

        fetch(`http://localhost:5094/api/anime?${params.toString()}`)
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
    }, [animePage, searchTerm, genreFilter, sortOrder]);

    useEffect(() => {
        setAnimePage(1);
    }, [searchTerm, genreFilter, sortOrder]);
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

    useEffect(() => {
        const params = new URLSearchParams({
            page: characterPage,
            pageSize: 32,
        });
        if (characterSearch) params.append('search', characterSearch);

        fetch(`http://localhost:5094/api/characters?${params.toString()}`)
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
                setCharacterError(err.message);
                setCharacterLoading(false);
            });
    }, [characterPage, characterSearch]);
    useEffect(() => {
        setCharacterPage(1);
    }, [characterSearch]);

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
                                                            <span
                                                                className="seal"
                                                                style={{
                                                                    color: getScoreColor(anime.aniListScore),
                                                                    borderColor: getScoreColor(anime.aniListScore),
                                                                }}
                                                            >
                                                                {anime.aniListScore ?? '—'}
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
                                    {loading && <p className="status-message">Loading library…</p>}
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
                                                                    {anime.aniListScore ?? '—'}
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
                                    {watchlistLoading && <p className="status-message">Loading your list…</p>}
                                    {watchlistError && <p className="status-message error">Error: {watchlistError}</p>}
                                    {!watchlistLoading && !watchlistError && watchlist.length === 0 && (
                                        <p className="status-message">Your list is empty! Add an anime to your list.</p>
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

                                    {characterLoading && <p className="status-message">Loading characters…</p>}
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
                                <p className="status-message">
                                    Top 25 most-watched this week — coming soon (needs a watch-count field on the backend first).
                                </p>
                            )}
                        </>
                    } />
                    <Route path="/anime/:id" element={<AnimeDetail />} />
                    <Route path="/character/:id" element={<CharacterDetail />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;