export interface PlayerStats {
  playerId: string;
  teamId: string;

  minutesPlayed: number;
  possessionsPlayed: number;

  points: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;

  get fieldGoalPct(): number;
  get threePointPct(): number;
  get freeThrowPct(): number;
  get effectiveFieldGoalPct(): number; // (FGM + 0.5 * 3PM) / FGA

  assists: number;
  turnovers: number;

  steals: number;
  blocks: number;
  foulsCommitted: number;
  foulsDrawn: number;

  offensiveRebounds: number;
  defensiveRebounds: number;
  get totalRebounds(): number;

  get assistToTurnoverRatio(): number;
  get trueShootingPct(): number; // pts / (2 * (FGA + 0.44 * FTA))
}

export function createPlayerStats(playerId: string, teamId: string): PlayerStats {
  return {
    playerId,
    teamId,

    minutesPlayed: 0,
    possessionsPlayed: 0,

    points: 0,
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,

    get fieldGoalPct() {
      return this.fieldGoalsAttempted > 0
        ? this.fieldGoalsMade / this.fieldGoalsAttempted
        : 0;
    },
    get threePointPct() {
      return this.threePointersAttempted > 0
        ? this.threePointersMade / this.threePointersAttempted
        : 0;
    },
    get freeThrowPct() {
      return this.freeThrowsAttempted > 0
        ? this.freeThrowsMade / this.freeThrowsAttempted
        : 0;
    },
    get effectiveFieldGoalPct() {
      return this.fieldGoalsAttempted > 0
        ? (this.fieldGoalsMade + 0.5 * this.threePointersMade) /
            this.fieldGoalsAttempted
        : 0;
    },

    assists: 0,
    turnovers: 0,

    steals: 0,
    blocks: 0,
    foulsCommitted: 0,
    foulsDrawn: 0,

    offensiveRebounds: 0,
    defensiveRebounds: 0,
    get totalRebounds() {
      return this.offensiveRebounds + this.defensiveRebounds;
    },

    get assistToTurnoverRatio() {
      return this.turnovers > 0 ? this.assists / this.turnovers : this.assists;
    },
    get trueShootingPct() {
      const tsa = this.fieldGoalsAttempted + 0.44 * this.freeThrowsAttempted;
      return tsa > 0 ? this.points / (2 * tsa) : 0;
    },
  };
}


export interface TeamStats {
  teamId: string;

  points: number;
  pointsInPaint: number;
  pointsOffTurnovers: number;
  fastBreakPoints: number;

  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;

  get fieldGoalPct(): number;
  get threePointPct(): number;
  get freeThrowPct(): number;

  assists: number;
  turnovers: number;

  steals: number;
  blocks: number;
  foulsCommitted: number;

  offensiveRebounds: number;
  defensiveRebounds: number;
  get totalRebounds(): number;

  possessions: number;
  get pointsPerPossession(): number;
}

export function createTeamStats(teamId: string): TeamStats {
  return {
    teamId,

    points: 0,
    pointsInPaint: 0,
    pointsOffTurnovers: 0,
    fastBreakPoints: 0,

    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,

    get fieldGoalPct() {
      return this.fieldGoalsAttempted > 0
        ? this.fieldGoalsMade / this.fieldGoalsAttempted
        : 0;
    },
    get threePointPct() {
      return this.threePointersAttempted > 0
        ? this.threePointersMade / this.threePointersAttempted
        : 0;
    },
    get freeThrowPct() {
      return this.freeThrowsAttempted > 0
        ? this.freeThrowsMade / this.freeThrowsAttempted
        : 0;
    },

    assists: 0,
    turnovers: 0,

    steals: 0,
    blocks: 0,
    foulsCommitted: 0,

    offensiveRebounds: 0,
    defensiveRebounds: 0,
    get totalRebounds() {
      return this.offensiveRebounds + this.defensiveRebounds;
    },

    possessions: 0,
    get pointsPerPossession() {
      return this.possessions > 0 ? this.points / this.possessions : 0;
    },
  };
}

export interface GameStats {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;

  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;

  playerStats: Record<string, PlayerStats>;

  quarterScores: [number, number][];
}

export function createGameStats(
  gameId: string,
  homeTeamId: string,
  awayTeamId: string
): GameStats {
  return {
    gameId,
    homeTeamId,
    awayTeamId,
    homeTeamStats: createTeamStats(homeTeamId),
    awayTeamStats: createTeamStats(awayTeamId),
    playerStats: {},
    quarterScores: [],
  };
}

export function aggregateTeamStats(
  gameStats: GameStats,
  teamId: string
): TeamStats {
  const teamStat = createTeamStats(teamId);

  Object.values(gameStats.playerStats)
    .filter((p) => p.teamId === teamId)
    .forEach((p) => {
      teamStat.points += p.points;
      teamStat.fieldGoalsMade += p.fieldGoalsMade;
      teamStat.fieldGoalsAttempted += p.fieldGoalsAttempted;
      teamStat.threePointersMade += p.threePointersMade;
      teamStat.threePointersAttempted += p.threePointersAttempted;
      teamStat.freeThrowsMade += p.freeThrowsMade;
      teamStat.freeThrowsAttempted += p.freeThrowsAttempted;
      teamStat.assists += p.assists;
      teamStat.turnovers += p.turnovers;
      teamStat.steals += p.steals;
      teamStat.blocks += p.blocks;
      teamStat.foulsCommitted += p.foulsCommitted;
      teamStat.offensiveRebounds += p.offensiveRebounds;
      teamStat.defensiveRebounds += p.defensiveRebounds;
    });

  return teamStat;
}