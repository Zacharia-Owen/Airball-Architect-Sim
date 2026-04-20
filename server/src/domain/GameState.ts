import { Player } from "./Player";
import { Team } from "./Team";

export type TeamSide = "home" | "away";

export interface Score {
    home: number;
    away: number;
}

export interface BoxScoreEntry {
  playerId: number;
  firstName: string;
  lastName: string;
  position: string;
  teamId: number;
  points: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  rebounds: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fouls: number;
  turnovers: number;
}

export interface TeamGameState {
  team: Team;
  players: Player[];
  activePlayers: string[];
  fouls: number;
}

export interface GameState {
  clock: number;
  quarter: number;
  score: Score;
  possession: TeamSide;
  home: TeamGameState;
  away: TeamGameState;
  boxScore: Record<string, BoxScoreEntry>;
  quarterScores: { home: number; away: number }[];
}