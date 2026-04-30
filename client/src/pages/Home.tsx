import React, { useState, useEffect } from 'react';
import { SimulationResult, BoxScoreEntry } from '../types';

interface Team {
    id: number;
    name: string;
}

function Home() {
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [homeTeamId, setHomeTeamId] = useState<number | null>(null);
    const [awayTeamId, setAwayTeamId] = useState<number | null>(null);

    useEffect(() => {
        fetch('/games/teams')
            .then(res => res.json())
            .then(data => setTeams(data.teams))
            .catch(() => setError('Failed to load teams'));
    }, []);

    const simulateGame = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const gameResponse = await fetch('/games/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({homeTeamId, awayTeamId}),
            });

            if (!gameResponse.ok) throw new Error('Failed to create game');
            const gameData = await gameResponse.json();

            const  simResponse = await fetch('/games/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({gameId: gameData.gameId}),
            });
            if (!simResponse.ok) throw new Error('Simulation has failed');
            const data = await simResponse.json();
            setResult(data);
        } catch (err) {
            setError('Failed to simulate game.');
        } finally {
            setLoading(false);
        }
    };

    const calculateTeamTotals = (teamId: number): {
        points: number;
        rebounds: number;
        assists: number;
        steals: number;
        blocks: number;
        turnovers: number;
        fieldGoalsMade: number;
        fieldGoalsAttempted: number;
        threePointersMade: number;
        threePointersAttempted: number;
        freeThrowsMade: number;
        freeThrowsAttempted: number;
    } => {
        const players = Object.values(result!.boxScore).filter(
            (p): p is BoxScoreEntry => p.teamId === teamId
        );
        return { 
            points: players.reduce((sum, p) => sum + p.points, 0),
            rebounds: players.reduce((sum, p) => sum + p.rebounds, 0),
            assists: players.reduce((sum, p) => sum + p.assists, 0),
            steals: players.reduce((sum, p) => sum + p.steals, 0),
            blocks: players.reduce((sum, p) => sum + p.blocks, 0),
            turnovers: players.reduce((sum, p) => sum + p.turnovers, 0),
            fieldGoalsMade: players.reduce((sum, p) => sum + p.fieldGoalsMade, 0),
            fieldGoalsAttempted: players.reduce((sum, p) => sum + p.fieldGoalsAttempted, 0),
            threePointersMade: players.reduce((sum, p) => sum + p.threePointersMade, 0),
            threePointersAttempted: players.reduce((sum, p) => sum + p.threePointersAttempted, 0),
            freeThrowsMade: players.reduce((sum, p) => sum + p.freeThrowsMade, 0),
            freeThrowsAttempted: players.reduce((sum, p) => sum + p.freeThrowsAttempted, 0),
        }
    };

    return (
        <div>
        {/* Select a Team */}
        <div className="team-selection">
            <div className="team-select-group">
                <label>Home Team</label>
                <select
                    className="team-select"
                    value={homeTeamId ?? ''}
                    onChange={e => setHomeTeamId(Number(e.target.value))}>
                        <option value="">Select a Team</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                </select>
            </div>
            <p  className="vs">VS</p>
            
            <div className="team-select-group">
                <label>Away Team</label>
                <select
                    className="team-select"
                    value={awayTeamId ?? ''}
                    onChange={e => setAwayTeamId(Number(e.target.value))}>
                        <option value="">Select a Team</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                </select>
            </div>
        </div>
            <button
            className="simulate-btn"
            onClick={simulateGame}
            disabled={loading}
        >
            {loading ? 'Simulating...' : result ? 'Simulate Again' : 'Simulate Game'}
            </button>

            {error && (
                <p className="error">{error}</p>
            )}

            {result && (
                <div className='results'>

                    {/*The Final Score*/}
                    <div className="score-card">
                        <h2>Final Score</h2>
                        <div className="score">
                            <div className="team">
                                <p className="team-name">{result.homeTeam.name}</p>
                                <p className={`team-score ${result.finalScore.home > result.finalScore.away ? 'winning-score' : ''}`}>
                                    {result.finalScore.home}
                                </p>
                            </div>
                            <p className="vs">VS</p>
                            <div className="team">
                                <p className="team-name">{result.awayTeam.name}</p>
                                <p className={`team-score ${result.finalScore.away > result.finalScore.home ? 'winning-score' : ''}`}>
                                    {result.finalScore.away}
                                </p>
                            </div>
                        </div>
                        <p className="winner">
                            {result.finalScore.home > result.finalScore.away
                                ? `${result.homeTeam.name} Win!`
                                : result.finalScore.away > result.finalScore.home
                                ? `${result.awayTeam.name} Win!`
                                : "It's a Tie!"}
                        </p>
                    </div>

                    {/* Quarter Scores */}
                    <div className="quarter-card">
                        <h2>Quarter Score</h2>
                        <table className="quarter-table">
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    {result.quarterScores.map((_, i) => (
                                        <th key={i}>Q{i + 1}</th>
                                    ))}
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{result.homeTeam.name}</td>
                                    {result.quarterScores.map((q, i) => (
                                        <td key={i}>{q.home}</td>
                                    ))}
                                    <td>{result.finalScore.home}</td>
                                </tr>
                                <tr>
                                    <td>{result.awayTeam.name}</td>
                                    {result.quarterScores.map((q, i) => (
                                        <td key={i}>{q.away}</td>
                                    ))}
                                    <td>{result.finalScore.away}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Box Score */}
                    <div className="boxscore-card">
                        <h2>Box Score</h2>
                        {[result.homeTeam, result.awayTeam].map(team => (
                            <div key={team.id}>
                                <h3>{team.name}</h3>
                                <table className="boxscore-table">
                                    <thead>
                                        <tr>
                                            <th>Player</th>
                                            <th>POS</th>
                                            <th>PTS</th>
                                            <th>REB</th>
                                            <th>AST</th>
                                            <th>STL</th>
                                            <th>BLK</th>
                                            <th>TO</th>
                                            <th>FG</th>
                                            <th>FG%</th>
                                            <th>3PT</th>
                                            <th>FT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.values(result.boxScore)
                                        .filter((p) : p is BoxScoreEntry => p.teamId === team.id)
                                        .sort((a, b) => b.points - a.points)
                                        .map(player => (
                                            <tr key={player.playerId}>
                                                <td>{player.firstName} {player.lastName}</td>
                                                <td>{player.position}</td>
                                                <td>{player.points}</td>
                                                <td>{player.rebounds}</td>
                                                <td>{player.assists}</td>
                                                <td>{player.steals}</td>
                                                <td>{player.blocks}</td>
                                                <td>{player.turnovers}</td>
                                                <td>{player.fieldGoalsMade}/{player.fieldGoalsAttempted}</td>
                                                <td>
                                                    {player.fieldGoalsAttempted > 0
                                                    ? ((player.fieldGoalsMade / player.fieldGoalsAttempted) * 100).toFixed(1) + '%'
                                                    : '0%'}
                                                    </td>
                                                <td>{player.threePointersMade}/{player.threePointersAttempted}</td>
                                                <td>{player.freeThrowsMade}/{player.freeThrowsAttempted}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        {(() =>  {
                                            const totals = calculateTeamTotals(team.id);
                                            return (
                                                <tr className="totals-row">
                                                    <td>Team Totals</td>
                                                    <td>-</td>
                                                    <td>{totals.points}</td>
                                                    <td>{totals.rebounds}</td>
                                                    <td>{totals.assists}</td>
                                                    <td>{totals.steals}</td>
                                                    <td>{totals.blocks}</td>
                                                    <td>{totals.turnovers}</td>
                                                    <td>{totals.fieldGoalsMade}/{totals.fieldGoalsAttempted}</td>
                                                    <td>
                                                        {totals.fieldGoalsAttempted > 0
                                                            ? ((totals.fieldGoalsMade / totals.fieldGoalsAttempted) * 100).toFixed(1) + '%'
                                                            : '0%'}
                                                    </td>
                                                    <td>{totals.threePointersMade}/{totals.threePointersAttempted}</td>
                                                    <td>{totals.freeThrowsMade}/{totals.freeThrowsAttempted}</td>

                                                </tr>
                                            );
                                        })()}
                                    </tfoot>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )


}

export default Home;