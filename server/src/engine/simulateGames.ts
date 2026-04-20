import { GameState } from "../domain/GameStates";
import { resolvePossession } from "./resolution/ResolvePossession";
import { SeededRNG } from "./rng/SeedRNG";
import { simulatePossession } from "./SimulatePossession";

export interface SimulationResult {
    finalScore: {
        home: number;
        away: number;
    };
    totalPossessions: number;
    boxScore: Record<string, any>;
    gameState: GameState;
}

export function simulateGame(
    initialState: GameState,
    seed: number
): SimulationResult {
    const rng = new SeededRNG(seed);

    let state = { ...initialState };
    let totalPossessions = 0;

    while (!isGameOver(state)) {
        state = simulatePossession(state, rng);
        totalPossessions++;
    }

    return {
        finalScore: {
            home: state.score.home,
            away: state.score.away,
        },
        totalPossessions,
        boxScore: state.boxScore,
        gameState: state
    };
}

function isGameOver(state: GameState): boolean {
    return state.clock <= 0;
}
