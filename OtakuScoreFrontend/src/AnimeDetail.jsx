import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { API_BASE_URL } from './config.js';


const CATEGORIES = [
    { key: 'premise', label: 'Premise' },
    { key: 'plot', label: 'Plot' },
    { key: 'characters', label: 'Characters' },
    { key: 'artStyle', label: 'Art Style' },
    { key: 'animation', label: 'Animation' },
    { key: 'pacing', label: 'Pacing' },
    { key: 'ending', label: 'Ending' },
    { key: 'bingeAbility', label: 'Binge-ability' },
];

const emptyForm = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = 5;
    return acc;
}, { review: '' });

function getScoreColor(score) {
    if (score === null || score === undefined) return 'var(--text-dim)';
    if (score >= 80) return '#6FCF97';
    if (score >= 60) return '#E3A857';
    return '#C1495A';
}

function AnimeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anime, setAnime] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [watchlistStatus, setWatchlistStatus] = useState(null);
    const [watchlistSaving, setWatchlistSaving] = useState(false);

    const { token } = useAuth();
    const [watchlistError, setWatchlistError] = useState(null);

    const loadData = () => {
        setLoading(true);
        Promise.all([
            fetch(`${API_BASE_URL}/api/anime/${id}`).then((res) => {
                if (!res.ok) throw new Error('Anime not found');
                return res.json();
            }),
            fetch(`${API_BASE_URL}/api/anime/${id}/rating-summary`).then((res) => {
                if (!res.ok) throw new Error('Failed to load ratings');
                return res.json();
            }),
        ])
            .then(([animeData, summaryData]) => {
                setAnime(animeData);
                setSummary(summaryData);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!token) {
            setSubmitError('You must be logged in to submit a rating.');
            return;
        }
        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        const payload = {
            id: 0,
            animeId: 0,
            premise: Number(formData.premise),
            plot: Number(formData.plot),
            characters: Number(formData.characters),
            artStyle: Number(formData.artStyle),
            animation: Number(formData.animation),
            pacing: Number(formData.pacing),
            ending: Number(formData.ending),
            bingeAbility: Number(formData.bingeAbility),
            review: formData.review,
        };

        fetch(`${API_BASE_URL}/api/anime/${id}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to submit rating');
                return res.json();
            })
            .then(() => {
                setSubmitting(false);
                setSubmitSuccess(true);
                setFormData(emptyForm);
                loadData();
            })
            .catch((err) => {
                setSubmitting(false);
                setSubmitError(err.message);
            });
    };
    const handleAddToWatchlist = (status) => {
        if (!token) {
            setWatchlistError('You must be logged in to add to your watchlist.');
            return;
        }
        setWatchlistSaving(true);
        fetch(`${API_BASE_URL}/api/watchlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: 0, animeId: Number(id), status }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to update watchlist');
                return res.json();
            })
            .then((data) => {
                setWatchlistStatus(data.status);
                setWatchlistSaving(false);
            })
            .catch((err) => {
                setWatchlistError(err.message);
                setWatchlistSaving(false);
            });
    };

    if (loading) return <p className="status-message">Loading…</p>;
    if (error) return <p className="status-message error">Error: {error}</p>;
    if (!anime) return null;

    return (
        <div className="detail-page">
            <Link to="/" className="back-link">← Back to library</Link>

            <div className="detail-layout">
                {anime.imageUrl && (
                    <img src={anime.imageUrl} alt={anime.title} className="detail-poster" />
                )}

                <div className="detail-info">
                    <div className="detail-title-row">
                        <h1>{anime.title}</h1>
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
                    <div className="watchlist-controls">
                        {['Watching', 'Plan to Watch', 'Completed', 'Dropped'].map((status) => (
                            <button
                                key={status}
                                className={`watchlist-button ${watchlistStatus === status ? 'active' : ''}`}
                                onClick={() => handleAddToWatchlist(status)}
                                disabled={watchlistSaving}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    {watchlistError && <p className="status-message error">{watchlistError}</p>}
                    <div className="metadata-row">
                        {anime.format && <span className="metadata-item">{anime.format}</span>}
                        {anime.episodes && <span className="metadata-item">{anime.episodes} episodes</span>}
                        {anime.duration && <span className="metadata-item">{anime.duration} min/ep</span>}
                        {anime.status && <span className="metadata-item">{anime.status.replaceAll('_', ' ')}</span>}
                        {anime.season && anime.seasonYear && (
                            <span className="metadata-item">{anime.season} {anime.seasonYear}</span>
                        )}
                        {anime.studio && <span className="metadata-item">{anime.studio}</span>}
                    </div>

                    <p className="detail-summary">{anime.summary}</p>

                    <h2 className="section-heading">Ratings</h2>
                    {summary.ratingCount === 0 ? (
                        <p className="status-message">No ratings yet — be the first.</p>
                    ) : (
                        <div className="rating-breakdown">
                            <div className="overall-score">
                                <span className="score-number">{summary.overallScore}</span>
                                <span className="score-label">Overall ({summary.ratingCount} ratings)</span>
                            </div>
                            <ul className="category-list">
                                <li>Premise <span>{summary.averagePremise}</span></li>
                                <li>Plot <span>{summary.averagePlot}</span></li>
                                <li>Characters <span>{summary.averageCharacters}</span></li>
                                <li>Art Style <span>{summary.averageArtStyle}</span></li>
                                <li>Animation <span>{summary.averageAnimation}</span></li>
                                <li>Pacing <span>{summary.averagePacing}</span></li>
                                <li>Ending <span>{summary.averageEnding}</span></li>
                                <li>Binge-ability <span>{summary.averageBingeAbility}</span></li>
                            </ul>
                        </div>
                    )}

                    {anime.castMembers && anime.castMembers.length > 0 && (
                        <>
                            <h2 className="section-heading">Cast</h2>
                            <div className="cast-grid">
                                {anime.castMembers.map((cast) => (
                                    <div
                                        className="cast-item card-link"
                                        key={cast.id}
                                        onClick={() => navigate(`/character/${cast.aniListCharacterId}`)}
                                    >
                                        {cast.characterImageUrl && (
                                            <img src={cast.characterImageUrl} alt={cast.characterName} className="cast-image" />
                                        )}
                                        <p className="cast-character">{cast.characterName}</p>
                                        <p className="cast-va">{cast.voiceActorName}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <h2 className="section-heading">Add Your Rating</h2>
                    <form className="rating-form" onSubmit={handleSubmit}>
                        {CATEGORIES.map((cat) => (
                            <div className="form-row" key={cat.key}>
                                <label htmlFor={cat.key}>{cat.label}</label>
                                <input
                                    type="range"
                                    id={cat.key}
                                    min="1"
                                    max="10"
                                    value={formData[cat.key]}
                                    onChange={(e) => handleChange(cat.key, e.target.value)}
                                />
                                <span className="form-row-value">{formData[cat.key]}</span>
                            </div>
                        ))}

                        <div className="form-row-review">
                            <label htmlFor="review">Review (optional)</label>
                            <textarea
                                id="review"
                                value={formData.review}
                                onChange={(e) => handleChange('review', e.target.value)}
                                rows="3"
                            />
                        </div>

                        <button type="submit" className="submit-button" disabled={submitting}>
                            {submitting ? 'Submitting…' : 'Submit Rating'}
                        </button>

                        {submitError && <p className="status-message error">{submitError}</p>}
                        {submitSuccess && <p className="status-message success">Rating submitted!</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AnimeDetail;