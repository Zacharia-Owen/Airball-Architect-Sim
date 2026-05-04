import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Rating {
    shooting: number;
    finishing: number;
    defense: number;
    passing: number;
    rebounding: number;
    stamina: number;
    speed: number;
    dribbling: number;
    overall: number;
}

interface PlayerData {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    ratings: Rating;
}


function RatingBar({ label, value }: { label: string; value: number }) {
    const getColor = (val: number) => {
        if (val >= 90) return '#00c853';
        if (val >= 80) return '#64dd17';
        if (val >= 70) return '#ffd600';
        if (val >= 60) return '#ff6d00';
        return '#d50000';
    };

    return (
        <div className="rating-bar-container">
            <div className="rating-bar-label">
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <div className="rating-bar-track">
                <div
                    className="rating-bar-fill"
                    style={{
                        width: `${value}%`,
                        backgroundColor: getColor(value),
                    }}
                />
            </div>
        </div>
    );
}


function Player() {
    const { id } = useParams<{ id: string }>();
    const [player, setPlayer] = useState<PlayerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/games/players/${id}`)
        .then(res => res.json())
        .then(data => {
            setPlayer(data.player);
            setLoading(false);
        })
        .catch(() => {
            setError('Failed to fetch player');
            setLoading(false);
        });
    }, [id]);

    if (loading) return <p className="loading">Loading player...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!player) return <p className="error">Player not found</p>;

    return (
        <div className="player-profile">
            <Link to={-1 as any} className="back-link">← Back</Link>

            <div className="player-header">
                <div className="player-info">
                    <h2>{player.firstName} {player.lastName}</h2>
                    <p className="player-position">{player.position}</p>
                </div>
                <div className="overall-rating">
                    <p className="overall-label">OVR</p>
                    <p className="overall-value">{player.ratings.overall}</p>
                </div>
            </div>
            <div className="ratings-card">
                <RatingBar label="Shooting" value={player.ratings.shooting} />
                <RatingBar label="Finishing" value={player.ratings.finishing} />
                <RatingBar label="Defense" value={player.ratings.defense} />
                <RatingBar label="Passing" value={player.ratings.passing} />
                <RatingBar label="Rebounding" value={player.ratings.rebounding} />
                <RatingBar label="Stamina" value={player.ratings.stamina} />
                <RatingBar label="Speed" value={player.ratings.speed} />
                <RatingBar label="Dribbling" value={player.ratings.dribbling} />
            </div>
        </div>
    );
}

export default Player;