import { GameState } from "../../domain/GameStates";
import { SeededRNG } from "../rng/SeedRNG";
import { SHOT_TYPES } from "../../config/constants";

export type OffensiveAction = "two_point_attempt" | "three_point_attempt" | "free_throw_trip" | "shot_clock_violation" | "turnover";

export function chooseAction(
    state: GameState,
    offense: "home" | "away",
    rng: SeededRNG
): OffensiveAction {
  const players = state[offense].players;

  const activePlayers = players.filter(p => 
    state[offense].activePlayers.includes(p.id.toString())
  );
  const avgPassing = activePlayers.reduce((sum, p) => 
    sum + p.ratings.passing, 0) / activePlayers.length;
  const avgDribbling = activePlayers.reduce((sum, p) => 
    sum + p.ratings.dribbling, 0) / activePlayers.length;

  const turnoverProb = SHOT_TYPES.PROB_TURNOVER
    - (avgPassing - 50) * 0.001
    - (avgDribbling - 50) * 0.001;

  const avgShooting = activePlayers.reduce((sum, p) => 
    sum + p.ratings.shooting, 0) / activePlayers.length;
  const threeProb = SHOT_TYPES.PROB_THREE_POINT_ATTEMPT
    + (avgShooting - 50) * 0.001;


  const roll = rng.next();

  if (roll < turnoverProb) return "turnover";
  if (roll < turnoverProb + SHOT_TYPES.PROB_FREE_THROW_TRIP) return "free_throw_trip";
  if (roll < turnoverProb + SHOT_TYPES.PROB_FREE_THROW_TRIP + threeProb + SHOT_TYPES.PROB_SHOT_CLOCK_VIOLATION) return "three_point_attempt";
  return "two_point_attempt";
}