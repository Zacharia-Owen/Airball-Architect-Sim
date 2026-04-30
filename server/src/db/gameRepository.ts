import { pool } from "./db";
import { Game } from "../domain/Game";
import { Team } from "../domain/Team";
import { Player } from "../domain/Player";
import { Rating } from "../domain/Ratings";


export async function createGame(homeTeamId: number, awayTeamId: number): Promise<Game> {
  const result = await pool.query(
    `INSERT INTO games (home_team_id, away_team_id, scheduled_at, is_simulated)
    VALUES ($1, $2, NOW(), false)
    RETURNING id`, [homeTeamId, awayTeamId]
  );
  return result.rows[0].id;
}


// fetching a game by ID
export async function getGameById(gameId: number): Promise<Game | null> {
    const result = await pool.query(
        `SELECT id, home_team_id, away_team_id, scheduled_at, is_simulated
        FROM games
        WHERE id = $1`,
        [gameId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
        id: row.id,
        homeTeamId: row.home_team_id,
        awayTeamId: row.away_team_id,
        scheduledAt: row.scheduled_at,
        isSimulated: row.is_simulated,
    };
}

// fetching all players for a team with their ratings
export async function getPlayersByTeamId(teamId: number): Promise<Player[]> {
  const result = await pool.query(
    `SELECT 
       p.id, 
       p.first_name, 
       p.last_name, 
       p.position,
       p.shooting, 
       p.finishing, 
       p.defense, 
       p.passing,
       p.rebounding, 
       p.stamina, 
       p.speed, 
       p.dribbling, 
       p.overall
     FROM players p
     WHERE p.team_id = $1`,
    [teamId]
  );

    return result.rows.map((row): Player => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        position: row.position,
        ratings: {
            shooting: row.shooting,
            finishing: row.finishing,
            defense: row.defense,
            passing: row.passing,
            rebounding: row.rebounding,
            stamina: row.stamina,
            speed: row.speed,
            dribbling: row.dribbling,
            overall: row.overall,
        } as Rating,
  }));
}

// fetching a team with its players
export async function getTeamWithPlayers(teamId: number): Promise<Team | null> {
    const teamResult = await pool.query(
        `SELECT id, name FROM teams WHERE id = $1`,
        [teamId]
    );

    if (teamResult.rows.length === 0) return null;

    const players = await getPlayersByTeamId(teamId);

    return {
        id: teamResult.rows[0].id,
        name: teamResult.rows[0].name,
        players,
    };
}

export async function getAllTeams(): Promise<Team[]> {
    const result = await pool.query(
        `SELECT id, name FROM teams ORDER by name`
    );
    return result.rows.map((row => ({
      id: row.id,
      name: row.name,
      players: [],
    })))
  }


  export async function getPlayerById (playerId: number): Promise<Player | null> {
    const result = await pool.query(
      `SELECT
          id,
          first_name,
          last_name,
          position,
          shooting,
          finishing,
          defense,
          passing,
          rebounding,
          stamina,
          speed,
          dribbling,
          overall
        FROM players
        WHERE id = $1`,
        [playerId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      position: row.position,
      ratings: {
        shooting: row.shooting,
        finishing: row.finishing,
        defense: row.defense,
        passing: row.passing,
        rebounding: row.rebounding,
        stamina: row.stamina,
        speed: row.speed,
        dribbling: row.dribbling,
        overall: row.overall,
      },
    };
    
}


export async function getGameResult(gameId: number): Promise<any> {
  const result = await pool.query(
    `SELECT
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      result_json,
      is_simulated,
      scheduled_at
    FROM games
    WHERE id = $1`,
    [gameId]
  );
  
  if (result.rows.length === 0) return null;
  return result.rows[0];
}


// saving game result to the database
export async function saveGameResult(gameId: number, result: any) {
  await pool.query(
    `UPDATE games
     SET home_score = $1,
         away_score = $2,
         result_json = $3,
         is_simulated = true
     WHERE id = $4`,
    [
      result.score.home,
      result.score.away,
      JSON.stringify(result),
      gameId,
    ]
  );
}