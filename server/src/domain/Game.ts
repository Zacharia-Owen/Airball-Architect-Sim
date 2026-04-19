export interface Game {
    id: number;
    homeTeamId: number;
    awayTeamId: number;
    scheduledAt: Date;
    isSimulated: boolean;
}