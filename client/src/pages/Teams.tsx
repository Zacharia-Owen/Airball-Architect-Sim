import React, { useEffect, useState } from 'react';
import { Link, redirect } from 'react-router-dom';

interface Team {
    id: number;
    name: string;
}

function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/games/teams')
        .then(res => res.json())
        .then(data => {
            setTeams(data.teams);
            setLoading(false);
        })
        .catch(() => {
            setError('Failed to load teams');
            setLoading(false);
        })
    }, []);

    if (loading) return <p className="loading">Loading Teams...</p>
    if (error) return <p className="error">{error}</p>

    return (
        <div>
            <h2>Teams</h2>
            <div className="teams-grid">
                {teams.map(team => (
                    <Link
                    key={team.id}
                    to={`/teams/${team.id}`}
                    className="team-card"
                    >
                        <h3>{team.name}</h3>
                        <p>View Roster →</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Teams;