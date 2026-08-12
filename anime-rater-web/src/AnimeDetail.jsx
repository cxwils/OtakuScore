import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

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

function AnimeDetail() {
    const { id } = useParams();
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


    const loadData = () => {
        setLoading(true);
        Promise.all([
            fetch(`http://localhost:5094/api/anime/${id}`).then((res) => {
                if (!res.ok) throw new Error('Anime not found');
                return res.json();
            }),
            fetch(`http://localhost:5094/api/anime/${id}/rating-summary`).then((res) => {
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

        fetch(`http://localhost:5094/api/anime/${id}/ratings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        setWatchlistSaving(true);
        fetch('http://localhost:5094/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            .catch(() => setWatchlistSaving(false));
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
                    <h1>{anime.title}</h1>
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