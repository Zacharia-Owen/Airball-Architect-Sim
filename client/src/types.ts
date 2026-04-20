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

export interface QuarterScore {
    home: number;
    away: number;
}

export interface TeamInfo {
    id: number;
    name: string;
}

export interface SimulationResult {
    gameId: number;
    homeTeam: TeamInfo;
    awayTeam: TeamInfo;
    finalScore: {
        home: number;
        away: number;
    };
    quarterScores: QuarterScore[];
    boxScore: Record<string, BoxScoreEntry>;
    quarters: number;
}