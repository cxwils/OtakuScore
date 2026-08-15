import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { API_BASE_URL } from './config.js';

const CATEGORIES = [
    { key: 'premise', label: 'Premise' },
    { key: 'plot', label: 'Plot' },
    { key: 'characters', label: 'Characters' },
    { key: 'artStyle', label: 'Art Style' },
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
    if (score >= 85) return '#6FCF97';
    if (score >= 60) return '#E3A857';
    return '#C1495A';
}

function getUserScoreColor(score) {
    if (score === null || score === undefined) return 'var(--text-dim)';
    if (score >= 8) return '#6FCF97';
    if (score >= 6) return '#E3A857';
    return '#C1495A';
}
function MangaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [manga, setManga] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [readingStatus, setReadingStatus] = useState(null);
    const [readingSaving, setReadingSaving] = useState(false);
    const { token } = useAuth();
    const [readingListError, setReadingListError] = useState(null);

    const [reviews, setReviews] = useState([]);

    const loadData = () => {
        setLoading(true);
        Promise.all([
            fetch(`${API_BASE_URL}/api/manga/${id}`).then((res) => {
                if (!res.ok) throw new Error('Manga not found');
                return res.json();
            }),
            fetch(`${API_BASE_URL}/api/manga/${id}/rating-summary`).then((res) => {
                if (!res.ok) throw new Error('Failed to load ratings');
                return res.json();
            }),
            fetch(`${API_BASE_URL}/api/manga/${id}/reviews`).then((res) => {
                if (!res.ok) throw new Error('Failed to load reviews');
                return res.json();
            }),
        ])
            .then(([mangaData, summaryData, reviewsData]) => {
                setManga(mangaData);
                setSummary(summaryData);
                setReviews(reviewsData);
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
            mangaId: 0,
            premise: Number(formData.premise),
            plot: Number(formData.plot),
            characters: Number(formData.characters),
            artStyle: Number(formData.artStyle),
            pacing: Number(formData.pacing),
            ending: Number(formData.ending),
            bingeAbility: Number(formData.bingeAbility),
            review: formData.review,
        };

        fetch(`${API_BASE_URL}/api/manga/${id}/ratings`, {
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

    const handleAddToReadingList = (status) => {
        if (!token) {
            setReadingListError('You must be logged in to add to your reading list.');
            return;
        }
        setReadingSaving(true);
        fetch(`${API_BASE_URL}/api/readinglist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: 0, mangaId: Number(id), status }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to update reading list');
                return res.json();
            })
            .then((data) => {
                setReadingStatus(data.status);
                setReadingSaving(false);
            })
            .catch((err) => {
                setReadingListError(err.message);
                setReadingSaving(false);
            });
    };

    if (loading) return <p className="status-message">Loading…</p>;

    if (loading) return <p className="status-message">Loading…</p>;
    if (error) return <p className="status-message error">Error: {error}</p>;
    if (!manga) return null;

    return (
        <div className="detail-page">
            <Link to="/" className="back-link">← Back to library</Link>

            <div className="detail-layout">
                {manga.imageUrl && (
                    <img src={manga.imageUrl} alt={manga.title} className="detail-poster" />
                )}

                <div className="detail-info">
                    <div className="detail-title-row">
                        <h1>{manga.title}</h1>
                        <span
                            className="seal"
                            style={{
                                color: getScoreColor(manga.aniListScore),
                                borderColor: getScoreColor(manga.aniListScore),
                            }}
                        >
                            {manga.aniListScore ?? '—'}
                        </span>
                    </div>
                    <p className="genre-tag">{manga.genre}</p>

                    <div className="watchlist-controls">
                        {['Reading', 'Plan to Read', 'Completed', 'Dropped'].map((status) => (
                            <button
                                key={status}
                                className={`watchlist-button ${readingStatus === status ? 'active' : ''}`}
                                onClick={() => handleAddToReadingList(status)}
                                disabled={readingSaving}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    {readingListError && <p className="status-message error">{readingListError}</p>}

                    <div className="metadata-row">
                        {manga.format && <span className="metadata-item">{manga.format}</span>}
                        {manga.chapters && <span className="metadata-item">{manga.chapters} chapters</span>}
                        {manga.volumes && <span className="metadata-item">{manga.volumes} volumes</span>}
                        {manga.status && <span className="metadata-item">{manga.status.replaceAll('_', ' ')}</span>}
                        {manga.startYear && <span className="metadata-item">{manga.startYear}</span>}
                    </div>

                    <p className="detail-summary">{manga.summary}</p>

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
                                <li>Pacing <span>{summary.averagePacing}</span></li>
                                <li>Ending <span>{summary.averageEnding}</span></li>
                                <li>Binge-ability <span>{summary.averageBingeAbility}</span></li>
                            </ul>
                        </div>
                    )}
                    {reviews.length > 0 && (
                        <>
                            <h2 className="section-heading">Reviews</h2>
                            <div className="reviews-list">
                                {reviews.map((review) => (
                                    <div className="review-card" key={review.id}>
                                        <div
                                            className="review-score"
                                            style={{
                                                color: getUserScoreColor(review.overallScore),
                                                borderColor: getUserScoreColor(review.overallScore),
                                            }}
                                        >
                                            {review.overallScore}
                                        </div>
                                        <p className="review-text">{review.review}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {manga.mangaCastMembers && manga.mangaCastMembers.length > 0 && (
                        <>
                            <h2 className="section-heading">Cast</h2>
                            <div className="cast-grid">
                                {manga.mangaCastMembers.map((cast) => (
                                    <div
                                        className="cast-item card-link"
                                        key={cast.id}
                                        onClick={() => navigate(`/character/${cast.aniListCharacterId}`)}
                                    >
                                        {cast.characterImageUrl && (
                                            <img src={cast.characterImageUrl} alt={cast.characterName} className="cast-image" />
                                        )}
                                        <p className="cast-character">{cast.characterName}</p>
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

export default MangaDetail;