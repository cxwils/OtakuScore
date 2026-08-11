import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function AnimeDetail() {
    const { id } = useParams();
    const [anime, setAnime] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    }, [id]);

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
                    <p className="detail-summary">{anime.summary}</p>

                    <h2 className="section-heading">Ratings</h2>
                    {summary.ratingCount === 0 ? (
                        <p className="status-message">No ratings yet.</p>
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
                </div>
            </div>
        </div>
    );
}

export default AnimeDetail;