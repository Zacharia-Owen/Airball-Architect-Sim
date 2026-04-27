import React , { useEffect, useState } from 'react';
import { useParams , Link } from 'react-router-dom';

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

interface Player {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    ratings: Rating;
}

interface Team {
    id: number;
    name: string;
    players: Player[];
}

function Roster() {
    const { id } = useParams<{ id: string }>();
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/games/teams/${id}/roster`)
        .then(res => res.json())
        .then(data => {
            setTeam(data.team);
            setLoading(false);
        })
        .catch(() => {
            setError('Failed to load team roster');
            setLoading(false);
        })
    }, [id]);

    if (loading) return <p className="loading">Loading roster...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!team) return <p className="error">Team not found</p>;

    return (
        <div>
            <Link to="/teams" className="back-link">← Back to Teams</Link>
            <h2>{team.name} Roster</h2>
            <table className="boxscore-table">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>POS</th>
                        <th>OVR</th>
                        <th>SHT</th>
                        <th>FIN</th>
                        <th>DEF</th>
                        <th>PAS</th>
                        <th>REB</th>
                        <th>STA</th>
                        <th>SPD</th>
                        <th>DRB</th>
                    </tr>
                </thead>
                <tbody>
                    {team.players
                    .sort((a, b) => b.ratings.overall - a.ratings.overall)
                    .map(player => (
                        <tr key={player.id}>
                            <td>{player.firstName} {player.lastName}</td>
                            <td>{player.position}</td>
                            <td className="overall-rating">{player.ratings.overall}</td>
                            <td>{player.ratings.shooting}</td>
                            <td>{player.ratings.finishing}</td>
                            <td>{player.ratings.defense}</td>
                            <td>{player.ratings.passing}</td>
                            <td>{player.ratings.rebounding}</td>
                            <td>{player.ratings.stamina}</td>
                            <td>{player.ratings.speed}</td>
                            <td>{player.ratings.dribbling}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Roster;