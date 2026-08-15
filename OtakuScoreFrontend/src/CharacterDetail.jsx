import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from './config.js';

function CharacterDetail() {
    const { id } = useParams();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
           fetch(`${API_BASE_URL}/api/characters/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Character not found');
                return res.json();
            })
            .then((data) => {
                setCharacter(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p className="status-message">Loading…</p>;
    if (error) return <p className="status-message error">Error: {error}</p>;
    if (!character) return null;

    return (
        <div className="detail-page">
            <Link to="/" className="back-link">← Back to library</Link>

            <div className="detail-layout">
                {character.characterImageUrl && (
                    <img
                        src={character.characterImageUrl}
                        alt={character.characterName}
                        className="detail-poster"
                    />
                )}

                <div className="detail-info">
                    <h1>{character.characterName}</h1>
                    <p className="genre-tag">Voiced by {character.voiceActorName}</p>

                    {character.characterDescription && (
                        <p className="detail-summary">{character.characterDescription}</p>
                    )}

                    {character.animeAppearances && character.animeAppearances.length > 0 && (
                        <>
                            <h2 className="section-heading">Anime</h2>
                            <div className="anime-grid">
                                {character.animeAppearances.map((appearance) => (
                                    <Link
                                        to={`/anime/${appearance.animeId}`}
                                        key={appearance.animeId}
                                        className="card-link"
                                    >
                                        <article className="anime-card">
                                            {appearance.imageUrl && (
                                                <img
                                                    src={appearance.imageUrl}
                                                    alt={appearance.title}
                                                    className="anime-poster"
                                                />
                                            )}
                                            <h2>{appearance.title}</h2>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {character.mangaAppearances && character.mangaAppearances.length > 0 && (
                        <>
                            <h2 className="section-heading">Manga</h2>
                            <div className="anime-grid">
                                {character.mangaAppearances.map((appearance) => (
                                    <Link
                                        to={`/manga/${appearance.mangaId}`}
                                        key={appearance.mangaId}
                                        className="card-link"
                                    >
                                        <article className="anime-card">
                                            {appearance.imageUrl && (
                                                <img
                                                    src={appearance.imageUrl}
                                                    alt={appearance.title}
                                                    className="anime-poster"
                                                />
                                            )}
                                            <h2>{appearance.title}</h2>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CharacterDetail;