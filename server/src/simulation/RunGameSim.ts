import { Team } from "../domain/Team";
import { GameState } from "../domain/GameStates";
import { simulatePossession } from "../engine/SimulatePossession";
import { SeededRNG } from "../engine/rng/SeedRNG";
import { SIM, STAMINA, GAME } from "../config/constants";

// pick starters based on overall rating
function pickStarters(team: Team): string[] {
    return team.players
        .sort((a, b) => b.ratings.overall - a.ratings.overall)
        .slice(0, 5)
        .map(p => p.id.toString());
}

// check if a player needs to be subbed based on stamina
function handleSubstitutions(
    state: GameState,
    side: "home" | "away"
): string[] {
    const team = state[side];
    const activePlayers = [...team.activePlayers];

    team.players.forEach(player => {
        const isTired = player.ratings.stamina < STAMINA.SUBSTITUTION_THRESHOLD;
        const isActive = activePlayers.includes(player.id.toString());
        const isOnBench = !isActive;

        if (isTired && isActive) {
            // sub in the freshest player
            const replacement = team.players.find(p =>
                !activePlayers.includes(p.id.toString()) &&
                p.position === player.position && // try to sub same position first
                p.ratings.stamina > STAMINA.SUBSTITUTION_THRESHOLD
            );

            if (replacement) {
                const index = activePlayers.indexOf(player.id.toString());
                activePlayers[index] = replacement.id.toString();
            }
        }

        // bench players regain stamina
        if (isOnBench) {
            player.ratings.stamina = Math.min(
                100,
                player.ratings.stamina + STAMINA.RECOVERY_PER_BENCH_POSSESSION
            );
        }
    });

    return activePlayers;
}

// checking if game is in overtime
function isOvertime(state: GameState): boolean {
    return state.score.home === state.score.away && state.clock <= 0;
}

// initial game state
function buildInitialState(home: Team, away: Team): GameState {
    const initialBoxScore: Record<string, any> = {};

[...home.players, ...away.players].forEach(player => {
    const teamId = home.players.includes(player) ? home.id : away.id;
    initialBoxScore[player.id] = {
        playerId: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.position,
        teamId,
        points: 0,
        fieldGoalsMade: 0,
        fieldGoalsAttempted: 0,
        threePointersMade: 0,
        threePointersAttempted: 0,
        freeThrowsMade: 0,
        freeThrowsAttempted: 0,
        rebounds: 0,
        offensiveRebounds: 0,
        defensiveRebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
        turnovers: 0,
    };
});

    return {
        clock: GAME.QUARTER_LENGTH_SECONDS * GAME.QUARTERS,
        quarter: 1,
        score: { home: 0, away: 0 },
        possession: "home",
        home: {
            team: home,
            players: home.players,
            activePlayers: pickStarters(home),
            fouls: 0,
        },
        away: {
            team: away,
            players: away.players,
            activePlayers: pickStarters(away),
            fouls: 0,
        },
        boxScore: initialBoxScore,
        quarterScores: [],
    };
}

// Main sinmulation function
export function runGameSimulation(home: Team, away: Team): GameState {
    const rng = new SeededRNG(SIM.DEFAULT_SEED);
    let state = buildInitialState(home, away);
    let previousQuarter = 1;
    let quarterStartScore = { home: 0, away: 0 };

    // regular game loop
    while (state.clock > 0) {
        state = simulatePossession(state, rng);

        // handle substitutions at end of each possession
        const updateHomeActive = handleSubstitutions(state, "home");
        const updateAwayActive = handleSubstitutions(state, "away");

        state = {
            ...state,
            home: { ...state.home, activePlayers: updateHomeActive },
            away: { ...state.away, activePlayers: updateAwayActive },
        };

        // checking if the quarter has changed
        if (state.quarter !== previousQuarter) {
            // recoring quarter scores
            state = {
                ...state,
                quarterScores: [
                    ...state.quarterScores,
                    {
                        home: state.score.home - quarterStartScore.home,
                        away: state.score.away - quarterStartScore.away,
                    },
                ],
            };

            // reseting quarter tracking
            quarterStartScore = { ...state.score };
            previousQuarter = state.quarter;
                    }
            }

            state = { 
                ...state,
                quarterScores: [
                    ...state.quarterScores,
                    {
                        home: state.score.home - quarterStartScore.home,
                        away: state.score.away - quarterStartScore.away,
                    }
                ]
            }
    
    // handling overtime
    while (isOvertime(state)) {
        state = {
            ...state,
            clock: GAME.OVERTIME_LENGTH_SECONDS,
        };

        while (state.clock > 0) {
            state = simulatePossession(state, rng);

            const updateHomeActive = handleSubstitutions(state, "home");
            const updateAwayActive = handleSubstitutions(state, "away");

            state = {
                ...state,
                home: { ...state.home, activePlayers: updateHomeActive },
                away: { ...state.away, activePlayers: updateAwayActive },
            };
        }
    }

    return state;
}