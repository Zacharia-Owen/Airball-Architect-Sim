import React, { useState } from 'react';
import './App.css';
import { SimulationResult } from './types';

function App() {
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const simulateGame = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/games/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: 1 }),
            });

            if (!response.ok) {
                throw new Error('Simulation failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError('Failed to simulate game. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <h1>Airball Architect</h1>
            <p className="subtitle">Basketball Game Simulator</p>

            <button 
                className="simulate-btn"
                onClick={simulateGame}
                disabled={loading}
            >
                {loading ? 'Simulating...' : 'Simulate Game'}
            </button>

            {error && (
                <p className="error">{error}</p>
            )}

            {result && (
                <div className="results">

                    {/* Final Score */}
                    <div className="score-card">
                        <h2>Final Score</h2>
                        <div className="score">
                            <div className="team">
                                <p className="team-name">{result.homeTeam.name}</p>
                                <p className="team-score">{result.finalScore.home}</p>
                            </div>
                            <p className="vs">VS</p>
                            <div className="team">
                                <p className="team-name">{result.awayTeam.name}</p>
                                <p className="team-score">{result.finalScore.away}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quarter Scores */}
                    <div className="quarter-card">
                        <h2>Quarter Scores</h2>
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

                        {/* Home Team */}
                        <h3>{result.homeTeam.name}</h3>
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
                                    <th>3PT</th>
                                    <th>FT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(result.boxScore)
                                    .filter(p => p.teamId === result.homeTeam.id)
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
                                            <td>{player.threePointersMade}/{player.threePointersAttempted}</td>
                                            <td>{player.freeThrowsMade}/{player.freeThrowsAttempted}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {/* Away Team */}
                        <h3>{result.awayTeam.name}</h3>
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
                                    <th>3PT</th>
                                    <th>FT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(result.boxScore)
                                    .filter(p => p.teamId === result.awayTeam.id)
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
                                            <td>{player.threePointersMade}/{player.threePointersAttempted}</td>
                                            <td>{player.freeThrowsMade}/{player.freeThrowsAttempted}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;