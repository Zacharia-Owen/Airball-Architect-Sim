import { Request, Response } from 'express';
import { runGameSimulation } from "../simulation/runGameSim"
import { getGameById, getGameResult, getAllTeams, getPlayerById, getTeamWithPlayers, saveGameResult } from "../db/gameRepository";

export async function simulateGameController(req: Request, res: Response) {
    try {
        const { gameId } = req.body;

        if (gameId === undefined || gameId === null) {
            res.status(400).json({ error: "gameId is required" });
            return;
        }

        const game = await getGameById(gameId);
        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }

        const homeTeam = await getTeamWithPlayers(game.homeTeamId);
        const awayTeam = await getTeamWithPlayers(game.awayTeamId);

        if (!homeTeam || !awayTeam) {
            res.status(404).json({ error: "Teams not found" });
            return;
        }

        const result = runGameSimulation(homeTeam, awayTeam);
        await saveGameResult(gameId, result);

        res.json({
            gameId,
            homeTeam: { id: homeTeam.id, name: homeTeam.name },
            awayTeam: { id: awayTeam.id, name: awayTeam.name },
            finalScore: result.score,
            quarterScores: result.quarterScores,
            boxScore: result.boxScore,
            quarters: result.quarter,
        });

    } catch (error) {
        console.error("Simulation error:", error);
        res.status(500).json({ error: "Simulation failed" });
    }
}

// getting past game results
export async function getGameResultController(req: Request, res: Response) {
    try {
        const gameId = parseInt(req.params.id as string);

        if (isNaN(gameId)) {
            res.status(400).json({ error: "Invalid Game ID" });
            return;
        }

        const game = await getGameResult(gameId);
        if (!game) {
            res.status(404).json({ error: "Game result not found" });
            return;
        }

        if (!game.is_simulated) {
            res.status(404).json({ error: "Game has not been simulated yet" });
            return;
        }

        res.json({
            gameID: game.id,
            homeTeamId: game.home_team_id,
            awayTeamId: game.away_team_id,
            finalScore: {
                home: game.home_score,
                away: game.away_score,
            },
            scheduledAt: game.scheduled_at,
            result: game.result_json,
        });
    } catch (error) {
        console.error('Error fetching game result:', error);
        res.status(500).json({ error: "Failed to fetch game result" });
    }
}

// getting all teams
export async function getAllTeamsController(req: Request, res: Response){
    try {
        const teams = await getAllTeams();
        res.json({ teams });
    }catch (error) {
        console.error ('Error fetching teams:', error);
        res.status(500).json({ error: "Failed to fetch teams" });
    }
}

// getting a team roster
export async function getTeamRosterController(req: Request, res: Response){
    try {
        const teamId = parseInt(req.params.id as string);

        if (isNaN(teamId)) {
            res.status(400).json({ error: "Invalid Team ID" });
            return;
        }

        const team = await getTeamWithPlayers(teamId);
        if (!team) {
            res.status(404).json({ error: "Team not found" });
            return;
        }

        res.json({ team });
    } catch (error) {
        console.error('Error fetching team roster:', error);
        res.status(500).json({ error: "Failed to fetch team roster" });
    }
}

// getting a single player
export async function getPlayerController(req: Request, res: Response){
    try {
        const playerId = parseInt(req.params.id as string);

        if (isNaN(playerId)) {
            res.status(400).json({ error: "Invalid Player ID" });
            return;
        }

        const player = await getPlayerById(playerId);
        if (!player) {
            res.status(404).json({ error: "Player not found" });
            return;
        }

        res.json({ player });

    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: "Failed to fetch player" });
    }
}