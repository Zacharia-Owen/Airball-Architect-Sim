import { GameState } from "../domain/GameState";
import { SeededRNG } from "./rng/SeedRNG";
import { chooseAction } from "./actions/ChooseActions";
import { resolvePossession } from "./resolution/resolvePossession";
import { GAME, STAMINA } from "../config/constants";

export function simulatePossession(
    state: GameState,
    rng: SeededRNG
): GameState {

    // determining who has the ball
    const offense = state.possession;
    const defense = offense === "home" ? "away" : "home";

    // deciding which action the offense takes
    const action = chooseAction(state, offense, rng);

    // resolving the action and getting the result
    const result = resolvePossession(state, action, offense, defense, rng);

    // updating the game state based on the result
    const updatedScore = {
        ...state.score,
        [offense]: state.score[offense] + result.pointsScored,
    };

    // updating the time remaining
    const updateClock = Math.max(0, state.clock - result.timeElapsed);

    // update box score
    const updatedBoxScore = { ...state.boxScore };

    // find the active player with the highest shooting rating as scorer
    const activePlayers = state[offense].players.filter(p =>
        state[offense].activePlayers.includes(p.id.toString())
    );
    const totalWeight = activePlayers.reduce((sum, p) => sum + p.ratings.shooting, 0);
    let roll = rng.next() * totalWeight;
    const scorer = activePlayers.find(p => {
        roll -= p.ratings.shooting;
        return roll <= 0;
    }) ?? activePlayers[0]; // incase of an error, just pick the first active player

    const scorerID = scorer.id.toString();

    const possibleAssisters = activePlayers.filter(p => p.id !== scorer.id);
    const assister = possibleAssisters.length > 0
        ? possibleAssisters[Math.floor(rng.next() * possibleAssisters.length)]
        : null;

    if (result.pointsScored > 0) {
        updatedBoxScore[scorerID] = {
            ...updatedBoxScore[scorerID],
            points: updatedBoxScore[scorerID]?.points + result.pointsScored,
            fieldGoalsMade: action !== "free_throw_trip"
                ? updatedBoxScore[scorerID]?.fieldGoalsMade + 1
                : updatedBoxScore[scorerID]?.fieldGoalsMade,
            fieldGoalsAttempted: action !== "free_throw_trip"
                ? updatedBoxScore[scorerID]?.fieldGoalsAttempted + 1
                : updatedBoxScore[scorerID]?.fieldGoalsAttempted,
            threePointersMade: action === "three_point_attempt"
                ? updatedBoxScore[scorerID]?.threePointersMade + 1
                : updatedBoxScore[scorerID]?.threePointersMade,
            threePointersAttempted: action === "three_point_attempt"
                ? updatedBoxScore[scorerID]?.threePointersAttempted + 1
                : updatedBoxScore[scorerID]?.threePointersAttempted,
            freeThrowsMade: action === "free_throw_trip"
                ? updatedBoxScore[scorerID]?.freeThrowsMade + result.pointsScored
                : updatedBoxScore[scorerID]?.freeThrowsMade,
            freeThrowsAttempted: action === "free_throw_trip"
                ? updatedBoxScore[scorerID]?.freeThrowsAttempted + 2
                : updatedBoxScore[scorerID]?.freeThrowsAttempted,
        };

        // recording assists if possible
        if (result.assisted && assister) {
            updatedBoxScore[assister.id.toString()] = {
                ...updatedBoxScore[assister.id.toString()],
                assists: updatedBoxScore[assister.id.toString()]?.assists + 1,
            };
        }
    } else if (action !== "turnover" && action !== "free_throw_trip") {
        updatedBoxScore[scorerID] = {
            ...updatedBoxScore[scorerID],
            fieldGoalsAttempted: updatedBoxScore[scorerID]?.fieldGoalsAttempted + 1,
            threePointersAttempted: action === "three_point_attempt"
                ? updatedBoxScore[scorerID]?.threePointersAttempted + 1
                : updatedBoxScore[scorerID]?.threePointersAttempted,
        };
    }

    // record turn overs
    if (action === "turnover") {
        updatedBoxScore[scorerID] = {
            ...updatedBoxScore[scorerID],
            turnovers: updatedBoxScore[scorerID]?.turnovers + 1,
        };
    }

    if (result.rebounderID) {
        updatedBoxScore[result.rebounderID] = {
            ...updatedBoxScore[result.rebounderID],
            rebounds: updatedBoxScore[result.rebounderID].rebounds + 1,
            offensiveRebounds: result.offensiveRebound
                ? updatedBoxScore[result.rebounderID].offensiveRebounds + 1
                : updatedBoxScore[result.rebounderID].offensiveRebounds,
            defensiveRebounds: !result.offensiveRebound
                ? updatedBoxScore[result.rebounderID].defensiveRebounds + 1
                : updatedBoxScore[result.rebounderID].defensiveRebounds,
        };
    }
    // record steals
    if (result.stolenBy) {
        updatedBoxScore[result.stolenBy] = {
            ...updatedBoxScore[result.stolenBy],
            steals: updatedBoxScore[result.stolenBy].steals + 1,
        };
    }

    // record blocks
    if (result.blockedBy) {
        updatedBoxScore[result.blockedBy] = {
            ...updatedBoxScore[result.blockedBy],
            blocks: updatedBoxScore[result.blockedBy].blocks + 1,
        };
    }

    // update stamina for active players
    const updatedHome = { ...state.home };
    const updatedAway = { ...state.away };

    [updatedHome, updatedAway].forEach(team => {
        team.players = team.players.map(p => {
            if (!team.activePlayers.includes(p.id.toString())) return p; // only updating active players

            const newStamina = Math.max(0, p.ratings.stamina - STAMINA.FATIGUE_PER_POSSESSION);
            return {
                ...p,
                ratings: { ...p.ratings, stamina: newStamina }
            };
        });
    });

    // switching possession to the other team
    const nextPossession = result.offensiveRebound ? offense : defense;

    // checking quarter transitions
    const updatedQuarter = Math.min(
        4,
        Math.floor((GAME.QUARTER_LENGTH_SECONDS * GAME.QUARTERS - updateClock) / GAME.QUARTER_LENGTH_SECONDS) + 1
    );

    // return to fully updated state of the game
    return {
        ...state,
        clock: updateClock,
        quarter: Math.min(updatedQuarter, 4), // only 4 quarters
        score: updatedScore,
        possession: nextPossession,
        boxScore: updatedBoxScore,
        home: updatedHome,
        away: updatedAway
    };
}